import { createClient } from '@/lib/supabase/client';
import { EventWithDetails } from '@/types/event.types';

// Fallback seed dataset matching the SQL migration exactly
export const SEED_EVENTS: EventWithDetails[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    organizer_id: 'd1000000-0000-0000-0000-000000000001',
    category_id: 'c1000000-0000-0000-0000-000000000002',
    title: 'Neon Echoes: Sunset Festival 2026',
    slug: 'neon-echoes-sunset-festival-2026',
    description: 'Una experiencia sonora y visual sin precedentes. 3 escenarios simultáneos, más de 20 DJs internacionales de Melodic Techno y Progressive House, arte lumínico interactivo y zona gastronómica premium. Prohibido el ingreso a menores de 18 años.',
    short_description: 'El festival de música electrónica más esperado de la temporada con DJs internacionales y visuales 360°.',
    image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
    venue_name: 'Costanera Norte Arena',
    venue_address: 'Av. Costanera Rafael Obligado 6155',
    city: 'Buenos Aires',
    state: 'CABA',
    country: 'Argentina',
    latitude: -34.551,
    longitude: -58.423,
    starts_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
    capacity: 3500,
    status: 'published',
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    organizer: {
      id: 'd1000000-0000-0000-0000-000000000001',
      user_id: 'b0000000-0000-0000-0000-000000000002',
      name: 'Neon Live Producciones',
      slug: 'neon-live',
      description: 'Productora líder de festivales y experiencias inmersivas.',
      logo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=200&q=80',
      banner_url: null,
      contact_email: 'contacto@neonlive.com',
      contact_phone: '+54 11 5555-0199',
      website_url: 'https://neonlive.example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    category: {
      id: 'c1000000-0000-0000-0000-000000000002',
      name: 'Festivales & Fiestas',
      slug: 'festivales',
      description: 'Grandes festivales al aire libre',
      icon_name: 'PartyPopper',
      created_at: new Date().toISOString(),
    },
    ticket_types: [
      {
        id: 't1000000-0000-0000-0000-000000000001',
        event_id: 'e1000000-0000-0000-0000-000000000001',
        name: 'Early Bird - General',
        description: 'Ingreso antes de las 21:00 hs',
        price: 12000,
        currency: 'ARS',
        quantity: 300,
        sold_quantity: 300, // Sold out!
        sale_starts_at: null,
        sale_ends_at: null,
        max_per_order: 4,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 't1000000-0000-0000-0000-000000000002',
        event_id: 'e1000000-0000-0000-0000-000000000001',
        name: 'General - Preventa 1',
        description: 'Acceso general sin restricción de horario',
        price: 18000,
        currency: 'ARS',
        quantity: 1500,
        sold_quantity: 142,
        sale_starts_at: null,
        sale_ends_at: null,
        max_per_order: 6,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 't1000000-0000-0000-0000-000000000003',
        event_id: 'e1000000-0000-0000-0000-000000000001',
        name: 'VIP Lounge & Deck',
        description: 'Deck elevado, baños exclusivos, barra propia y fast pass',
        price: 35000,
        currency: 'ARS',
        quantity: 400,
        sold_quantity: 89,
        sale_starts_at: null,
        sale_ends_at: null,
        max_per_order: 4,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    lowest_price: 18000,
    available_tickets: 1669,
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    organizer_id: 'd1000000-0000-0000-0000-000000000001',
    category_id: 'c1000000-0000-0000-0000-000000000003',
    title: 'AI & Cloud Future Summit 2026',
    slug: 'ai-cloud-future-summit-2026',
    description: 'El encuentro de referencia para líderes técnicos, desarrolladores y fundadores. Keynotes sobre Inteligencia Artificial Generativa, arquitecturas serverless de alta escala, ciberseguridad y networking de primer nivel.',
    short_description: 'Conferencia cumbre sobre Inteligencia Artificial, computación distribuida y startups de alto impacto.',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    venue_name: 'Centro de Convenciones Golden Center',
    venue_address: 'Av. Cantilo s/n',
    city: 'Buenos Aires',
    state: 'CABA',
    country: 'Argentina',
    latitude: -34.542,
    longitude: -58.435,
    starts_at: new Date(Date.now() + 28 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 28 * 24 * 3600 * 1000 + 10 * 3600 * 1000).toISOString(),
    capacity: 1200,
    status: 'published',
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    organizer: {
      id: 'd1000000-0000-0000-0000-000000000001',
      user_id: 'b0000000-0000-0000-0000-000000000002',
      name: 'Tech Ventures Community',
      slug: 'tech-ventures',
      description: 'Comunidad líder de innovación tecnológica.',
      logo_url: null,
      banner_url: null,
      contact_email: 'contacto@techventures.com',
      contact_phone: null,
      website_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    category: {
      id: 'c1000000-0000-0000-0000-000000000003',
      name: 'Tecnología & Startups',
      slug: 'tecnologia',
      description: 'Conferencias tech e IA',
      icon_name: 'Cpu',
      created_at: new Date().toISOString(),
    },
    ticket_types: [
      {
        id: 't1000000-0000-0000-0000-000000000004',
        event_id: 'e1000000-0000-0000-0000-000000000002',
        name: 'Pase Académico / Estudiante',
        description: 'Acceso a conferencias y streaming',
        price: 15000,
        currency: 'ARS',
        quantity: 200,
        sold_quantity: 45,
        sale_starts_at: null,
        sale_ends_at: null,
        max_per_order: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 't1000000-0000-0000-0000-000000000005',
        event_id: 'e1000000-0000-0000-0000-000000000002',
        name: 'Full Access Professional',
        description: 'Acceso completo a todos los tracks, lunch buffet y networking VIP',
        price: 45000,
        currency: 'ARS',
        quantity: 800,
        sold_quantity: 310,
        sale_starts_at: null,
        sale_ends_at: null,
        max_per_order: 5,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    lowest_price: 15000,
    available_tickets: 645,
  },
  {
    id: 'e1000000-0000-0000-0000-000000000003',
    organizer_id: 'd1000000-0000-0000-0000-000000000001',
    category_id: 'c1000000-0000-0000-0000-000000000004',
    title: 'Sabores & Fuego: Festival Culinario',
    slug: 'sabores-y-fuego-festival-culinario',
    description: 'El festival gastronómico que reúne a los mejores maestros parrilleros, bodegas boutique y food trucks de autor. Degustaciones guiadas, shows acústicos al atardecer y espacio pet-friendly.',
    short_description: 'Feria al aire libre de fuegos, vinos boutique y gastronomía gourmet con música en vivo.',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80',
    venue_name: 'Parque Hipódromo',
    venue_address: 'Av. del Libertador 4101',
    city: 'Buenos Aires',
    state: 'CABA',
    country: 'Argentina',
    latitude: -34.568,
    longitude: -58.428,
    starts_at: new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 35 * 24 * 3600 * 1000 + 11 * 3600 * 1000).toISOString(),
    capacity: 2500,
    status: 'published',
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    organizer: {
      id: 'd1000000-0000-0000-0000-000000000001',
      user_id: 'b0000000-0000-0000-0000-000000000002',
      name: 'Gourmet Experiences',
      slug: 'gourmet-exp',
      description: 'Eventos culinarios y de cata.',
      logo_url: null,
      banner_url: null,
      contact_email: 'info@gourmet.example.com',
      contact_phone: null,
      website_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    category: {
      id: 'c1000000-0000-0000-0000-000000000004',
      name: 'Gastronomía & Vinos',
      slug: 'gastronomia',
      description: 'Ferias culinarias y catas',
      icon_name: 'Utensils',
      created_at: new Date().toISOString(),
    },
    ticket_types: [
      {
        id: 't1000000-0000-0000-0000-000000000006',
        event_id: 'e1000000-0000-0000-0000-000000000003',
        name: 'Entrada General + Copa de Degustación',
        description: 'Incluye copa de cristal oficial y 3 tokens de degustación',
        price: 9500,
        currency: 'ARS',
        quantity: 1000,
        sold_quantity: 215,
        sale_starts_at: null,
        sale_ends_at: null,
        max_per_order: 6,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    lowest_price: 9500,
    available_tickets: 785,
  }
];

export async function getEvents(): Promise<EventWithDetails[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizers(*),
        category:event_categories(*),
        ticket_types(*)
      `)
      .eq('status', 'published')
      .order('starts_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return SEED_EVENTS;
    }

    return (data as unknown) as EventWithDetails[];
  } catch {
    return SEED_EVENTS;
  }
}

export async function getEventBySlug(slug: string): Promise<EventWithDetails | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizers(*),
        category:event_categories(*),
        ticket_types(*)
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const fallback = SEED_EVENTS.find(e => e.slug === slug);
      return fallback || null;
    }

    return (data as unknown) as EventWithDetails;
  } catch {
    const fallback = SEED_EVENTS.find(e => e.slug === slug);
    return fallback || null;
  }
}
