-- ==============================================================================
-- EVENTHUB - REALISTIC SEED DATA (04_seed_data.sql)
-- Categories, sample demo organizer, events with ticket types and discounts
-- ==============================================================================

-- 1. Insert Event Categories
INSERT INTO public.event_categories (id, name, slug, description, icon_name) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'Música y Recitales', 'musica', 'Conciertos, festivales y música en vivo de todos los géneros', 'Music'),
    ('c1000000-0000-0000-0000-000000000002', 'Festivales & Fiestas', 'festivales', 'Grandes festivales al aire libre, fiestas temáticas y vida nocturna', 'PartyPopper'),
    ('c1000000-0000-0000-0000-000000000003', 'Tecnología & Startups', 'tecnologia', 'Conferencias tech, hackathons, inteligencia artificial e innovación', 'Cpu'),
    ('c1000000-0000-0000-0000-000000000004', 'Gastronomía & Vinos', 'gastronomia', 'Ferias culinarias, catas de vino, masterclasses y festivales gastronómicos', 'Utensils'),
    ('c1000000-0000-0000-0000-000000000005', 'Deportes & Maratones', 'deportes', 'Carreras 10k/21k, torneos de pádel, fútbol y competencias deportivas', 'Trophy'),
    ('c1000000-0000-0000-0000-000000000006', 'Cultura & Teatro', 'cultura', 'Obras teatrales, exposiciones de arte, comedia y stand-up', 'Theater')
ON CONFLICT (slug) DO NOTHING;

-- 2. Demo Organizer Profile Placeholder (linked to demo user or placeholder UUID)
-- Note: When a real user registers as ORGANIZER, they will have their own organizer row.
-- We create standard demo records:
DO $$
DECLARE
    v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_organizer_user_id UUID := 'b0000000-0000-0000-0000-000000000002';
    v_org_id UUID := 'd0000000-0000-0000-0000-000000000001';
    v_evt1 UUID := 'e1000000-0000-0000-0000-000000000001';
    v_evt2 UUID := 'e1000000-0000-0000-0000-000000000002';
    v_evt3 UUID := 'e1000000-0000-0000-0000-000000000003';
BEGIN
    -- Create demo profiles if they do not exist
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES 
        (v_admin_id, 'Admin EventHub', 'admin@eventhub.com', 'ADMIN'),
        (v_organizer_user_id, 'Producciones Neon Live', 'contacto@neonlive.com', 'ORGANIZER')
    ON CONFLICT (id) DO NOTHING;

    -- Create Organizer
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

    -- Event 1: Fiesta Electrónica
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

    -- Event 2: Tech Summit
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

    -- Event 3: Feria Gastronómica
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

    -- Ticket Types for Event 1 (Neon Echoes)
    INSERT INTO public.ticket_types (id, event_id, name, description, price, quantity, sold_quantity, max_per_order, is_active)
    VALUES 
        ('t1000000-0000-0000-0000-000000000001', v_evt1, 'Early Bird - General', 'Acceso general al festival. Ingreso antes de las 21:00 hs.', 12000.00, 300, 300, 4, false),
        ('t1000000-0000-0000-0000-000000000002', v_evt1, 'General - Preventa 1', 'Acceso general a todos los escenarios sin restricción de horario.', 18000.00, 1500, 142, 6, true),
        ('t1000000-0000-0000-0000-000000000003', v_evt1, 'VIP Lounge & Deck', 'Acceso prioritario, deck elevado con vista panorámica, baños exclusivos y barra propia.', 35000.00, 400, 89, 4, true)
    ON CONFLICT (id) DO NOTHING;

    -- Ticket Types for Event 2 (Tech Summit)
    INSERT INTO public.ticket_types (id, event_id, name, description, price, quantity, sold_quantity, max_per_order, is_active)
    VALUES 
        ('t1000000-0000-0000-0000-000000000004', v_evt2, 'Pase Académico / Estudiante', 'Acceso a conferencias generales y streaming de talleres.', 15000.00, 200, 45, 2, true),
        ('t1000000-0000-0000-0000-000000000005', v_evt2, 'Full Access Professional', 'Acceso completo a todos los tracks, lunch buffet, coffee breaks y after networking.', 45000.00, 800, 310, 5, true)
    ON CONFLICT (id) DO NOTHING;

    -- Ticket Types for Event 3 (Gastronomía)
    INSERT INTO public.ticket_types (id, event_id, name, description, price, quantity, sold_quantity, max_per_order, is_active)
    VALUES 
        ('t1000000-0000-0000-0000-000000000006', v_evt3, 'Entrada General + Copa de Degustación', 'Incluye copa de cristal oficial y 3 tokens de degustación.', 9500.00, 1000, 215, 6, true)
    ON CONFLICT (id) DO NOTHING;

    -- Discount Codes
    INSERT INTO public.discount_codes (id, organizer_id, event_id, code, type, value, max_uses, used_count, is_active)
    VALUES 
        ('d1000000-0000-0000-0000-000000000001', v_org_id, v_evt1, 'EVENTHUB20', 'percentage', 20.00, 500, 12, true),
        ('d1000000-0000-0000-0000-000000000002', v_org_id, v_evt1, 'AMIGOS5000', 'fixed', 5000.00, 100, 8, true)
    ON CONFLICT (id) DO NOTHING;

END $$;
