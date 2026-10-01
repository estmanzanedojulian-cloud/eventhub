'use client';

import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { SEED_EVENTS } from '@/lib/services/event.service';
import { useToast } from '@/context/ToastContext';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'scanner' | 'lead';
  event_title: string;
  assigned_at: string;
}

export default function OrganizerStaffPage() {
  const { success, warning } = useToast();

  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'stf_1',
      name: 'Carlos Mendoza',
      email: 'carlos.m@seguridad.com',
      role: 'scanner',
      event_title: 'Neon Echoes: Sunset Festival 2026',
      assigned_at: '2026-09-20',
    },
    {
      id: 'stf_2',
      name: 'Valeria Gómez',
      email: 'valeria.g@seguridad.com',
      role: 'lead',
      event_title: 'Neon Echoes: Sunset Festival 2026',
      assigned_at: '2026-09-21',
    },
    {
      id: 'stf_3',
      name: 'Esteban Paz',
      email: 'esteban.p@control.com',
      role: 'scanner',
      event_title: 'AI & Cloud Future Summit 2026',
      assigned_at: '2026-09-25',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'scanner' | 'lead'>('scanner');
  const [selectedEventId, setSelectedEventId] = useState(SEED_EVENTS[0].id);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) {
      warning('Datos requeridos', 'Completá el nombre y correo del miembro del personal');
      return;
    }

    const event = SEED_EVENTS.find((e) => e.id === selectedEventId) || SEED_EVENTS[0];

    const newMember: StaffMember = {
      id: 'stf_' + Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      event_title: event.title,
      assigned_at: new Date().toISOString().slice(0, 10),
    };

    setStaffList([newMember, ...staffList]);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    success('Staff asignado', `${newMember.name} fue autorizado para validar entradas`);
  };

  const handleRemoveStaff = (id: string, name: string) => {
    setStaffList(staffList.filter((s) => s.id !== id));
    success('Acceso revocado', `Se revocó el permiso de escaneo a ${name}`);
  };

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
            Gestión de Personal de Acceso (Staff)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Asigná inspectores y supervisores de molinete autorizados a escanear tickets en tus eventos.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Asignar Nuevo Staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Miembro del Staff</th>
                <th className="pb-3 font-semibold">Rol Asignado</th>
                <th className="pb-3 font-semibold">Evento Autorizado</th>
                <th className="pb-3 font-semibold">Fecha Asignación</th>
                <th className="pb-3 font-semibold text-right">Permisos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffList.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/30">
                  <td className="py-4 pr-4">
                    <div className="font-bold text-white text-sm">{member.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {member.email}
                    </div>
                  </td>

                  <td className="py-4 pr-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      member.role === 'lead'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {member.role === 'lead' ? 'Supervisor / Lead' : 'Escáner Molinete'}
                    </span>
                  </td>

                  <td className="py-4 pr-4 text-slate-300 max-w-[220px] truncate font-medium">
                    {member.event_title}
                  </td>

                  <td className="py-4 pr-4 text-slate-400 font-mono">
                    {member.assigned_at}
                  </td>

                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleRemoveStaff(member.id, member.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Revocar acceso de validación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Staff */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-display font-bold text-xl text-white">
              Asignar Personal de Acceso
            </h3>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Sánchez"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@control.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Evento Asignado
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {SEED_EVENTS.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rol en Puerta
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="scanner">Escáner (Lectura y validación de QR)</option>
                  <option value="lead">Supervisor de Acceso (Validación y resolución de incidencias)</option>
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
