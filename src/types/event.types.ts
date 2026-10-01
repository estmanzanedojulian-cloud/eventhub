import { Database } from './database.types';

export type EventRow = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export type TicketTypeRow = Database['public']['Tables']['ticket_types']['Row'];
export type CategoryRow = Database['public']['Tables']['event_categories']['Row'];
export type OrganizerRow = Database['public']['Tables']['organizers']['Row'];

export interface EventWithDetails extends EventRow {
  organizer: OrganizerRow;
  category: CategoryRow | null;
  ticket_types: TicketTypeRow[];
  lowest_price?: number;
  available_tickets?: number;
}

export interface EventFilterParams {
  category?: string;
  city?: string;
  query?: string;
  price?: 'all' | 'free' | 'paid';
  date?: 'all' | 'today' | 'this_weekend' | 'this_month';
  sortBy?: 'soonest' | 'price_asc' | 'price_desc' | 'popular';
}
