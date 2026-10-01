import React from 'react';
import Link from 'next/link';
import { Ticket, ShieldCheck, Zap, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 text-slate-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-accent-500 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Event<span className="text-brand-400">Hub</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Plataforma profesional de ticketing, publicación y validación de entradas de alta concurrencia para festivales, recitales y eventos masivos.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Transacciones atómicas protegidas</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Para Asistentes</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/eventos" className="hover:text-white transition-colors">Explorar Cartelera</Link></li>
              <li><Link href="/mis-entradas" className="hover:text-white transition-colors">Mis Entradas & QR</Link></li>
              <li><Link href="/eventos?category=festivales" className="hover:text-white transition-colors">Festivales</Link></li>
              <li><Link href="/eventos?category=musica" className="hover:text-white transition-colors">Música en Vivo</Link></li>
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Para Organizadores</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/organizer/dashboard" className="hover:text-white transition-colors">Panel de Control</Link></li>
              <li><Link href="/organizer/events/new" className="hover:text-white transition-colors">Publicar un Evento</Link></li>
              <li><Link href="/organizer/access" className="hover:text-white transition-colors">Control de Acceso</Link></li>
              <li><Link href="/staff/scan" className="hover:text-white transition-colors">Escáner de Entradas</Link></li>
            </ul>
          </div>

          {/* Security & Tech */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Tecnología</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-brand-400" /> PostgreSQL Transaccional</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> QR Tokens Criptográficos</li>
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-accent-500" /> Anti Doble Check-in Atómico</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Control de Stock Pesimista</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} EventHub — Todos los derechos reservados.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Desarrollado con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>para la industria del entretenimiento</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
