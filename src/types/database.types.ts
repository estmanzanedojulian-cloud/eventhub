export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'USER' | 'ORGANIZER' | 'STAFF' | 'ADMIN';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'finished';
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type TicketStatus = 'valid' | 'used' | 'cancelled';
export type CheckinResult = 'valid' | 'already_used' | 'invalid_event' | 'cancelled' | 'unpaid' | 'not_found';
export type DiscountType = 'percentage' | 'fixed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          avatar_url: string | null
          role: UserRole
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          updated_at?: string
        }
      }
      organizers: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          banner_url: string | null
          contact_email: string
          contact_phone: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          contact_email: string
          contact_phone?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          contact_email?: string
          contact_phone?: string | null
          website_url?: string | null
          updated_at?: string
        }
      }
      event_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon_name?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          icon_name?: string | null
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          category_id: string | null
          title: string
          slug: string
          description: string
          short_description: string | null
          image_url: string | null
          venue_name: string
          venue_address: string
          city: string
          state: string | null
          country: string
          latitude: number | null
          longitude: number | null
          starts_at: string
          ends_at: string
          capacity: number
          status: EventStatus
          is_featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          category_id?: string | null
          title: string
          slug: string
          description: string
          short_description?: string | null
          image_url?: string | null
          venue_name: string
          venue_address: string
          city: string
          state?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          starts_at: string
          ends_at: string
          capacity?: number
          status?: EventStatus
          is_featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          organizer_id?: string
          category_id?: string | null
          title?: string
          slug?: string
          description?: string
          short_description?: string | null
          image_url?: string | null
          venue_name?: string
          venue_address?: string
          city?: string
          state?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          starts_at?: string
          ends_at?: string
          capacity?: number
          status?: EventStatus
          is_featured?: boolean
          published_at?: string | null
          updated_at?: string
        }
      }
      ticket_types: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          price: number
          currency: string
          quantity: number
          sold_quantity: number
          sale_starts_at: string | null
          sale_ends_at: string | null
          max_per_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          price: number
          currency?: string
          quantity: number
          sold_quantity?: number
          sale_starts_at?: string | null
          sale_ends_at?: string | null
          max_per_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          currency?: string
          quantity?: number
          sold_quantity?: number
          sale_starts_at?: string | null
          sale_ends_at?: string | null
          max_per_order?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      discount_codes: {
        Row: {
          id: string
          organizer_id: string
          event_id: string | null
          code: string
          type: DiscountType
          value: number
          max_uses: number
          used_count: number
          starts_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          event_id?: string | null
          code: string
          type: DiscountType
          value: number
          max_uses?: number
          used_count?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          code?: string
          type?: DiscountType
          value?: number
          max_uses?: number
          used_count?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          event_id: string
          discount_code_id: string | null
          subtotal: number
          discount_amount: number
          total: number
          status: OrderStatus
          payment_status: PaymentStatus
          payment_method: string
          payment_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id: string
          event_id: string
          discount_code_id?: string | null
          subtotal: number
          discount_amount?: number
          total: number
          status?: OrderStatus
          payment_status?: PaymentStatus
          payment_method?: string
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: OrderStatus
          payment_status?: PaymentStatus
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          ticket_type_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          ticket_type_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          order_id: string
          event_id: string
          ticket_type_id: string
          user_id: string
          attendee_name: string
          attendee_email: string
          ticket_code: string
          qr_token: string
          status: TicketStatus
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          event_id: string
          ticket_type_id: string
          user_id: string
          attendee_name: string
          attendee_email: string
          ticket_code: string
          qr_token: string
          status?: TicketStatus
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: TicketStatus
          checked_in_at?: string | null
          checked_in_by?: string | null
          updated_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          ticket_id: string
          event_id: string
          staff_user_id: string
          checked_in_at: string
          result: CheckinResult
          device_info: Json | null
          notes: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          event_id: string
          staff_user_id: string
          checked_in_at?: string
          result: CheckinResult
          device_info?: Json | null
          notes?: string | null
        }
      }
      event_staff: {
        Row: {
          id: string
          event_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          role?: string
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          event_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          created_at: string
        }
      }
    }
    Functions: {
      process_checkout: {
        Args: {
          p_user_id: string
          p_event_id: string
          p_items: Json
          p_discount_code?: string | null
          p_attendee_info?: Json | null
          p_payment_method?: string
        }
        Returns: Json
      }
      validate_and_checkin_ticket: {
        Args: {
          p_qr_token: string
          p_event_id: string
          p_staff_user_id: string
          p_device_info?: Json | null
        }
        Returns: Json
      }
    }
  }
}
