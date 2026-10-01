import { Database, OrderStatus, PaymentStatus } from './database.types';

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export interface CheckoutCartItem {
  ticket_type_id: string;
  quantity: number;
}

export interface CheckoutAttendeeInfo {
  attendee_name: string;
  attendee_email: string;
}

export interface CheckoutRequest {
  event_id: string;
  items: CheckoutCartItem[];
  discount_code?: string;
  attendee_info?: CheckoutAttendeeInfo;
  payment_method?: string;
}

export interface CheckoutResponse {
  success: boolean;
  order_id: string;
  order_number: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  tickets_count: number;
  tickets: Array<{
    id: string;
    ticket_code: string;
    qr_token: string;
    ticket_type_name: string;
    price: number;
    status: string;
  }>;
  error?: string;
}
