-- ==============================================================================
-- EVENTHUB - FUNCTIONS, TRIGGERS & ATOMIC PROCEDURES (02_functions_and_triggers.sql)
-- ==============================================================================

-- 1. TRIGGER: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_organizers_updated_at ON public.organizers;
CREATE TRIGGER set_organizers_updated_at BEFORE UPDATE ON public.organizers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_ticket_types_updated_at ON public.ticket_types;
CREATE TRIGGER set_ticket_types_updated_at BEFORE UPDATE ON public.ticket_types
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tickets_updated_at ON public.tickets;
CREATE TRIGGER set_tickets_updated_at BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 2. TRIGGER: Auto-create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_role public.user_role;
BEGIN
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'USER'::public.user_role);

    INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
    VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        v_role
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. HELPER FUNCTIONS FOR SECURITY & ROLE VERIFICATION
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
    SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_event_organizer(p_event_id UUID)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.events e
        JOIN public.organizers o ON e.organizer_id = o.id
        WHERE e.id = p_event_id AND (o.user_id = auth.uid() OR public.is_admin())
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_event_staff(p_event_id UUID)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.event_staff es
        WHERE es.event_id = p_event_id AND es.user_id = auth.uid()
    ) OR public.is_event_organizer(p_event_id) OR public.is_admin();
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- 4. ATOMIC CHECKOUT PROCEDURE (ANTI-OVERSELLING & CONCURRENCY SAFE)
-- Processes cart items, verifies & locks stock with FOR UPDATE, applies discount,
-- creates order, order items, increments sold quantity, and generates individual tickets.
CREATE OR REPLACE FUNCTION public.process_checkout(
    p_user_id UUID,
    p_event_id UUID,
    p_items JSONB, -- Array of { "ticket_type_id": "...", "quantity": 2 }
    p_discount_code TEXT DEFAULT NULL,
    p_attendee_info JSONB DEFAULT NULL, -- Optional { "attendee_name": "...", "attendee_email": "..." }
    p_payment_method TEXT DEFAULT 'demo_card'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_subtotal NUMERIC(12, 2) := 0;
    v_discount_amount NUMERIC(12, 2) := 0;
    v_total NUMERIC(12, 2) := 0;
    v_discount_id UUID := NULL;
    v_discount_rec RECORD;
    v_item RECORD;
    v_tt RECORD;
    v_generated_tickets JSONB := '[]'::JSONB;
    v_user_profile RECORD;
    v_att_name TEXT;
    v_att_email TEXT;
    v_prefix TEXT;
    v_ticket_code TEXT;
    v_qr_token TEXT;
    v_ticket_id UUID;
    i INT;
BEGIN
    -- 1. Verify User Profile
    SELECT * INTO v_user_profile FROM public.profiles WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'USER_NOT_FOUND: El usuario especificado no existe';
    END IF;

    v_att_name := COALESCE(p_attendee_info->>'attendee_name', v_user_profile.full_name);
    v_att_email := COALESCE(p_attendee_info->>'attendee_email', v_user_profile.email);

    -- 2. Validate Discount Code if provided (with lock)
    IF p_discount_code IS NOT NULL AND trim(p_discount_code) <> '' THEN
        SELECT * INTO v_discount_rec 
        FROM public.discount_codes 
        WHERE code = upper(trim(p_discount_code))
          AND is_active = true
          AND (event_id = p_event_id OR event_id IS NULL)
          AND (starts_at IS NULL OR starts_at <= now())
          AND (expires_at IS NULL OR expires_at >= now())
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'INVALID_DISCOUNT: Código de descuento inválido o expirado';
        END IF;

        IF v_discount_rec.used_count >= v_discount_rec.max_uses THEN
            RAISE EXCEPTION 'DISCOUNT_EXHAUSTED: El código de descuento ha alcanzado su límite de usos';
        END IF;

        v_discount_id := v_discount_rec.id;
    END IF;

    -- 3. Calculate subtotal and lock each ticket type with FOR UPDATE (Prevents Overselling)
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (ticket_type_id UUID, quantity INT)
    LOOP
        IF v_item.quantity <= 0 THEN
            RAISE EXCEPTION 'INVALID_QUANTITY: La cantidad debe ser mayor a cero';
        END IF;

        SELECT * INTO v_tt
        FROM public.ticket_types
        WHERE id = v_item.ticket_type_id AND event_id = p_event_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'TICKET_TYPE_NOT_FOUND: Tipo de entrada no encontrado en este evento';
        END IF;

        IF NOT v_tt.is_active THEN
            RAISE EXCEPTION 'TICKET_NOT_ACTIVE: El tipo de entrada % ya no está a la venta', v_tt.name;
        END IF;

        -- Strict stock validation
        IF (v_tt.sold_quantity + v_item.quantity) > v_tt.quantity THEN
            RAISE EXCEPTION 'STOCK_EXCEEDED: No hay suficiente stock para %. Disponibles: %', 
                v_tt.name, (v_tt.quantity - v_tt.sold_quantity);
        END IF;

        v_subtotal := v_subtotal + (v_tt.price * v_item.quantity);
    END LOOP;

    -- 4. Apply discount calculation
    IF v_discount_rec.id IS NOT NULL THEN
        IF v_discount_rec.type = 'percentage' THEN
            v_discount_amount := round((v_subtotal * (v_discount_rec.value / 100.0)), 2);
        ELSE
            v_discount_amount := least(v_subtotal, v_discount_rec.value);
        END IF;
    END IF;

    v_total := greatest(0, v_subtotal - v_discount_amount);

    -- 5. Generate unique Order Number: ORD-YYYYMMDD-HEX6
    v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

    -- 6. Insert Order
    INSERT INTO public.orders (
        order_number, user_id, event_id, discount_code_id,
        subtotal, discount_amount, total, status, payment_status,
        payment_method, payment_reference
    )
    VALUES (
        v_order_number, p_user_id, p_event_id, v_discount_id,
        v_subtotal, v_discount_amount, v_total, 'confirmed', 'paid',
        p_payment_method, 'DEMO-TX-' || upper(substring(md5(random()::text) from 1 for 10))
    )
    RETURNING id INTO v_order_id;

    -- 7. If discount was used, increment used_count
    IF v_discount_id IS NOT NULL THEN
        UPDATE public.discount_codes 
        SET used_count = used_count + 1 
        WHERE id = v_discount_id;
    END IF;

    -- Event prefix for human-friendly ticket codes
    v_prefix := 'EVT-' || upper(substring(replace(p_event_id::text, '-', '') from 1 for 4));

    -- 8. Insert Order Items, update stock, and generate individual tickets
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (ticket_type_id UUID, quantity INT)
    LOOP
        SELECT * INTO v_tt FROM public.ticket_types WHERE id = v_item.ticket_type_id;

        -- Insert order item
        INSERT INTO public.order_items (order_id, ticket_type_id, quantity, unit_price, subtotal)
        VALUES (v_order_id, v_tt.id, v_item.quantity, v_tt.price, (v_tt.price * v_item.quantity));

        -- Increment sold_quantity
        UPDATE public.ticket_types
        SET sold_quantity = sold_quantity + v_item.quantity
        WHERE id = v_tt.id;

        -- Generate individual ticket for each quantity unit
        FOR i IN 1..v_item.quantity LOOP
            v_ticket_code := v_prefix || '-' || upper(substring(md5(random()::text || clock_timestamp()::text || i::text) from 1 for 6));
            v_qr_token := gen_random_uuid()::text;

            INSERT INTO public.tickets (
                order_id, event_id, ticket_type_id, user_id,
                attendee_name, attendee_email, ticket_code, qr_token, status
            )
            VALUES (
                v_order_id, p_event_id, v_tt.id, p_user_id,
                v_att_name, v_att_email, v_ticket_code, v_qr_token, 'valid'
            )
            RETURNING id INTO v_ticket_id;

            v_generated_tickets := v_generated_tickets || jsonb_build_object(
                'id', v_ticket_id,
                'ticket_code', v_ticket_code,
                'qr_token', v_qr_token,
                'ticket_type_name', v_tt.name,
                'price', v_tt.price,
                'status', 'valid'
            );
        END LOOP;
    END LOOP;

    -- Return success payload
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'discount_amount', v_discount_amount,
        'total', v_total,
        'tickets_count', jsonb_array_length(v_generated_tickets),
        'tickets', v_generated_tickets
    );
END;
$$;


-- 5. ATOMIC VALIDATE & CHECK-IN PROCEDURE (ANTI-DOUBLE CHECK-IN & CONCURRENCY SAFE)
-- Strictly validates QR, locks ticket with FOR UPDATE, prevents concurrent duplicate access.
CREATE OR REPLACE FUNCTION public.validate_and_checkin_ticket(
    p_qr_token TEXT,
    p_event_id UUID,
    p_staff_user_id UUID,
    p_device_info JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ticket RECORD;
    v_clean_token TEXT;
    v_event_title TEXT;
    v_ticket_type_name TEXT;
    v_first_checkin TIMESTAMPTZ;
BEGIN
    -- Extract token if formatted as EVENTHUB:TICKET:<token>
    IF p_qr_token LIKE 'EVENTHUB:TICKET:%' THEN
        v_clean_token := substring(p_qr_token from 17);
    ELSE
        v_clean_token := trim(p_qr_token);
    END IF;

    -- 1. Verify staff permission for this event
    IF NOT (
        EXISTS (SELECT 1 FROM public.event_staff WHERE event_id = p_event_id AND user_id = p_staff_user_id)
        OR EXISTS (
            SELECT 1 FROM public.events e 
            JOIN public.organizers o ON e.organizer_id = o.id 
            WHERE e.id = p_event_id AND o.user_id = p_staff_user_id
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = p_staff_user_id AND role = 'ADMIN')
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNAUTHORIZED',
            'message', 'No tienes autorización para validar entradas de este evento'
        );
    END IF;

    -- 2. Lock ticket row FOR UPDATE (Critical Anti-Concurrency measure)
    SELECT t.*, tt.name as ticket_type_name, e.title as event_title
    INTO v_ticket
    FROM public.tickets t
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    JOIN public.events e ON t.event_id = e.id
    WHERE t.qr_token = v_clean_token
    FOR UPDATE OF t;

    -- Check if ticket exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'NOT_FOUND',
            'message', 'Código QR inválido o no encontrado en el sistema'
        );
    END IF;

    -- 3. Check event match
    IF v_ticket.event_id <> p_event_id THEN
        INSERT INTO public.checkins (ticket_id, event_id, staff_user_id, result, device_info, notes)
        VALUES (v_ticket.id, p_event_id, p_staff_user_id, 'invalid_event', p_device_info, 'Intento de acceso en evento erróneo');

        RETURN jsonb_build_object(
            'success', false,
            'code', 'INVALID_EVENT',
            'message', 'Esta entrada pertenece a otro evento (' || v_ticket.event_title || ')',
            'ticket_code', v_ticket.ticket_code
        );
    END IF;

    -- 4. Check if already used
    IF v_ticket.status = 'used' OR v_ticket.checked_in_at IS NOT NULL THEN
        INSERT INTO public.checkins (ticket_id, event_id, staff_user_id, result, device_info, notes)
        VALUES (v_ticket.id, p_event_id, p_staff_user_id, 'already_used', p_device_info, 'Entrada ya registrada');

        RETURN jsonb_build_object(
            'success', false,
            'code', 'ALREADY_USED',
            'message', 'Entrada YA UTILIZADA',
            'ticket_code', v_ticket.ticket_code,
            'first_checkin_at', v_ticket.checked_in_at,
            'attendee_name', v_ticket.attendee_name,
            'ticket_type', v_ticket.ticket_type_name
        );
    END IF;

    -- 5. Check if cancelled
    IF v_ticket.status = 'cancelled' THEN
        INSERT INTO public.checkins (ticket_id, event_id, staff_user_id, result, device_info, notes)
        VALUES (v_ticket.id, p_event_id, p_staff_user_id, 'cancelled', p_device_info, 'Entrada anulada');

        RETURN jsonb_build_object(
            'success', false,
            'code', 'CANCELLED',
            'message', 'Esta entrada se encuentra cancelada',
            'ticket_code', v_ticket.ticket_code
        );
    END IF;

    -- 6. Ticket is valid! Perform atomic update
    UPDATE public.tickets
    SET status = 'used',
        checked_in_at = timezone('utc'::text, now()),
        checked_in_by = p_staff_user_id,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_ticket.id;

    -- Record successful check-in
    INSERT INTO public.checkins (ticket_id, event_id, staff_user_id, result, device_info)
    VALUES (v_ticket.id, p_event_id, p_staff_user_id, 'valid', p_device_info);

    RETURN jsonb_build_object(
        'success', true,
        'code', 'VALID',
        'message', 'Acceso permitido',
        'attendee_name', v_ticket.attendee_name,
        'ticket_code', v_ticket.ticket_code,
        'ticket_type', v_ticket.ticket_type_name,
        'event_title', v_ticket.event_title,
        'checked_in_at', timezone('utc'::text, now())
    );
END;
$$;
