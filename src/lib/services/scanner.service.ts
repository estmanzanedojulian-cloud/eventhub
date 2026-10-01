import { createClient } from '@/lib/supabase/client';
import { ValidationResult } from '@/types/ticket.types';
import { parseQRPayload } from '@/lib/utils/qr';
import { getSavedLocalTickets } from './checkout.service';

// In-memory / localStorage check-in log for demo verification
export function getSavedCheckins() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('eventhub_checkins_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCheckinLog(entry: any) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedCheckins();
    localStorage.setItem('eventhub_checkins_history', JSON.stringify([entry, ...existing]));
  } catch {}
}

export async function validateTicketQR(
  rawQrPayload: string,
  eventId: string,
  staffUserId?: string
): Promise<ValidationResult> {
  const qrToken = parseQRPayload(rawQrPayload);

  if (!qrToken) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'Código QR ilegible o formato incompatible',
    };
  }

  const supabase = createClient();

  // Try PostgreSQL RPC validate_and_checkin_ticket
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveStaffId = staffUserId || user?.id || 'b0000000-0000-0000-0000-000000000002';

    const { data, error } = await (supabase.rpc as any)('validate_and_checkin_ticket', {
      p_qr_token: qrToken,
      p_event_id: eventId,
      p_staff_user_id: effectiveStaffId,
      p_device_info: {
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Web Scanner',
        timestamp: new Date().toISOString(),
      },
    });

    if (!error && data) {
      const res = data as any;
      saveCheckinLog({
        id: 'chk_' + Math.random().toString(36).substring(2, 9),
        ticket_code: res.ticket_code || 'TKT-UNKNOWN',
        event_id: eventId,
        attendee_name: res.attendee_name || 'Desconocido',
        ticket_type: res.ticket_type || 'General',
        result: res.code,
        checked_in_at: new Date().toISOString(),
      });

      return res as ValidationResult;
    }
  } catch {
    // Fallback to local atomic engine
  }

  // Local atomic engine for immediate testing
  const allTickets = getSavedLocalTickets();
  const ticket = allTickets.find(
    (t: any) => t.qr_token === qrToken || t.ticket_code === qrToken.toUpperCase()
  );

  if (!ticket) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'Código QR no registrado en el sistema',
    };
  }

  // Event match check
  if (ticket.event_id !== eventId) {
    return {
      success: false,
      code: 'INVALID_EVENT',
      message: `Esta entrada pertenece a otro evento (${ticket.event?.title || 'Evento externo'})`,
      ticket_code: ticket.ticket_code,
    };
  }

  // Already used check
  if (ticket.status === 'used' || ticket.checked_in_at) {
    saveCheckinLog({
      id: 'chk_' + Math.random().toString(36).substring(2, 9),
      ticket_code: ticket.ticket_code,
      event_id: eventId,
      attendee_name: ticket.attendee_name,
      ticket_type: ticket.ticket_type_name || ticket.ticket_type?.name,
      result: 'ALREADY_USED',
      checked_in_at: new Date().toISOString(),
    });

    return {
      success: false,
      code: 'ALREADY_USED',
      message: 'Entrada YA UTILIZADA',
      ticket_code: ticket.ticket_code,
      attendee_name: ticket.attendee_name,
      ticket_type: ticket.ticket_type_name || ticket.ticket_type?.name,
      first_checkin_at: ticket.checked_in_at,
    };
  }

  // Cancelled check
  if (ticket.status === 'cancelled') {
    return {
      success: false,
      code: 'CANCELLED',
      message: 'Esta entrada se encuentra cancelada',
      ticket_code: ticket.ticket_code,
    };
  }

  // Mark ticket as used atomically
  ticket.status = 'used';
  ticket.checked_in_at = new Date().toISOString();
  ticket.checked_in_by = staffUserId || 'STAFF-DEMO';

  // Update in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('eventhub_purchased_tickets', JSON.stringify(allTickets));
  }

  // Save checkin history
  saveCheckinLog({
    id: 'chk_' + Math.random().toString(36).substring(2, 9),
    ticket_code: ticket.ticket_code,
    event_id: eventId,
    attendee_name: ticket.attendee_name,
    ticket_type: ticket.ticket_type_name || ticket.ticket_type?.name,
    result: 'VALID',
    checked_in_at: ticket.checked_in_at,
  });

  return {
    success: true,
    code: 'VALID',
    message: 'Acceso Permitido',
    attendee_name: ticket.attendee_name,
    ticket_code: ticket.ticket_code,
    ticket_type: ticket.ticket_type_name || ticket.ticket_type?.name,
    event_title: ticket.event?.title,
    checked_in_at: ticket.checked_in_at,
  };
}
