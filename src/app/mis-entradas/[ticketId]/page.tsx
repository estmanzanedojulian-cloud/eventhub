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
  AlertTriangle
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
  const { success } = useToast();
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
        id: ticketId,
        ticket_code: 'EVT-NEON-8F4A91',
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
      <div className="py-20 text-center text-slate-400">
        Cargando entrada...
      </div>
    );
  }

  const qrPayload = generateQRPayload(ticket.qr_token || 'token');
  const isUsed = ticket.status === 'used';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      success('Enlace copiado', 'Podés compartir este link directo a tu entrada');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="py-10 max-w-2xl mx-auto px-4 sm:px-6">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden flex items-center justify-between mb-8">
        <Link
          href="/mis-entradas"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a mis entradas
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>Compartir</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-glow flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Physical Ticket Pass */}
      <div className={cn(
        "rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-xl",
        isUsed
          ? "bg-slate-950/80 border-slate-800 opacity-80"
          : "bg-slate-900 border-slate-700"
      )}>
        
        {/* Pass Header */}
        <div className="p-8 bg-gradient-to-b from-brand-950/80 via-slate-900 to-slate-900 border-b border-dashed border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-extrabold text-sm tracking-wider text-slate-300 uppercase">
              EventHub Official Pass
            </span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            {ticket.event?.title || 'Festival'}
          </h1>

          <div className="inline-block px-4 py-1 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 font-extrabold text-xs uppercase tracking-wider">
            SECTOR: {ticket.ticket_type_name || 'GENERAL'}
          </div>

          <div>
            {isUsed ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                Entrada Ya Utilizada
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
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
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">FECHA</span>
              <strong className="text-white block mt-0.5">
                {ticket.event?.starts_at ? formatEventDate(ticket.event.starts_at) : '15 Noviembre 2026'}
              </strong>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">HORA DE APERTURA</span>
              <strong className="text-white block mt-0.5">
                {ticket.event?.starts_at ? formatEventTime(ticket.event.starts_at) : '21:00 hs'}
              </strong>
            </div>

            <div className="col-span-2 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">LUGAR Y DIRECCIÓN</span>
              <strong className="text-white block mt-0.5">
                {ticket.event?.venue_name} — {ticket.event?.venue_address}, {ticket.event?.city}
              </strong>
            </div>

            <div className="col-span-2 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">TITULAR DE LA ENTRADA</span>
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

            <p className="text-xs text-slate-500 text-center max-w-xs leading-relaxed">
              Presentá este código en la entrada. Cada ticket permite un único acceso atómico e intransferible.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
