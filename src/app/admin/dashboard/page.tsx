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
  Lock,
  Unlock,
  Star,
  RotateCcw,
  History,
  ExternalLink,
  ChevronDown,
  UserCheck,
  UserX,
  Sparkles
} from 'lucide-react';
import { SEED_EVENTS } from '@/lib/services/event.service';
import { formatCurrency } from '@/lib/utils/currency';
import { useToast } from '@/context/ToastContext';
import { UserRole } from '@/types/database.types';

interface ManagedEvent {
  id: string;
  title: string;
  slug: string;
  organizer_name: string;
  venue_name: string;
  capacity: number;
  status: 'published' | 'suspended' | 'draft';
  is_featured: boolean;
}

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  created_at: string;
}

interface ManagedOrder {
  id: string;
  number: string;
  user: string;
  event: string;
  total: number;
  status: 'confirmed' | 'refunded' | 'cancelled';
  date: string;
}

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const { success, warning, info } = useToast();
  const [activeTab, setActiveTab] = useState<'events' | 'users' | 'orders' | 'audit'>('events');
  const [searchQuery, setSearchQuery] = useState('');

  // Events State
  const [events, setEvents] = useState<ManagedEvent[]>(
    SEED_EVENTS.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      organizer_name: e.organizer?.name || 'Productora EventHub',
      venue_name: e.venue_name,
      capacity: e.capacity,
      status: 'published',
      is_featured: e.is_featured || false,
    }))
  );

  // Users State
  const [users, setUsers] = useState<ManagedUser[]>([
    { id: 'u_1', name: 'Admin EventHub', email: 'admin@eventhub.com', role: 'ADMIN', status: 'active', created_at: '2026-01-10' },
    { id: 'u_2', name: 'Producciones Neon Live', email: 'contacto@neonlive.com', role: 'ORGANIZER', status: 'active', created_at: '2026-02-14' },
    { id: 'u_3', name: 'Tech Ventures Community', email: 'contacto@techventures.com', role: 'ORGANIZER', status: 'active', created_at: '2026-03-01' },
    { id: 'u_4', name: 'Guardia Puerta Norte', email: 'staff1@eventhub.com', role: 'STAFF', status: 'active', created_at: '2026-04-12' },
    { id: 'u_5', name: 'Juan Pérez', email: 'juan.perez@email.com', role: 'USER', status: 'active', created_at: '2026-05-20' },
    { id: 'u_6', name: 'María Gómez', email: 'maria.g@email.com', role: 'USER', status: 'active', created_at: '2026-06-05' },
    { id: 'u_7', name: 'Carlos Revendedor Sospechoso', email: 'carlos.bot@spam.com', role: 'USER', status: 'suspended', created_at: '2026-08-11' },
  ]);

  // Orders State
  const [orders, setOrders] = useState<ManagedOrder[]>([
    { id: 'ord_1', number: 'ORD-20261001-A91B2C', user: 'Juan Pérez', event: 'Neon Echoes: Sunset Festival', total: 70000, status: 'confirmed', date: 'Hace 10 min' },
    { id: 'ord_2', number: 'ORD-20260928-8F4A10', user: 'Lucía Fernández', event: 'Neon Echoes: Sunset Festival', total: 36000, status: 'confirmed', date: 'Ayer' },
    { id: 'ord_3', number: 'ORD-20260925-3C1E44', user: 'Martín Rodríguez', event: 'AI & Cloud Future Summit', total: 45000, status: 'confirmed', date: 'Hace 3 días' },
    { id: 'ord_4', number: 'ORD-20260920-1122AA', user: 'Pedro Gómez', event: 'Sabores & Fuego: Festival Culinario', total: 18000, status: 'refunded', date: 'Hace 1 semana' },
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([
    {
      id: 'log_1',
      action: 'USUARIO_SUSPENDIDO',
      entity: 'Usuario: Carlos Revendedor Sospechoso',
      details: 'Detectada actividad anormal de bots de compra',
      timestamp: '2026-08-12 14:30',
    },
    {
      id: 'log_2',
      action: 'ROL_ACTUALIZADO',
      entity: 'Usuario: Producciones Neon Live',
      details: 'Elevado de USER a ORGANIZER tras verificación de CUIT',
      timestamp: '2026-02-14 11:00',
    },
    {
      id: 'log_3',
      action: 'REEMBOLSO_PROCESADO',
      entity: 'Orden: ORD-20260920-1122AA',
      details: 'Reembolso por $18.000 emitido a Pedro Gómez',
      timestamp: '2026-09-22 09:15',
    },
  ]);

  const addAuditEntry = (action: string, entity: string, details: string) => {
    const newEntry: AuditEntry = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      action,
      entity,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setAuditLogs([newEntry, ...auditLogs]);
  };

  // Event Moderation Actions
  const handleToggleEventStatus = (eventId: string, title: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const nextStatus = e.status === 'published' ? 'suspended' : 'published';
          if (nextStatus === 'suspended') {
            warning('Evento Suspendido', `Se suspendió temporalmente "${title}". Ya no está visible para la venta.`);
            addAuditEntry('EVENTO_SUSPENDIDO', `Evento: ${title}`, 'Suspendido por administrador');
          } else {
            success('Evento Reactivado', `Se reactivó "${title}". Vuelve a estar en cartelera.`);
            addAuditEntry('EVENTO_REACTIVADO', `Evento: ${title}`, 'Restablecido a publicado');
          }
          return { ...e, status: nextStatus };
        }
        return e;
      })
    );
  };

  const handleToggleFeatured = (eventId: string, title: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const nextFeatured = !e.is_featured;
          if (nextFeatured) {
            success('Evento Destacado', `"${title}" ahora aparece en la marquesina de portada.`);
            addAuditEntry('EVENTO_DESTACADO', `Evento: ${title}`, 'Marcado como destacado');
          } else {
            info('Destacado Quitado', `"${title}" ya no tiene la insignia de portada.`);
            addAuditEntry('EVENTO_NO_DESTACADO', `Evento: ${title}`, 'Desmarcado de portada');
          }
          return { ...e, is_featured: nextFeatured };
        }
        return e;
      })
    );
  };

  // User Moderation Actions
  const handleToggleUserStatus = (userId: string, name: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          if (nextStatus === 'suspended') {
            warning('Usuario Suspendido', `Se revocó el acceso a "${name}". Sus sesiones han sido bloqueadas.`);
            addAuditEntry('USUARIO_SUSPENDIDO', `Usuario: ${name} (${u.email})`, 'Acceso bloqueado por administrador');
          } else {
            success('Usuario Reactivado', `Se restableció el acceso para "${name}".`);
            addAuditEntry('USUARIO_REACTIVADO', `Usuario: ${name} (${u.email})`, 'Acceso desbloqueado');
          }
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleChangeUserRole = (userId: string, name: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          success('Rol Actualizado', `El usuario ${name} ahora tiene rol ${newRole}`);
          addAuditEntry('ROL_MODIFICADO', `Usuario: ${name} (${u.email})`, `Rol cambiado de ${u.role} a ${newRole}`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  // Order Moderation Actions
  const handleRefundOrder = (orderId: string, orderNumber: string, user: string, amount: number) => {
    if (confirm(`¿Proceder con el reembolso de ${formatCurrency(amount)} para la orden ${orderNumber}?`)) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'refunded' } : o))
      );
      warning('Orden Reembolsada', `Se emitieron ${formatCurrency(amount)} de vuelta a ${user}`);
      addAuditEntry('ORDEN_REEMBOLSADA', `Orden: ${orderNumber}`, `Reembolso de ${formatCurrency(amount)} para ${user}`);
    }
  };

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    if (confirm(`¿Cancelar la orden ${orderNumber}? Los tickets asociados serán invalidados.`)) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
      );
      info('Orden Cancelada', `La orden ${orderNumber} ha sido cancelada.`);
      addAuditEntry('ORDEN_CANCELADA', `Orden: ${orderNumber}`, 'Cancelación de tickets asociados');
    }
  };

  // Filtered queries
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.organizer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.venue_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    o.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" /> Administración Global de Plataforma
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white">
            Panel de Control & Moderación
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisión integral con acciones de moderación en tiempo real para eventos, usuarios, roles y órdenes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistema en Línea
          </span>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Usuarios</span>
          <div className="text-2xl font-black text-white font-display flex items-center justify-between">
            <span>{users.length}</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-[11px] text-slate-500">
            {users.filter((u) => u.status === 'active').length} activos • {users.filter((u) => u.status === 'suspended').length} suspendidos
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-xs text-emerald-400 font-semibold uppercase">Productoras Activas</span>
          <div className="text-2xl font-black text-emerald-300 font-display flex items-center justify-between">
            <span>{users.filter((u) => u.role === 'ORGANIZER').length}</span>
            <Building className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-500">Organizadores verificados</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-xs text-brand-400 font-semibold uppercase">Eventos en Sistema</span>
          <div className="text-2xl font-black text-brand-300 font-display flex items-center justify-between">
            <span>{events.length}</span>
            <Calendar className="w-5 h-5 text-brand-400" />
          </div>
          <p className="text-[11px] text-slate-500">
            {events.filter((e) => e.status === 'published').length} publicados • {events.filter((e) => e.status === 'suspended').length} suspendidos
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-xs text-accent-400 font-semibold uppercase">Volumen de Ticketing</span>
          <div className="text-2xl font-black text-accent-300 font-display font-mono flex items-center justify-between">
            <span>{formatCurrency(orders.reduce((acc, o) => acc + (o.status !== 'refunded' ? o.total : 0), 0))}</span>
            <TrendingUp className="w-5 h-5 text-accent-400" />
          </div>
          <p className="text-[11px] text-slate-500">{orders.length} órdenes registradas</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'events' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Eventos ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'users' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Usuarios & Roles ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Órdenes de Compra ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'audit' ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Auditoría ({auditLogs.length})
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

        {/* Tab 1: Event Moderation */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Gestioná el estado de publicación y visibilidad en cartelera de cualquier evento.</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Título del Evento</th>
                    <th className="pb-3 font-semibold">Organizador</th>
                    <th className="pb-3 font-semibold">Lugar</th>
                    <th className="pb-3 font-semibold">Capacidad</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold">Destacado</th>
                    <th className="pb-3 font-semibold text-right">Acciones de Moderación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <span className="font-bold text-white block">{evt.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {evt.id}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-300">{evt.organizer_name}</td>
                      <td className="py-3.5 pr-4 text-slate-400">{evt.venue_name}</td>
                      <td className="py-3.5 pr-4 text-slate-300 font-mono">{evt.capacity}</td>
                      <td className="py-3.5 pr-4">
                        {evt.status === 'published' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Publicado
                          </span>
                        ) : evt.status === 'suspended' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-400" /> Suspendido
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            Borrador
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        <button
                          onClick={() => handleToggleFeatured(evt.id, evt.title)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            evt.is_featured
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                          title={evt.is_featured ? 'Quitar de destacados' : 'Marcar como destacado en portada'}
                        >
                          <Star className={`w-3.5 h-3.5 ${evt.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {/* Real suspend/activate moderation button */}
                        <button
                          onClick={() => handleToggleEventStatus(evt.id, evt.title)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            evt.status === 'published'
                              ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {evt.status === 'published' ? 'Suspender' : 'Reactivar'}
                        </button>

                        <Link
                          href={`/eventos/${evt.slug}`}
                          className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 text-xs text-slate-300 font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          Ver <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: User & Role Moderation */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Modificá roles de usuarios y suspendé accesos maliciosos o de revendedores sospechosos.</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Nombre y Datos</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Rol Asignado</th>
                    <th className="pb-3 font-semibold">Estado de Cuenta</th>
                    <th className="pb-3 font-semibold">Registro</th>
                    <th className="pb-3 font-semibold text-right">Moderación de Cuenta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-bold text-white">{u.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 pr-4 text-slate-400 font-mono">{u.email}</td>

                      <td className="py-3.5 pr-4">
                        {/* Interactive Role Switcher Selector */}
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeUserRole(u.id, u.name, e.target.value as UserRole)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-slate-950 border transition-colors ${
                            u.role === 'ADMIN' ? 'border-rose-500/50 text-rose-300' :
                            u.role === 'ORGANIZER' ? 'border-emerald-500/50 text-emerald-300' :
                            u.role === 'STAFF' ? 'border-amber-500/50 text-amber-300' :
                            'border-slate-700 text-slate-300'
                          }`}
                        >
                          <option value="USER">USER (Asistente)</option>
                          <option value="ORGANIZER">ORGANIZER (Productora)</option>
                          <option value="STAFF">STAFF (Seguridad)</option>
                          <option value="ADMIN">ADMIN (Control Global)</option>
                        </select>
                      </td>

                      <td className="py-3.5 pr-4">
                        {u.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-400" /> Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                            <UserX className="w-3 h-3 text-rose-400" /> Suspendido
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 pr-4 text-slate-400 font-mono">{u.created_at}</td>

                      <td className="py-3.5 text-right space-x-2">
                        {/* Real suspend/activate user action button */}
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.name)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            u.status === 'active'
                              ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspender' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Order Moderation & Refunds */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Supervisá transacciones de compra y emití reembolsos directos ante disputas o cancelaciones.</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Orden #</th>
                    <th className="pb-3 font-semibold">Usuario Comprador</th>
                    <th className="pb-3 font-semibold">Evento</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold">Fecha</th>
                    <th className="pb-3 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-bold text-brand-300">{ord.number}</td>
                      <td className="py-3.5 pr-4 text-white font-medium">{ord.user}</td>
                      <td className="py-3.5 pr-4 text-slate-400 max-w-[200px] truncate">{ord.event}</td>
                      <td className="py-3.5 pr-4 font-mono font-bold text-emerald-400">
                        {formatCurrency(ord.total)}
                      </td>
                      <td className="py-3.5 pr-4">
                        {ord.status === 'confirmed' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            Confirmada
                          </span>
                        ) : ord.status === 'refunded' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                            Reembolsada
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30">
                            Cancelada
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-400">{ord.date}</td>
                      <td className="py-3.5 text-right space-x-2">
                        {ord.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleRefundOrder(ord.id, ord.number, ord.user, ord.total)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-950/60 border border-amber-500/30 hover:border-amber-400 text-amber-300 transition-colors"
                            >
                              Reembolsar
                            </button>
                            <button
                              onClick={() => handleCancelOrder(ord.id, ord.number)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {ord.status !== 'confirmed' && (
                          <span className="text-[11px] text-slate-500 italic">Procesada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Registro inmutable de todas las acciones de moderación ejecutadas en la tabla audit_logs.</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Acción</th>
                    <th className="pb-3 font-semibold">Entidad Afectada</th>
                    <th className="pb-3 font-semibold">Detalle de la Operación</th>
                    <th className="pb-3 font-semibold text-right">Fecha y Hora (UTC-3)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-bold text-brand-300">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-white font-medium">{log.entity}</td>
                      <td className="py-3.5 pr-4 text-slate-300">{log.details}</td>
                      <td className="py-3.5 text-right text-slate-400 font-mono">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
