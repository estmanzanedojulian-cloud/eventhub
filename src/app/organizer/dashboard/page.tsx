'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Ticket,
  DollarSign,
  Users,
  QrCode,
  CalendarPlus,
  ArrowRight,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Tag
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { SEED_EVENTS } from '@/lib/services/event.service';
import { formatCurrency } from '@/lib/utils/currency';
import { getSavedCheckins } from '@/lib/services/scanner.service';

export default function OrganizerDashboardPage() {
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    setCheckins(getSavedCheckins());
  }, []);

  const totalEvents = SEED_EVENTS.length;
  const totalTicketsSold = SEED_EVENTS.reduce(
    (acc, e) => acc + e.ticket_types.reduce((tAcc, tt) => tAcc + tt.sold_quantity, 0),
    0
  );
  const totalRevenue = SEED_EVENTS.reduce(
    (acc, e) =>
      acc +
      e.ticket_types.reduce((tAcc, tt) => tAcc + tt.price * tt.sold_quantity, 0),
    0
  );
  const totalCapacity = SEED_EVENTS.reduce((acc, e) => acc + e.capacity, 0);
  const overallOccupancy = Math.round((totalTicketsSold / totalCapacity) * 100);

  // 7 days simulated trend data
  const chartData = [
    { date: 'Lun', sales: 180000, tickets: 10 },
    { date: 'Mar', sales: 290000, tickets: 16 },
    { date: 'Mié', sales: 420000, tickets: 23 },
    { date: 'Jue', sales: 510000, tickets: 28 },
    { date: 'Vie', sales: 890000, tickets: 49 },
    { date: 'Sáb', sales: 1250000, tickets: 68 },
    { date: 'Dom', sales: 740000, tickets: 41 },
  ];

  // Attendees list
  const sampleAttendees = [
    {
      id: 'att_1',
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      event: 'Neon Echoes: Sunset Festival 2026',
      ticket_type: 'VIP Lounge & Deck',
      ticket_code: 'EVT-NEON-8F4A91',
      checked_in: true,
      checkin_time: '23:47 hs',
    },
    {
      id: 'att_2',
      name: 'Pedro Gómez',
      email: 'pedro.gomez@email.com',
      event: 'Neon Echoes: Sunset Festival 2026',
      ticket_type: 'General - Preventa 1',
      ticket_code: 'EVT-NEON-7B2A10',
      checked_in: true,
      checkin_time: '23:49 hs',
    },
    {
      id: 'att_3',
      name: 'Lucía Fernández',
      email: 'lucia.f@email.com',
      event: 'Neon Echoes: Sunset Festival 2026',
      ticket_type: 'General - Preventa 1',
      ticket_code: 'EVT-NEON-5C1E99',
      checked_in: false,
      checkin_time: '-',
    },
    {
      id: 'att_4',
      name: 'Martín Rodríguez',
      email: 'martin.dev@tech.com',
      event: 'AI & Cloud Future Summit 2026',
      ticket_type: 'Full Access Professional',
      ticket_code: 'EVT-AI-902B11',
      checked_in: true,
      checkin_time: '09:15 hs',
    },
    {
      id: 'att_5',
      name: 'Sofía Rossi',
      email: 'sofia.rossi@email.com',
      event: 'Sabores & Fuego: Festival Culinario',
      ticket_type: 'General + Copa',
      ticket_code: 'EVT-SAB-441F23',
      checked_in: false,
      checkin_time: '-',
    },
  ];

  const filteredAttendees = sampleAttendees.filter((att) => {
    if (!attendeeSearch.trim()) return true;
    const q = attendeeSearch.toLowerCase();
    return (
      att.name.toLowerCase().includes(q) ||
      att.email.toLowerCase().includes(q) ||
      att.ticket_code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Portal de Productora
          </span>
          <h1 className="font-display text-3xl font-extrabold text-white">
            Dashboard del Organizador
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisá ventas, recaudación y afluencia de tus eventos en vivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/organizer/discounts"
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 transition-all flex items-center gap-1.5"
            title="Administrar códigos de descuento y promociones"
          >
            <Tag className="w-4 h-4 text-emerald-400" /> Descuentos
          </Link>

          <Link
            href="/organizer/staff"
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 transition-all flex items-center gap-1.5"
            title="Designar personal autorizado para validar accesos"
          >
            <Users className="w-4 h-4 text-emerald-400" /> Staff Puerta
          </Link>

          <Link
            href="/organizer/access"
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-emerald-400" /> Control Acceso
          </Link>

          <Link
            href="/organizer/events/new"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-1.5"
          >
            <CalendarPlus className="w-4 h-4" /> Crear Evento
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Recaudación Total"
          value={formatCurrency(totalRevenue)}
          subtitle="+18.4% vs. mes anterior"
          icon={DollarSign}
          color="emerald"
        />

        <MetricCard
          title="Entradas Vendidas"
          value={totalTicketsSold}
          subtitle={`De ${totalCapacity} plazas habilitadas`}
          icon={Ticket}
          color="brand"
        />

        <MetricCard
          title="Eventos Publicados"
          value={totalEvents}
          subtitle="3 activos en cartelera"
          icon={Calendar}
          color="accent"
        />

        <MetricCard
          title="% Ocupación Global"
          value={`${overallOccupancy}%`}
          subtitle="Alta demanda en general"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Analytics Chart */}
      <SalesChart data={chartData} />

      {/* Events Quick Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Tus Eventos Activos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Estado de venta y capacidad disponible por producción
            </p>
          </div>

          <Link
            href="/organizer/events/new"
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            + Publicar nuevo evento
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Evento</th>
                <th className="pb-3 font-semibold">Fecha</th>
                <th className="pb-3 font-semibold">Ventas</th>
                <th className="pb-3 font-semibold">Recaudación</th>
                <th className="pb-3 font-semibold">Ocupación</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SEED_EVENTS.map((evt) => {
                const sold = evt.ticket_types.reduce((acc, t) => acc + t.sold_quantity, 0);
                const rev = evt.ticket_types.reduce((acc, t) => acc + t.sold_quantity * t.price, 0);
                const perc = Math.round((sold / evt.capacity) * 100);

                return (
                  <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-white text-sm">{evt.title}</div>
                      <div className="text-[11px] text-slate-400">{evt.venue_name}, {evt.city}</div>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-300">
                      {new Date(evt.starts_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="font-bold text-white">{sold}</span> / {evt.capacity}
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-semibold text-emerald-400">
                      {formatCurrency(rev)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-500 h-full rounded-full"
                            style={{ width: `${perc}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">{perc}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/eventos/${evt.slug}`}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-semibold text-xs px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Ver público <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendees Management Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Lista de Asistentes & Check-Ins
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditoría en tiempo real de titulares de entradas y estado de acceso
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o ticket..."
              value={attendeeSearch}
              onChange={(e) => setAttendeeSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Asistente</th>
                <th className="pb-3 font-semibold">Evento</th>
                <th className="pb-3 font-semibold">Sector</th>
                <th className="pb-3 font-semibold">Ticket</th>
                <th className="pb-3 font-semibold">Check-In</th>
                <th className="pb-3 font-semibold">Hora Ingreso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAttendees.map((att) => (
                <tr key={att.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-4">
                    <span className="font-bold text-white block">{att.name}</span>
                    <span className="text-[11px] text-slate-400">{att.email}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-300 max-w-[200px] truncate">
                    {att.event}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-semibold">
                      {att.ticket_type}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-mono font-bold text-brand-300">
                    {att.ticket_code}
                  </td>
                  <td className="py-3.5 pr-4">
                    {att.checked_in ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ingresado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Clock className="w-3.5 h-3.5" /> Pendiente
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-slate-400 font-mono">
                    {att.checkin_time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
