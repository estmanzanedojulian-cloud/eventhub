import { createClient } from '@/lib/supabase/client';
import { CheckoutRequest, CheckoutResponse } from '@/types/order.types';
import { SEED_EVENTS } from './event.service';

// In-memory / localStorage persistence for demo tickets when running locally without a live remote DB
export function getSavedLocalTickets() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('eventhub_purchased_tickets');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalTickets(newTickets: any[]) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedLocalTickets();
    localStorage.setItem('eventhub_purchased_tickets', JSON.stringify([...newTickets, ...existing]));
  } catch (err) {
    console.error('Error saving local tickets:', err);
  }
}

export async function executeCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
  const supabase = createClient();

  // Try PostgreSQL RPC process_checkout first
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'b0000000-0000-0000-0000-000000000002'; // fallback demo user

    const { data, error } = await (supabase.rpc as any)('process_checkout', {
      p_user_id: userId,
      p_event_id: request.event_id,
      p_items: request.items,
      p_discount_code: request.discount_code || null,
      p_attendee_info: request.attendee_info || null,
      p_payment_method: request.payment_method || 'demo_card',
    });

    if (!error && data && (data as any).success) {
      // Also cache in local session for immediate offline availability
      const res = data as any;
      if (res.tickets && Array.isArray(res.tickets)) {
        saveLocalTickets(res.tickets.map((t: any) => ({
          ...t,
          event_id: request.event_id,
          attendee_name: request.attendee_info?.attendee_name || 'Asistente',
          created_at: new Date().toISOString(),
        })));
      }
      return res as CheckoutResponse;
    }
  } catch {
    // If Supabase RPC is not yet configured, fall back to local transactional engine
  }

  // Local transactional fallback engine (guarantees the exact same business logic)
  const event = SEED_EVENTS.find((e) => e.id === request.event_id || e.slug === request.event_id);
  if (!event) {
    throw new Error('Evento no encontrado');
  }

  let subtotal = 0;
  const validatedItems: Array<{ ticket: any; quantity: number }> = [];

  for (const item of request.items) {
    const tt = event.ticket_types.find((t) => t.id === item.ticket_type_id);
    if (!tt) throw new Error('Tipo de entrada inválido');
    const available = tt.quantity - tt.sold_quantity;
    if (item.quantity > available) {
      throw new Error(`Stock insuficiente para ${tt.name}. Disponibles: ${available}`);
    }
    subtotal += tt.price * item.quantity;
    validatedItems.push({ ticket: tt, quantity: item.quantity });
  }

  // Apply discount
  let discountAmount = 0;
  if (request.discount_code) {
    const code = request.discount_code.trim().toUpperCase();
    if (code === 'EVENTHUB20') {
      discountAmount = Math.round(subtotal * 0.2);
    } else if (code === 'AMIGOS5000') {
      discountAmount = Math.min(5000, subtotal);
    } else {
      throw new Error('Código de descuento inválido');
    }
  }

  const total = Math.max(0, subtotal - discountAmount);
  const orderId = 'ord_' + Math.random().toString(36).substring(2, 10);
  const orderNumber = 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Generate individual tickets per unit
  const generatedTickets: any[] = [];
  const eventPrefix = 'EVT-' + event.title.substring(0, 3).toUpperCase();

  for (const { ticket, quantity } of validatedItems) {
    ticket.sold_quantity += quantity; // decrement stock in memory

    for (let i = 1; i <= quantity; i++) {
      const ticketCode = `${eventPrefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const qrToken = 'tok_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

      const ticketObj = {
        id: 'tkt_' + Math.random().toString(36).substring(2, 12),
        order_id: orderId,
        event_id: event.id,
        ticket_type_id: ticket.id,
        ticket_type_name: ticket.name,
        price: ticket.price,
        ticket_code: ticketCode,
        qr_token: qrToken,
        attendee_name: request.attendee_info?.attendee_name || 'Asistente Registrado',
        attendee_email: request.attendee_info?.attendee_email || 'asistente@email.com',
        status: 'valid',
        created_at: new Date().toISOString(),
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          starts_at: event.starts_at,
          ends_at: event.ends_at,
          venue_name: event.venue_name,
          venue_address: event.venue_address,
          city: event.city,
          image_url: event.image_url,
        },
        ticket_type: {
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          currency: 'ARS',
        }
      };

      generatedTickets.push(ticketObj);
    }
  }

  // Persist locally
  saveLocalTickets(generatedTickets);

  return {
    success: true,
    order_id: orderId,
    order_number: orderNumber,
    subtotal,
    discount_amount: discountAmount,
    total,
    tickets_count: generatedTickets.length,
    tickets: generatedTickets,
  };
}
