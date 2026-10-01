-- ==============================================================================
-- EVENTHUB - CONSOLIDATED SCHEMA, FUNCTIONS, RLS & SEED (ONE-CLICK EXECUTION)
-- Run this script in the Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ORGANIZER', 'STAFF', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'USER',
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    website_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    image_url TEXT,
    venue_name TEXT NOT NULL,
    venue_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL DEFAULT 'Argentina',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'finished')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_event_dates CHECK (ends_at >= starts_at)
);

CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    currency TEXT NOT NULL DEFAULT 'ARS',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    sold_quantity INTEGER NOT NULL DEFAULT 0 CHECK (sold_quantity >= 0),
    sale_starts_at TIMESTAMPTZ,
    sale_ends_at TIMESTAMPTZ,
    max_per_order INTEGER NOT NULL DEFAULT 5 CHECK (max_per_order > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_ticket_stock CHECK (sold_quantity <= quantity)
);

CREATE TABLE IF NOT EXISTS public.discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC(12, 2) NOT NULL CHECK (value > 0),
    max_uses INTEGER NOT NULL DEFAULT 100 CHECK (max_uses > 0),
    used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    starts_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_discount_uses CHECK (used_count <= max_uses)
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    discount_code_id UUID REFERENCES public.discount_codes(id) ON DELETE SET NULL,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT NOT NULL DEFAULT 'demo_gateway',
    payment_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    ticket_code TEXT NOT NULL UNIQUE,
    qr_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled')),
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    staff_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    result TEXT NOT NULL CHECK (result IN ('valid', 'already_used', 'invalid_event', 'cancelled', 'unpaid', 'not_found')),
    device_info JSONB,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.event_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'scanner' CHECK (role IN ('scanner', 'lead')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_event_staff UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_event_favorite UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON public.ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_token ON public.tickets(qr_token);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_code ON public.tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

CREATE INDEX IF NOT EXISTS idx_checkins_ticket_id ON public.checkins(ticket_id);
CREATE INDEX IF NOT EXISTS idx_checkins_event_id ON public.checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON public.checkins(checked_in_at);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- 4. PROCEDURES & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Security helpers
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

-- ATOMIC CHECKOUT
CREATE OR REPLACE FUNCTION public.process_checkout(
    p_user_id UUID,
    p_event_id UUID,
    p_items JSONB,
    p_discount_code TEXT DEFAULT NULL,
    p_attendee_info JSONB DEFAULT NULL,
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
    SELECT * INTO v_user_profile FROM public.profiles WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'USER_NOT_FOUND: El usuario especificado no existe';
    END IF;

    v_att_name := COALESCE(p_attendee_info->>'attendee_name', v_user_profile.full_name);
    v_att_email := COALESCE(p_attendee_info->>'attendee_email', v_user_profile.email);

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

        IF (v_tt.sold_quantity + v_item.quantity) > v_tt.quantity THEN
            RAISE EXCEPTION 'STOCK_EXCEEDED: No hay suficiente stock para %. Disponibles: %', 
                v_tt.name, (v_tt.quantity - v_tt.sold_quantity);
        END IF;

        v_subtotal := v_subtotal + (v_tt.price * v_item.quantity);
    END LOOP;

    IF v_discount_rec.id IS NOT NULL THEN
        IF v_discount_rec.type = 'percentage' THEN
            v_discount_amount := round((v_subtotal * (v_discount_rec.value / 100.0)), 2);
        ELSE
            v_discount_amount := least(v_subtotal, v_discount_rec.value);
        END IF;
    END IF;

    v_total := greatest(0, v_subtotal - v_discount_amount);
    v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

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

    IF v_discount_id IS NOT NULL THEN
        UPDATE public.discount_codes 
        SET used_count = used_count + 1 
        WHERE id = v_discount_id;
    END IF;

    v_prefix := 'EVT-' || upper(substring(replace(p_event_id::text, '-', '') from 1 for 4));

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (ticket_type_id UUID, quantity INT)
    LOOP
        SELECT * INTO v_tt FROM public.ticket_types WHERE id = v_item.ticket_type_id;

        INSERT INTO public.order_items (order_id, ticket_type_id, quantity, unit_price, subtotal)
        VALUES (v_order_id, v_tt.id, v_item.quantity, v_tt.price, (v_tt.price * v_item.quantity));

        UPDATE public.ticket_types
        SET sold_quantity = sold_quantity + v_item.quantity
        WHERE id = v_tt.id;

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

-- ATOMIC VALIDATION & CHECK-IN
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
BEGIN
    IF p_qr_token LIKE 'EVENTHUB:TICKET:%' THEN
        v_clean_token := substring(p_qr_token from 17);
    ELSE
        v_clean_token := trim(p_qr_token);
    END IF;

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

    SELECT t.*, tt.name as ticket_type_name, e.title as event_title
    INTO v_ticket
    FROM public.tickets t
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    JOIN public.events e ON t.event_id = e.id
    WHERE t.qr_token = v_clean_token
    FOR UPDATE OF t;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'NOT_FOUND',
            'message', 'Código QR inválido o no encontrado en el sistema'
        );
    END IF;

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

    UPDATE public.tickets
    SET status = 'used',
        checked_in_at = timezone('utc'::text, now()),
        checked_in_by = p_staff_user_id,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_ticket.id;

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

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin()));

CREATE POLICY "Organizers are viewable by everyone" ON public.organizers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create an organizer profile" ON public.organizers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organizer owners can update their profile" ON public.organizers FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Categories are viewable by everyone" ON public.event_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON public.event_categories FOR ALL USING (public.is_admin());

CREATE POLICY "Published events are viewable by everyone" ON public.events FOR SELECT USING (
    status = 'published' OR (auth.uid() IS NOT NULL AND (
        EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid()) OR public.is_admin()
    ))
);
CREATE POLICY "Organizers can create events" ON public.events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY "Organizers can update their own events" ON public.events FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY "Organizers can delete their own events" ON public.events FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid()) OR public.is_admin()
);

CREATE POLICY "Ticket types are viewable by everyone for published events" ON public.ticket_types FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published') OR public.is_event_organizer(event_id)
);
CREATE POLICY "Organizers can manage ticket types" ON public.ticket_types FOR ALL USING (public.is_event_organizer(event_id));

CREATE POLICY "Organizers can manage their discount codes" ON public.discount_codes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid()) OR public.is_admin()
);

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
    auth.uid() = user_id OR public.is_event_organizer(event_id) OR public.is_admin()
);
CREATE POLICY "Authenticated users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view items in their orders" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_event_organizer(o.event_id) OR public.is_admin()))
);

CREATE POLICY "Users can view their purchased tickets" ON public.tickets FOR SELECT USING (
    auth.uid() = user_id OR public.is_event_organizer(event_id) OR public.is_event_staff(event_id) OR public.is_admin()
);
CREATE POLICY "Only admins or system procedures can directly update tickets" ON public.tickets FOR UPDATE USING (public.is_admin());

CREATE POLICY "Staff and organizers can view checkins" ON public.checkins FOR SELECT USING (
    public.is_event_staff(event_id) OR public.is_event_organizer(event_id) OR public.is_admin()
);
CREATE POLICY "Authorized staff can insert checkins" ON public.checkins FOR INSERT WITH CHECK (
    public.is_event_staff(event_id) OR public.is_admin()
);

CREATE POLICY "Organizers and assigned staff can view staff lists" ON public.event_staff FOR SELECT USING (
    public.is_event_organizer(event_id) OR user_id = auth.uid() OR public.is_admin()
);
CREATE POLICY "Event organizers can manage staff" ON public.event_staff FOR ALL USING (
    public.is_event_organizer(event_id) OR public.is_admin()
);

CREATE POLICY "Users can view their favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());

-- 6. SEED DATA
INSERT INTO public.event_categories (id, name, slug, description, icon_name) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'Música y Recitales', 'musica', 'Conciertos, festivales y música en vivo de todos los géneros', 'Music'),
    ('c1000000-0000-0000-0000-000000000002', 'Festivales & Fiestas', 'festivales', 'Grandes festivales al aire libre, fiestas temáticas y vida nocturna', 'PartyPopper'),
    ('c1000000-0000-0000-0000-000000000003', 'Tecnología & Startups', 'tecnologia', 'Conferencias tech, hackathons, inteligencia artificial e innovación', 'Cpu'),
    ('c1000000-0000-0000-0000-000000000004', 'Gastronomía & Vinos', 'gastronomia', 'Ferias culinarias, catas de vino, masterclasses y festivales gastronómicos', 'Utensils'),
    ('c1000000-0000-0000-0000-000000000005', 'Deportes & Maratones', 'deportes', 'Carreras 10k/21k, torneos de pádel, fútbol y competencias deportivas', 'Trophy'),
    ('c1000000-0000-0000-0000-000000000006', 'Cultura & Teatro', 'cultura', 'Obras teatrales, exposiciones de arte, comedia y stand-up', 'Theater')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
    v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_organizer_user_id UUID := 'b0000000-0000-0000-0000-000000000002';
    v_org_id UUID := 'd0000000-0000-0000-0000-000000000001';
    v_evt1 UUID := 'e1000000-0000-0000-0000-000000000001';
    v_evt2 UUID := 'e1000000-0000-0000-0000-000000000002';
    v_evt3 UUID := 'e1000000-0000-0000-0000-000000000003';
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES 
        (v_admin_id, 'Admin EventHub', 'admin@eventhub.com', 'ADMIN'),
        (v_organizer_user_id, 'Producciones Neon Live', 'contacto@neonlive.com', 'ORGANIZER')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.organizers (id, user_id, name, slug, description, contact_email, contact_phone, website_url)
    VALUES (
        v_org_id,
        v_organizer_user_id,
        'Neon Live Producciones',
        'neon-live',
        'Productora líder de festivales y experiencias inmersivas de música electrónica, rock y cultura urbana.',
        'contacto@neonlive.com',
        '+54 11 5555-0199',
        'https://neonlive.example.com'
    )
    ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description;

    INSERT INTO public.events (
        id, organizer_id, category_id, title, slug, description, short_description,
        image_url, venue_name, venue_address, city, state, starts_at, ends_at, capacity, status, is_featured, published_at
    ) VALUES (
        v_evt1,
        v_org_id,
        'c1000000-0000-0000-0000-000000000002',
        'Neon Echoes: Sunset Festival 2026',
        'neon-echoes-sunset-festival-2026',
        'Una experiencia sonora y visual sin precedentes. 3 escenarios simultáneos, más de 20 DJs internacionales de Melodic Techno y Progressive House, arte lumínico interactivo y zona gastronómica premium. Prohibido el ingreso a menores de 18 años.',
        'El festival de música electrónica más esperado de la temporada con DJs internacionales y visuales 360°.',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
        'Costanera Norte Arena',
        'Av. Costanera Rafael Obligado 6155',
        'Buenos Aires',
        'CABA',
        NOW() + INTERVAL '14 days' + INTERVAL '18 hours',
        NOW() + INTERVAL '15 days' + INTERVAL '6 hours',
        3500,
        'published',
        true,
        NOW()
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.events (
        id, organizer_id, category_id, title, slug, description, short_description,
        image_url, venue_name, venue_address, city, state, starts_at, ends_at, capacity, status, is_featured, published_at
    ) VALUES (
        v_evt2,
        v_org_id,
        'c1000000-0000-0000-0000-000000000003',
        'AI & Cloud Future Summit 2026',
        'ai-cloud-future-summit-2026',
        'El encuentro de referencia para líderes técnicos, desarrolladores y fundadores. Keynotes sobre Inteligencia Artificial Generativa, arquitecturas serverless de alta escala, ciberseguridad y networking de primer nivel.',
        'Conferencia cumbre sobre Inteligencia Artificial, computación distribuida y startups de alto impacto.',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
        'Centro de Convenciones Golden Center',
        'Av. Cantilo s/n',
        'Buenos Aires',
        'CABA',
        NOW() + INTERVAL '28 days' + INTERVAL '9 hours',
        NOW() + INTERVAL '28 days' + INTERVAL '19 hours',
        1200,
        'published',
        true,
        NOW()
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.events (
        id, organizer_id, category_id, title, slug, description, short_description,
        image_url, venue_name, venue_address, city, state, starts_at, ends_at, capacity, status, is_featured, published_at
    ) VALUES (
        v_evt3,
        v_org_id,
        'c1000000-0000-0000-0000-000000000004',
        'Sabores & Fuego: Festival Culinario',
        'sabores-y-fuego-festival-culinario',
        'El festival gastronómico que reúne a los mejores maestros parrilleros, bodegas boutique y food trucks de autor. Degustaciones guiadas, shows acústicos al atardecer y espacio pet-friendly.',
        'Feria al aire libre de fuegos, vinos boutique y gastronomía gourmet con música en vivo.',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80',
        'Parque Hipódromo',
        'Av. del Libertador 4101',
        'Buenos Aires',
        'CABA',
        NOW() + INTERVAL '35 days' + INTERVAL '12 hours',
        NOW() + INTERVAL '35 days' + INTERVAL '23 hours',
        2500,
        'published',
        false,
        NOW()
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.ticket_types (id, event_id, name, description, price, quantity, sold_quantity, max_per_order, is_active)
    VALUES 
        ('t1000000-0000-0000-0000-000000000001', v_evt1, 'Early Bird - General', 'Acceso general al festival. Ingreso antes de las 21:00 hs.', 12000.00, 300, 300, 4, false),
        ('t1000000-0000-0000-0000-000000000002', v_evt1, 'General - Preventa 1', 'Acceso general a todos los escenarios sin restricción de horario.', 18000.00, 1500, 142, 6, true),
        ('t1000000-0000-0000-0000-000000000003', v_evt1, 'VIP Lounge & Deck', 'Acceso prioritario, deck elevado con vista panorámica, baños exclusivos y barra propia.', 35000.00, 400, 89, 4, true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.ticket_types (id, event_id, name, description, price, quantity, sold_quantity, max_per_order, is_active)
    VALUES 
        ('t1000000-0000-0000-0000-000000000004', v_evt2, 'Pase Académico / Estudiante', 'Acceso a conferencias generales y streaming de talleres.', 15000.00, 200, 45, 2, true),
        ('t1000000-0000-0000-0000-000000000005', v_evt2, 'Full Access Professional', 'Acceso completo a todos los tracks, lunch buffet, coffee breaks y after networking.', 45000.00, 800, 310, 5, true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.ticket_types (id, event_id, name, description, price, quantity, sold_quantity, max_per_order, is_active)
    VALUES 
        ('t1000000-0000-0000-0000-000000000006', v_evt3, 'Entrada General + Copa de Degustación', 'Incluye copa de cristal oficial y 3 tokens de degustación.', 9500.00, 1000, 215, 6, true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.discount_codes (id, organizer_id, event_id, code, type, value, max_uses, used_count, is_active)
    VALUES 
        ('d1000000-0000-0000-0000-000000000001', v_org_id, v_evt1, 'EVENTHUB20', 'percentage', 20.00, 500, 12, true),
        ('d1000000-0000-0000-0000-000000000002', v_org_id, v_evt1, 'AMIGOS5000', 'fixed', 5000.00, 100, 8, true)
    ON CONFLICT (id) DO NOTHING;

END $$;
