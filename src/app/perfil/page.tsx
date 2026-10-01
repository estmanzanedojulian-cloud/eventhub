'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Shield, Phone, Ticket, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getSavedLocalTickets } from '@/lib/services/checkout.service';

export default function PerfilPage() {
  const { user, profile, role } = useAuth();
  const { success } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || 'Juan Pérez');
  const [phone, setPhone] = useState(profile?.phone || '+54 11 4455-8899');
  const [isSaved, setIsSaved] = useState(false);

  const localTickets = getSavedLocalTickets();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    success('Perfil actualizado', 'Tus cambios fueron guardados exitosamente');
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div>
        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block mb-1">
          Mi Cuenta
        </span>
        <h1 className="font-display text-3xl font-extrabold text-white">
          Perfil de Usuario
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Administrá tus datos personales y revisá el estado de tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left: User Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-accent-500 mx-auto flex items-center justify-center text-white font-display font-extrabold text-2xl shadow-glow">
            {fullName.charAt(0) || 'U'}
          </div>

          <div>
            <h3 className="font-bold text-lg text-white">{fullName}</h3>
            <p className="text-xs text-slate-400">{profile?.email || user?.email || 'asistente@email.com'}</p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
              Rol en la Plataforma
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-950 text-brand-300 border border-brand-500/30 inline-block">
              {role}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <Link
              href="/mis-entradas"
              className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Ticket className="w-4 h-4 text-brand-400" />
              <span>Ver mis {localTickets.length} entradas</span>
            </Link>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" /> Datos Básicos
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Correo Electrónico
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || user?.email || 'asistente@email.com'}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                El correo está vinculado a tu cuenta y no puede modificarse directamente.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Teléfono de Contacto
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-2"
              >
                {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : null}
                <span>{isSaved ? '¡Guardado!' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
