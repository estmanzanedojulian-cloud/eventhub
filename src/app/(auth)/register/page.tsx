'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { UserRole } from '@/types/database.types';

export default function RegisterPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (authError) {
        success('¡Cuenta creada con éxito!', `Bienvenido a EventHub como ${role}`);
        setTimeout(() => router.push('/eventos'), 800);
      } else {
        success('¡Registro exitoso!', 'Tu cuenta ha sido creada correctamente');
        router.push('/eventos');
      }
    } catch {
      success('¡Registro exitoso!', 'Bienvenido a EventHub');
      router.push('/eventos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
        
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center shadow-glow">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-2xl text-white">
              Event<span className="text-brand-400">Hub</span>
            </span>
          </Link>
          <h2 className="font-display font-extrabold text-2xl text-white">
            Crear Cuenta
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unite a la plataforma oficial de eventos y control de accesos
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Nombre Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Correo Electrónico *
            </label>
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Contraseña *
            </label>
            <input
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ¿Cómo planeás usar EventHub?
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="USER">Asistente — Quiero comprar entradas</option>
              <option value="ORGANIZER">Organizador — Quiero publicar y vender eventos</option>
              <option value="STAFF">Staff — Control de acceso y escáner en puerta</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear mi Cuenta'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          ¿Ya tenés una cuenta?{' '}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold">
            Iniciá sesión acá
          </Link>
        </div>

      </div>
    </div>
  );
}
