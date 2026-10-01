'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building,
  RefreshCw
} from 'lucide-react';
import { SEED_EVENTS } from '@/lib/services/event.service';
import { getSavedCheckins } from '@/lib/services/scanner.service';
import { QRScanner } from '@/components/scanner/QRScanner';
import { cn } from '@/lib/utils/cn';

export default function OrganizerAccessPage() {
  const [selectedEventId, setSelectedEventId] = useState(SEED_EVENTS[0].id);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    // Initial activity log
    const existing = getSavedCheckins();
    if (existing.length > 0) {
      setCheckins(existing);
    } else {
      // Authentic seeded activity log
      setCheckins([
        {
          id: 'chk_1',
          ticket_code: 'EVT-NEON-8F4A91',
          attendee_name: 'Juan Pérez',
          ticket_type: 'VIP Lounge & Deck',
          result: 'VALID',
          checked_in_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
        {
          id: 'chk_2',
          ticket_code: 'EVT-NEON-7B2A10',
          attendee_name: 'Pedro Gómez',
          ticket_type: 'General - Preventa 1',
          result: 'VALID',
          checked_in_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        },
        {
          id: 'chk_3',
          ticket_code: 'EVT-NEON-8F4A91',
          attendee_name: 'Juan Pérez',
          ticket_type: 'VIP Lounge & Deck',
          result: 'ALREADY_USED',
          checked_in_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        }
      ]);
    }
  }, []);

  const event = SEED_EVENTS.find((e) => e.id === selectedEventId) || SEED_EVENTS[0];
  const totalSold = event.ticket_types.reduce((acc, t) => acc + t.sold_quantity, 0);
  const totalEntered = checkins.filter((c) => c.result === 'VALID').length;
  const occupancyPercent = totalSold > 0 ? Math.min(100, Math.round((totalEntered / totalSold) * 100)) : 0;

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Control de Acceso en Vivo
          </span>
          <h1 className="font-display text-3xl font-extrabold text-white">
            Monitoreo de Puertas & Molinetes
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-brand-500"
          >
            {SEED_EVENTS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          <Link
            href="/staff/scan"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" /> Abrir Escáner
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Entradas Vendidas</span>
          <div className="text-2xl font-black text-white font-display">{totalSold}</div>
          <p className="text-[11px] text-slate-500">Capacidad total: {event.capacity}</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-emerald-400 font-semibold uppercase">Personas Ingresadas</span>
          <div className="text-2xl font-black text-emerald-300 font-display">{totalEntered}</div>
          <p className="text-[11px] text-slate-500">Asistentes validados en molinete</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-brand-400 font-semibold uppercase">% de Asistencia Actual</span>
          <div className="text-2xl font-black text-brand-300 font-display">{occupancyPercent}%</div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-rose-400 font-semibold uppercase">Intentos Rechazados</span>
          <div className="text-2xl font-black text-rose-300 font-display">
            {checkins.filter((c) => c.result !== 'VALID').length}
          </div>
          <p className="text-[11px] text-slate-500">Duplicados o entradas de otro show</p>
        </div>

      </div>

      {/* Live Activity Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Actividad Reciente en Puerta
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro cronológico de todos los intentos de acceso en tiempo real
            </p>
          </div>

          <button
            onClick={() => setCheckins(getSavedCheckins())}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Refrescar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {checkins.length > 0 ? (
            checkins.map((entry) => (
              <div key={entry.id || Math.random()} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 font-bold">
                    {new Date(entry.checked_in_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <span className="text-slate-500">•</span>

                  <span className="font-bold text-white text-sm">
                    {entry.attendee_name || 'Asistente'}
                  </span>

                  <span className="text-slate-500">•</span>

                  <span className="px-2 py-0.5 rounded bg-slate-950 font-semibold text-slate-300 border border-slate-800">
                    {entry.ticket_type || 'Ticket'}
                  </span>
                </div>

                <div>
                  {entry.result === 'VALID' ? (
                    <span className="px-3 py-1 rounded-full font-extrabold text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ACCESO AUTORIZADO
                    </span>
                  ) : entry.result === 'ALREADY_USED' ? (
                    <span className="px-3 py-1 rounded-full font-extrabold text-[11px] bg-rose-950/80 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" /> RECHAZADO / YA UTILIZADO
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full font-extrabold text-[11px] bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> ERROR: OTRO EVENTO
                    </span>
                  )}
                </div>

              </div>
            ))
          ) : (
            <p className="py-8 text-center text-xs text-slate-500">
              No hay registros de acceso aún para este evento.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
