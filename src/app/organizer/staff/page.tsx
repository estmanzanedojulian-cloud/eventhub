'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  QrCode,
  ArrowLeft,
  CheckCircle2,
  Mail,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { SEED_EVENTS } from '@/lib/services/event.service';
import { useToast } from '@/context/ToastContext';
import {
  StaffMember,
  getStaffMembers,
  addStaffMember,
  removeStaffMember,
  toggleStaffStatus
} from '@/lib/services/staff.service';

export default function OrganizerStaffPage() {
  const { success, warning, info } = useToast();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'scanner' | 'lead'>('scanner');
  const [selectedEventId, setSelectedEventId] = useState(SEED_EVENTS[0].id);

  const loadData = () => {
    setStaffList(getStaffMembers());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('eventhub_staff_updated', handleUpdate);
    return () => {
      window.removeEventListener('eventhub_staff_updated', handleUpdate);
    };
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) {
      warning('Datos requeridos', 'Completá el nombre y correo del miembro del personal');
      return;
    }

    const event = SEED_EVENTS.find((e) => e.id === selectedEventId) || SEED_EVENTS[0];

    const newMember = await addStaffMember({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      event_id: event.id,
      event_title: event.title,
    });

    loadData();
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    success('Staff asignado', `${newMember.name} fue autorizado para validar tickets en "${event.title}"`);
  };

  const handleRemoveStaff = (id: string, name: string) => {
    if (confirm(`¿Revocar acceso y remover a ${name} del equipo de control?`)) {
      removeStaffMember(id);
      loadData();
      info('Acceso revocado', `Se revocó el permiso de escaneo a ${name}`);
    }
  };

  const handleToggleStatus = (id: string, name: string) => {
    const updated = toggleStaffStatus(id);
    loadData();
    if (updated?.status === 'active') {
      success('Staff reactivado', `Se restableció el permiso para ${name}`);
    } else {
      warning('Staff suspendido', `Se suspendió temporalmente el acceso de ${name}`);
    }
  };

  const handleCopyScannerLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/staff/scan`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      success('Enlace copiado', 'Compartí esta URL del escáner con tus guardias o personal de puerta');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // KPIs
  const totalStaff = staffList.length;
  const activeScanners = staffList.filter((s) => s.role === 'scanner' && s.status === 'active').length;
  const gateLeads = staffList.filter((s) => s.role === 'lead' && s.status === 'active').length;

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al dashboard
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-white">
            Personal de Acceso & Molinetes (Staff)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Asigná usuarios y personal de seguridad autorizados para escanear y validar entradas con cámara o lector láser.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleCopyScannerLink}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 transition-all flex items-center gap-1.5"
            title="Copiar link directo a la app del escáner para guardias"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-brand-400" />}
            <span>Link del Escáner</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Asignar Personal
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Autorizados</span>
          <div className="text-2xl font-black text-white font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-400" />
            {totalStaff}
          </div>
          <p className="text-[11px] text-slate-500">Operadores registrados en la tabla event_staff</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase">Escáneres Operativos</span>
          <div className="text-2xl font-black text-emerald-300 font-display flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            {activeScanners}
          </div>
          <p className="text-[11px] text-slate-500">Habilitados para control con cámara en puertas</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-amber-400 uppercase">Jefes de Puerta (Lead)</span>
          <div className="text-2xl font-black text-amber-300 font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            {gateLeads}
          </div>
          <p className="text-[11px] text-slate-500">Supervisores con acceso a estadísticas de puerta</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Equipo de Control de Puerta Designado
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cada usuario ingresa a <Link href="/staff/scan" className="text-brand-400 underline">/staff/scan</Link> con su cuenta para validar códigos QR
            </p>
          </div>

          <Link
            href="/staff/scan"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" /> Probar Escáner en Vivo <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Operador / Miembro</th>
                <th className="pb-3 font-semibold">Email de Acceso</th>
                <th className="pb-3 font-semibold">Rol Asignado</th>
                <th className="pb-3 font-semibold">Evento Autorizado</th>
                <th className="pb-3 font-semibold">Fecha Asignación</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{s.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {s.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 pr-4 text-slate-300 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      {s.email}
                    </div>
                  </td>

                  <td className="py-4 pr-4">
                    {s.role === 'lead' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-500/30 uppercase">
                        <Shield className="w-3 h-3 text-amber-400" /> Jefe de Acceso
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/30 uppercase">
                        <QrCode className="w-3 h-3 text-emerald-400" /> Escáner
                      </span>
                    )}
                  </td>

                  <td className="py-4 pr-4 text-slate-200 font-medium max-w-[200px] truncate">
                    {s.event_title}
                  </td>

                  <td className="py-4 pr-4 text-slate-400 font-mono">
                    {s.assigned_at}
                  </td>

                  <td className="py-4 pr-4">
                    {s.status === 'active' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        Habilitado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30">
                        Suspendido
                      </span>
                    )}
                  </td>

                  <td className="py-4 text-right space-x-3">
                    <button
                      onClick={() => handleToggleStatus(s.id, s.name)}
                      className={`text-xs font-semibold transition-colors ${
                        s.status === 'active' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      {s.status === 'active' ? 'Suspender' : 'Reactivar'}
                    </button>

                    <button
                      onClick={() => handleRemoveStaff(s.id, s.name)}
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                      title="Revocar acceso"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                Autorizar Personal de Acceso
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              El usuario podrá iniciar sesión en la plataforma y utilizar el lector QR para validar tickets en la puerta.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Matías Fernández"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico (Registrado en EventHub) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="matias.f@seguridad.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rol en el Evento
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="scanner">Escáner / Operador de Molinete (scanner)</option>
                  <option value="lead">Jefe de Puerta / Supervisor (lead)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Evento Autorizado
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {SEED_EVENTS.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-glow transition-all"
                >
                  Autorizar Acceso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
