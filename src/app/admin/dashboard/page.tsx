'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Calendar,
  Ticket,
  Search,
  CheckCircle2,
  XCircle,
  Building,
  TrendingUp,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { SEED_EVENTS } from '@/lib/services/event.service';
import { formatCurrency } from '@/lib/utils/currency';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'users' | 'orders'>('events');
  const [searchQuery, setSearchQuery] = useState('');

  const usersList = [
    { id: 'u_1', name: 'Admin EventHub', email: 'admin@eventhub.com', role: 'ADMIN', events: 0, created_at: '2026-01-10' },
    { id: 'u_2', name: 'Producciones Neon Live', email: 'contacto@neonlive.com', role: 'ORGANIZER', events: 2, created_at: '2026-02-14' },
    { id: 'u_3', name: 'Tech Ventures Community', email: 'contacto@techventures.com', role: 'ORGANIZER', events: 1, created_at: '2026-03-01' },
    { id: 'u_4', name: 'Guardia Puerta Norte', email: 'staff1@eventhub.com', role: 'STAFF', events: 2, created_at: '2026-04-12' },
    { id: 'u_5', name: 'Juan Pérez', email: 'juan.perez@email.com', role: 'USER', events: 0, created_at: '2026-05-20' },
    { id: 'u_6', name: 'María Gómez', email: 'maria.g@email.com', role: 'USER', events: 0, created_at: '2026-06-05' },
  ];

  const ordersList = [
    { id: 'ord_1', number: 'ORD-20261001-A91B2C', user: 'Juan Pérez', event: 'Neon Echoes: Sunset Festival', total: 70000, status: 'confirmed', date: 'Hace 10 min' },
    { id: 'ord_2', number: 'ORD-20260928-8F4A10', user: 'Lucía Fernández', event: 'Neon Echoes: Sunset Festival', total: 36000, status: 'confirmed', date: 'Ayer' },
    { id: 'ord_3', number: 'ORD-20260925-3C1E44', user: 'Martín Rodríguez', event: 'AI & Cloud Future Summit', total: 45000, status: 'confirmed', date: 'Hace 3 días' },
  ];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" /> Administración Global
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white">
            Panel de Control Administrador
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisión integral de usuarios, roles, organizadores, eventos y órdenes globales.
          </p>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Usuarios</span>
          <div className="text-2xl font-black text-white font-display">1.482</div>
          <p className="text-[11px] text-slate-500">6 nuevos en las últimas 24 hs</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-emerald-400 font-semibold uppercase">Productoras Activas</span>
          <div className="text-2xl font-black text-emerald-300 font-display">48</div>
          <p className="text-[11px] text-slate-500">Organizadores verificados</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-brand-400 font-semibold uppercase">Eventos Globales</span>
          <div className="text-2xl font-black text-brand-300 font-display">124</div>
          <p className="text-[11px] text-slate-500">3 destacados en portada</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-accent-400 font-semibold uppercase">Volumen de Ticketing</span>
          <div className="text-2xl font-black text-accent-300 font-display font-mono">
            {formatCurrency(8450000)}
          </div>
          <p className="text-[11px] text-slate-500">Transacciones procesadas</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'events' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Eventos ({SEED_EVENTS.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'users' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Usuarios & Roles ({usersList.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Órdenes de Compra ({ordersList.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar registros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Content by active tab */}
        {activeTab === 'events' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Título</th>
                  <th className="pb-3 font-semibold">Organizador</th>
                  <th className="pb-3 font-semibold">Lugar</th>
                  <th className="pb-3 font-semibold">Capacidad</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold text-right">Moderación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {SEED_EVENTS.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 pr-4 font-bold text-white">{evt.title}</td>
                    <td className="py-3.5 pr-4 text-slate-300">{evt.organizer?.name}</td>
                    <td className="py-3.5 pr-4 text-slate-400">{evt.venue_name}</td>
                    <td className="py-3.5 pr-4 text-slate-300 font-mono">{evt.capacity}</td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        href={`/eventos/${evt.slug}`}
                        className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                      >
                        Ver público
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Nombre</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Rol Asignado</th>
                  <th className="pb-3 font-semibold">Registro</th>
                  <th className="pb-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 pr-4 font-bold text-white">{u.name}</td>
                    <td className="py-3.5 pr-4 text-slate-400">{u.email}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        u.role === 'ADMIN' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                        u.role === 'ORGANIZER' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                        u.role === 'STAFF' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono">{u.created_at}</td>
                    <td className="py-3.5 text-right">
                      <span className="text-[11px] text-slate-500">Activo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Orden #</th>
                  <th className="pb-3 font-semibold">Usuario</th>
                  <th className="pb-3 font-semibold">Evento</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ordersList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 pr-4 font-mono font-bold text-brand-300">{ord.number}</td>
                    <td className="py-3.5 pr-4 text-white font-medium">{ord.user}</td>
                    <td className="py-3.5 pr-4 text-slate-400">{ord.event}</td>
                    <td className="py-3.5 pr-4 font-mono font-bold text-emerald-400">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400">{ord.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
