import React from 'react';
import Link from 'next/link';
import {
  Ticket,
  Search,
  CalendarPlus,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users2,
  Lock,
  Smartphone
} from 'lucide-react';
import { getEvents } from '@/lib/services/event.service';
import { EventCard } from '@/components/events/EventCard';

export const revalidate = 60;

export default async function HomePage() {
  const events = await getEvents();
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">EventHub v1.0</span>
            <span className="text-slate-500">•</span>
            <span>Sistema Profesional de Ticketing & Scanner QR</span>
          </div>

          {/* Hero Titles */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Descubrí. Comprá.{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-accent-400 bg-clip-text text-transparent">
              Viví el evento.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            La plataforma definitiva para asistentes y organizadores. Comprá entradas con stock en tiempo real, recibí tus tickets con QR único y validá accesos en segundos sin fraudes ni doble check-in.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/eventos"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
              EXPLORAR EVENTOS
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/organizer/events/new"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <CalendarPlus className="w-4 h-4 text-emerald-400" />
              CREAR UN EVENTO
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 border-t border-slate-800/80">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">100%</span>
              <span className="text-xs text-slate-400 mt-1">Transacciones Atómicas</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">&lt; 0.2s</span>
              <span className="text-xs text-slate-400 mt-1">Validación de QR</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">0%</span>
              <span className="text-xs text-slate-400 mt-1">Sobreventa o Doble Uso</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">24/7</span>
              <span className="text-xs text-slate-400 mt-1">Control de Acceso Móvil</span>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED EVENTS SECTION */}
      <section className="py-16 bg-slate-950/40 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Cartelera Destacada
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Próximos Grandes Eventos
              </h2>
            </div>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Ver todos los eventos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-500 uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" /> El Ciclo Completo
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white max-w-2xl mx-auto">
            Cómo Funciona EventHub
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm">
            Desde el momento en que descubrís un evento hasta que atravesás los molinetes en la entrada.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-left relative group hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-display font-extrabold text-lg mb-5">
                01
              </div>
              <h3 className="font-display font-bold text-base text-white mb-2">Explorá y Elegí</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Navegá festivales, recitales y conferencias con filtros por ciudad, categoría y rango de precio en tiempo real.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-left relative group hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-display font-extrabold text-lg mb-5">
                02
              </div>
              <h3 className="font-display font-bold text-base text-white mb-2">Compra Protegida</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bloqueo pesimista de stock en base de datos. Sin riesgo de comprar una entrada ya agotada.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-left relative group hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center font-display font-extrabold text-lg mb-5">
                03
              </div>
              <h3 className="font-display font-bold text-base text-white mb-2">Ticket Único con QR</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada entrada genera su propio QR criptográfico con token impredecible listo en tu billetera digital.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-left relative group hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-display font-extrabold text-lg mb-5">
                04
              </div>
              <h3 className="font-display font-bold text-base text-white mb-2">Validación Instantánea</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El staff escanea con su celular. La entrada queda quemada al instante; el segundo intento es rechazado.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* VALUE PROP: ASISTENTES & ORGANIZADORES */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* For Attendees */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Ticket className="w-3.5 h-3.5" /> Experiencia para Asistentes
              </div>
              <h2 className="font-display text-3xl font-bold text-white">
                Tus entradas siempre a mano, sin complicaciones.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Olvidate de imprimir papeles o buscar PDFs extraviados en tu casilla de email. Con EventHub tenés acceso inmediato a tu código QR optimizado para pantallas móviles, con visualización offline y diseño tipo pase de recital.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">QR Criptográfico Imposible de Falsificar</h4>
                    <p className="text-xs text-slate-400">Generación de tokens seguros asociados individualmente a cada ticket.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Visualizador Móvil con Brillo Optimizado</h4>
                    <p className="text-xs text-slate-400">Lectura instantánea incluso bajo luz solar directa o en la oscuridad del recinto.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/eventos"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300"
                >
                  Explorar eventos en cartelera <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* For Organizers */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <BarChart3 className="w-3.5 h-3.5" /> Para Productores y Organizadores
              </div>

              <h3 className="font-display text-2xl font-bold text-white mb-3">
                Control Total de Ventas y Accesos en Tiempo Real
              </h3>

              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Creá diferentes tandas de entradas (Early Bird, General, VIP), establecé cupos máximos, aplicá cupones de descuento y supervisá el ingreso a tu evento minuto a minuto desde cualquier teléfono.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <Users2 className="w-5 h-5 text-indigo-400 mb-2" />
                  <h5 className="text-xs font-semibold text-white">Gestión de Staff</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Asigná inspectores a puertas específicas sin darles acceso a tus finanzas.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <Lock className="w-5 h-5 text-emerald-400 mb-2" />
                  <h5 className="text-xs font-semibold text-white">Cero Fraude</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Transacciones con bloqueo de fila evitan doble check-in de una misma entrada.</p>
                </div>
              </div>

              <Link
                href="/organizer/dashboard"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                Acceder al Panel de Organizador <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            ¿Listo para vivir la mejor experiencia de ticketing?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
            Unite a los miles de asistentes y productoras que ya utilizan EventHub para sus recitales, festivales y conferencias.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/eventos"
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              Comenzar a Explorar
            </Link>
            <Link
              href="/organizer/events/new"
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              Publicar mi Evento
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
