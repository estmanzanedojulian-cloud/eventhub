-- ==============================================================================
-- EVENTHUB - ROW LEVEL SECURITY POLICIES (03_rls_policies.sql)
-- ==============================================================================

-- Enable RLS on all tables
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

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        -- Prevent privilege escalation: non-admin cannot alter their own role
        AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
    );

-- 2. ORGANIZERS POLICIES
CREATE POLICY "Organizers are viewable by everyone"
    ON public.organizers FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create an organizer profile"
    ON public.organizers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizer owners can update their profile"
    ON public.organizers FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin());

-- 3. EVENT CATEGORIES POLICIES
CREATE POLICY "Categories are viewable by everyone"
    ON public.event_categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage categories"
    ON public.event_categories FOR ALL
    USING (public.is_admin());

-- 4. EVENTS POLICIES
CREATE POLICY "Published events are viewable by everyone"
    ON public.events FOR SELECT
    USING (
        status = 'published' 
        OR (auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid())
            OR public.is_admin()
        ))
    );

CREATE POLICY "Organizers can create events"
    ON public.events FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Organizers can update their own events"
    ON public.events FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Organizers can delete their own events"
    ON public.events FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid())
        OR public.is_admin()
    );

-- 5. TICKET TYPES POLICIES
CREATE POLICY "Ticket types are viewable by everyone for published events"
    ON public.ticket_types FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published')
        OR public.is_event_organizer(event_id)
    );

CREATE POLICY "Organizers can manage ticket types"
    ON public.ticket_types FOR ALL
    USING (public.is_event_organizer(event_id));

-- 6. DISCOUNT CODES POLICIES
CREATE POLICY "Organizers can manage their discount codes"
    ON public.discount_codes FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid())
        OR public.is_admin()
    );

-- 7. ORDERS POLICIES
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = user_id 
        OR public.is_event_organizer(event_id)
        OR public.is_admin()
    );

CREATE POLICY "Authenticated users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 8. ORDER ITEMS POLICIES
CREATE POLICY "Users can view items in their orders"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o 
            WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_event_organizer(o.event_id) OR public.is_admin())
        )
    );

-- 9. TICKETS POLICIES
CREATE POLICY "Users can view their purchased tickets"
    ON public.tickets FOR SELECT
    USING (
        auth.uid() = user_id 
        OR public.is_event_organizer(event_id)
        OR public.is_event_staff(event_id)
        OR public.is_admin()
    );

-- Ticket modifications are strictly guarded via SECURITY DEFINER functions (validate_and_checkin_ticket)
CREATE POLICY "Only admins or system procedures can directly update tickets"
    ON public.tickets FOR UPDATE
    USING (public.is_admin());

-- 10. CHECK-INS POLICIES
CREATE POLICY "Staff and organizers can view checkins"
    ON public.checkins FOR SELECT
    USING (
        public.is_event_staff(event_id)
        OR public.is_event_organizer(event_id)
        OR public.is_admin()
    );

CREATE POLICY "Authorized staff can insert checkins"
    ON public.checkins FOR INSERT
    WITH CHECK (
        public.is_event_staff(event_id)
        OR public.is_admin()
    );

-- 11. EVENT STAFF POLICIES
CREATE POLICY "Organizers and assigned staff can view staff lists"
    ON public.event_staff FOR SELECT
    USING (
        public.is_event_organizer(event_id) 
        OR user_id = auth.uid() 
        OR public.is_admin()
    );

CREATE POLICY "Event organizers can manage staff"
    ON public.event_staff FOR ALL
    USING (
        public.is_event_organizer(event_id)
        OR public.is_admin()
    );

-- 12. FAVORITES POLICIES
CREATE POLICY "Users can view their favorites"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
    ON public.favorites FOR DELETE
    USING (auth.uid() = user_id);

-- 13. AUDIT LOGS POLICIES
CREATE POLICY "Only admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());
