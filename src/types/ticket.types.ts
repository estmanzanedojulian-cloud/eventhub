import { Database, TicketStatus } from './database.types';

export type TicketRow = Database['public']['Tables']['tickets']['Row'];
export type CheckinRow = Database['public']['Tables']['checkins']['Row'];

export interface TicketWithEventDetails extends TicketRow {
  event: {
    id: string;
    title: string;
    slug: string;
    starts_at: string;
    ends_at: string;
    venue_name: string;
    venue_address: string;
    city: string;
    image_url: string | null;
  };
  ticket_type: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
}

export interface ValidationResult {
  success: boolean;
  code: 'VALID' | 'ALREADY_USED' | 'INVALID_EVENT' | 'CANCELLED' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'ERROR';
  message: string;
  attendee_name?: string;
  ticket_code?: string;
  ticket_type?: string;
  event_title?: string;
  checked_in_at?: string;
  first_checkin_at?: string;
}
