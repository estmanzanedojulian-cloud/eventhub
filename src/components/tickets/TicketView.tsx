'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  MapPin,
  Maximize2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { generateQRPayload } from '@/lib/utils/qr';
import { formatCurrency } from '@/lib/utils/currency';
import { formatEventDate, formatEventTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

interface TicketViewProps {
  ticket: any;
  showFullDetails?: boolean;
}

export function TicketView({ ticket, showFullDetails = true }: TicketViewProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  const qrPayload = generateQRPayload(ticket.qr_token);
  const isUsed = ticket.status === 'used';
  const isCancelled = ticket.status === 'cancelled';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.ticket_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group max-w-sm sm:max-w-md w-full mx-auto">
      
      {/* Physical Ticket Body */}
      <div className={cn(
        "relative rounded-3xl overflow-hidden border backdrop-blur-xl transition-all duration-300 shadow-2xl",
        isUsed
          ? "bg-slate-950/70 border-slate-800 opacity-80"
          : "bg-slate-900 border-slate-700/80 hover:border-brand-500/60"
      )}>

        {/* Top Header Section */}
        <div className="p-6 bg-gradient-to-b from-brand-950/60 via-slate-900 to-slate-900 border-b border-dashed border-slate-800 relative">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              EVENTHUB OFFICIAL PASS
            </span>

            {isUsed ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-slate-400" /> Ingresado
              </span>
            ) : isCancelled ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-400" /> Cancelado
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-glow">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Válido
              </span>
            )}
          </div>

          {/* Event Title */}
          <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight leading-snug">
            {ticket.event?.title || 'Festival EventHub'}
          </h3>

          {/* Sector Badge */}
          <div className="mt-3 inline-block px-3 py-1 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 font-extrabold text-xs uppercase tracking-wider">
            SECTOR: {ticket.ticket_type_name || ticket.ticket_type?.name || 'GENERAL'}
          </div>
        </div>

        {/* Notches for authentic perforation look */}
        <div className="relative h-6 bg-slate-900 flex items-center justify-between px-2 overflow-hidden">
          <div className="w-5 h-5 rounded-full bg-[#090d16] -ml-4 border-r border-slate-700/80" />
          <div className="w-full border-t border-dashed border-slate-700/80 mx-2" />
          <div className="w-5 h-5 rounded-full bg-[#090d16] -mr-4 border-l border-slate-700/80" />
        </div>

        {/* Event Coordinates & Attendee */}
        <div className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">FECHA</span>
              <span className="font-bold text-white block mt-0.5">
                {ticket.event?.starts_at ? formatEventDate(ticket.event.starts_at) : '15 Noviembre 2026'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">HORA</span>
              <span className="font-bold text-white block mt-0.5">
                {ticket.event?.starts_at ? formatEventTime(ticket.event.starts_at) : '22:00 hs'}
              </span>
            </div>
          </div>

          <div className="text-xs pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">LUGAR</span>
            <span className="font-bold text-white block mt-0.5 truncate">
              {ticket.event?.venue_name || 'Costanera Arena'} — {ticket.event?.city || 'Buenos Aires'}
            </span>
          </div>

          <div className="text-xs pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">TITULAR DE LA ENTRADA</span>
            <span className="font-bold text-white block mt-0.5">
              {ticket.attendee_name || 'Asistente Registrado'}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="pt-4 border-t border-slate-800 flex flex-col items-center justify-center">
            
            <div
              onClick={() => setIsZoomed(true)}
              className={cn(
                "p-4 rounded-2xl bg-white cursor-pointer hover:scale-105 transition-transform duration-200 shadow-2xl relative group/qr",
                isUsed && "filter grayscale opacity-60"
              )}
            >
              <QRCodeSVG
                value={qrPayload}
                size={160}
                level="H"
                includeMargin={false}
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-xs font-bold text-white flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-md">
                  <Maximize2 className="w-3.5 h-3.5" /> Ampliar
                </span>
              </div>
            </div>

            {/* Ticket Code Tag */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-400">Código:</span>
              <code className="px-2.5 py-1 rounded-md bg-slate-950 font-mono text-xs font-bold text-brand-300 border border-slate-800">
                {ticket.ticket_code}
              </code>
              <button
                onClick={handleCopyCode}
                className="text-slate-400 hover:text-white p-1"
                title="Copiar código de ticket"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isUsed && (
              <p className="text-[11px] text-slate-500 font-semibold mt-2">
                Utilizado el {new Date(ticket.checked_in_at).toLocaleString('es-AR')}
              </p>
            )}

            <p className="text-[10px] text-slate-500 text-center mt-3 max-w-xs">
              Presentá este código en el acceso al evento para su lectura con la cámara del staff.
            </p>
          </div>

        </div>

      </div>

      {/* Fullscreen QR Zoom Modal */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl"
          >
            <h4 className="font-bold text-base text-white">{ticket.event?.title}</h4>
            <span className="text-xs text-brand-400 font-bold uppercase">{ticket.ticket_type_name || 'GENERAL'}</span>

            <div className="p-6 bg-white rounded-3xl inline-block shadow-2xl my-2">
              <QRCodeSVG value={qrPayload} size={240} level="H" />
            </div>

            <div className="font-mono text-sm font-bold text-white bg-slate-950 py-2 rounded-xl border border-slate-800">
              {ticket.ticket_code}
            </div>

            <p className="text-xs text-slate-400">
              Aumentá el brillo de tu pantalla para facilitar el escaneo en la puerta.
            </p>

            <button
              onClick={() => setIsZoomed(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
