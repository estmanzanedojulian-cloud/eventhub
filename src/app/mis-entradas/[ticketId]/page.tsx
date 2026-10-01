'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Share2,
  Check,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Copy,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getSavedLocalTickets } from '@/lib/services/checkout.service';
import { generateQRPayload } from '@/lib/utils/qr';
import { formatEventDate, formatEventTime } from '@/lib/utils/date';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils/cn';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, info } = useToast();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const all = getSavedLocalTickets();
    const found = all.find((t: any) => t.id === ticketId || t.ticket_code === ticketId);
    if (found) {
      setTicket(found);
    } else {
      // Fallback demo ticket
      setTicket({
        id: ticketId || 'tkt_demo_neon_01',
        ticket_code: ticketId?.startsWith('EVT-') ? ticketId : 'EVT-NEON-8F4A91',
        qr_token: 'demo-token-neon-vip-2026',
        attendee_name: 'Juan Pérez',
        attendee_email: 'juan.perez@email.com',
        status: 'valid',
        ticket_type_name: 'VIP Lounge & Deck',
        created_at: new Date().toISOString(),
        event: {
          id: 'e1000000-0000-0000-0000-000000000001',
          title: 'Neon Echoes: Sunset Festival 2026',
          slug: 'neon-echoes-sunset-festival-2026',
          starts_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
          venue_name: 'Costanera Norte Arena',
          venue_address: 'Av. Costanera Rafael Obligado 6155',
          city: 'Buenos Aires',
        }
      });
    }
  }, [ticketId]);

  if (!ticket) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Ticket className="w-10 h-10 animate-bounce mx-auto mb-3 text-brand-400" />
        <p className="text-sm font-semibold">Cargando pase oficial de entrada...</p>
      </div>
    );
  }

  const qrPayload = generateQRPayload(ticket.qr_token || 'token');
  const isUsed = ticket.status === 'used';
  const isCancelled = ticket.status === 'cancelled';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      success('Enlace copiado', 'Podés compartir este link directo a tu entrada');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== 'undefined') {
      const title = ticket.event?.title || 'Evento EventHub';
      const code = ticket.ticket_code;
      const url = window.location.href;
      const text = encodeURIComponent(
        `🎟️ ¡Hola! Acá tenés la entrada oficial de EventHub para "${title}".\nCódigo: ${code}\nAccedé a tu pase QR acá: ${url}`
      );
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-2xl mx-auto px-4 sm:px-6">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/mis-entradas"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a mis entradas
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp share */}
          <button
            onClick={handleWhatsAppShare}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition-all shadow-sm"
            title="Compartir entrada por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
            title="Copiar link directo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar Link</span>
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-glow flex items-center gap-1.5 transition-all"
            title="Imprimir ticket o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Physical Ticket Pass */}
      <div className={cn(
        "rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-xl transition-all",
        isUsed
          ? "bg-slate-950/80 border-slate-800 opacity-80"
          : "bg-slate-900 border-slate-700"
      )}>
        
        {/* Pass Header */}
        <div className="p-8 bg-gradient-to-b from-brand-950/80 via-slate-900 to-slate-900 border-b border-dashed border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-xs tracking-widest text-slate-300 uppercase">
              EventHub Official Pass
            </span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            {ticket.event?.title || 'Festival'}
          </h1>

          <div className="inline-block px-4 py-1.5 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 font-extrabold text-xs uppercase tracking-wider">
            SECTOR: {ticket.ticket_type_name || ticket.ticket_type?.name || 'GENERAL VIP'}
          </div>

          <div className="pt-1">
            {isUsed ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 inline-flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Entrada Ya Utilizada
              </span>
            ) : isCancelled ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-500/30">
                Entrada Cancelada
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-glow">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Pase Válido para Ingreso
              </span>
            )}
          </div>
        </div>

        {/* Perforations */}
        <div className="relative h-6 bg-slate-900 flex items-center justify-between px-2 overflow-hidden">
          <div className="w-6 h-6 rounded-full bg-[#090d16] -ml-5 border-r border-slate-700" />
          <div className="w-full border-t-2 border-dashed border-slate-700/80 mx-2" />
          <div className="w-6 h-6 rounded-full bg-[#090d16] -mr-5 border-l border-slate-700" />
        </div>

        {/* Pass Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Fecha del Evento
              </span>
              <strong className="text-white block mt-1">
                {ticket.event?.starts_at ? formatEventDate(ticket.event.starts_at) : '15 Noviembre 2026'}
              </strong>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Apertura de Puertas
              </span>
              <strong className="text-white block mt-1">
                {ticket.event?.starts_at ? formatEventTime(ticket.event.starts_at) : '21:00 hs'}
              </strong>
            </div>

            <div className="col-span-2 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> Lugar y Dirección
              </span>
              <strong className="text-white block mt-1">
                {ticket.event?.venue_name} — {ticket.event?.venue_address || 'Costanera'}, {ticket.event?.city}
              </strong>
            </div>

            <div className="col-span-2 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Titular de la Entrada
              </span>
              <strong className="text-white text-base block mt-0.5">
                {ticket.attendee_name || 'Asistente Registrado'}
              </strong>
              <span className="text-xs text-slate-400">{ticket.attendee_email}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="pt-6 border-t border-slate-800 flex flex-col items-center justify-center space-y-4">
            <div className="p-5 rounded-3xl bg-white shadow-2xl inline-block">
              <QRCodeSVG value={qrPayload} size={200} level="H" />
            </div>

            <div className="text-center">
              <span className="text-xs text-slate-400 block mb-1">CÓDIGO DE IDENTIFICACIÓN:</span>
              <code className="px-4 py-1.5 rounded-xl bg-slate-950 font-mono text-sm font-black text-brand-300 border border-slate-800">
                {ticket.ticket_code}
              </code>
            </div>

            <p className="text-xs text-slate-400 text-center max-w-xs leading-relaxed">
              Presentá este código en el acceso al evento. Cada ticket autoriza un único ingreso atómico e intransferible.
            </p>
          </div>

        </div>

      </div>

      {/* Helpful Instructions (hidden when printing) */}
      <div className="print:hidden mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
        <p>💡 <strong>Tip de acceso:</strong> Podés descargar esta página como PDF o abrirla directamente en tu celular con brillo alto para agilizar la fila de ingreso.</p>
      </div>

    </div>
  );
}
