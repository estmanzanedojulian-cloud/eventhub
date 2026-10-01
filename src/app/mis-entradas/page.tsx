'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Search,
  Calendar,
  MapPin,
  QrCode,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { TicketView } from '@/components/tickets/TicketView';
import { getSavedLocalTickets } from '@/lib/services/checkout.service';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils/cn';

export default function MisEntradasPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'valid' | 'used' | 'all'>('valid');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    // Load local tickets
    const local = getSavedLocalTickets();
    if (local && local.length > 0) {
      setTickets(local);
      setSelectedTicket(local[0]);
    } else {
      // Create initial demo ticket for Neon Echoes so the user can test scanning right away!
      const demoTickets = [
        {
          id: 'tkt_demo_neon_01',
          ticket_code: 'EVT-NEON-8F4A91',
          qr_token: 'demo-token-neon-vip-2026',
          attendee_name: user?.user_metadata?.full_name || 'Juan Pérez',
          attendee_email: user?.email || 'juan.perez@email.com',
          status: 'valid',
          ticket_type_name: 'VIP Lounge & Deck',
          event: {
            id: 'e1000000-0000-0000-0000-000000000001',
            title: 'Neon Echoes: Sunset Festival 2026',
            slug: 'neon-echoes-sunset-festival-2026',
            starts_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
            venue_name: 'Costanera Norte Arena',
            city: 'Buenos Aires',
          }
        },
        {
          id: 'tkt_demo_neon_02',
          ticket_code: 'EVT-NEON-8F4A92',
          qr_token: 'demo-token-neon-vip-2027',
          attendee_name: user?.user_metadata?.full_name || 'Juan Pérez',
          attendee_email: user?.email || 'juan.perez@email.com',
          status: 'valid',
          ticket_type_name: 'VIP Lounge & Deck',
          event: {
            id: 'e1000000-0000-0000-0000-000000000001',
            title: 'Neon Echoes: Sunset Festival 2026',
            slug: 'neon-echoes-sunset-festival-2026',
            starts_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
            venue_name: 'Costanera Norte Arena',
            city: 'Buenos Aires',
          }
        }
      ];
      setTickets(demoTickets);
      setSelectedTicket(demoTickets[0]);
    }
  }, [user]);

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'valid') return t.status === 'valid';
    if (activeTab === 'used') return t.status === 'used';
    return true;
  });

  return (
    <div className="py-10 sm:py-14 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold mb-2">
              <Ticket className="w-3.5 h-3.5" /> Billetera de Entradas
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white">
              Mis Entradas
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Accedé a tus tickets y presentá tu código QR único en los molinetes de acceso.
            </p>
          </div>

          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200"
          >
            Explorar más eventos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('valid')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'valid'
                ? "bg-brand-600 text-white shadow-glow"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" /> Próximos / Válidos (
            {tickets.filter((t) => t.status === 'valid').length})
          </button>

          <button
            onClick={() => setActiveTab('used')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'used'
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Ya Utilizadas (
            {tickets.filter((t) => t.status === 'used').length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
              activeTab === 'all'
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            Todos ({tickets.length})
          </button>
        </div>

        {/* Tickets Grid & Ticket Card Preview */}
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: List of tickets */}
            <div className="lg:col-span-6 space-y-4">
              {filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const isUsed = t.status === 'used';

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                      isSelected
                        ? "bg-slate-900 border-brand-500 shadow-glow"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700",
                      isUsed && "opacity-60"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-brand-400">
                          {t.ticket_code}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold",
                          isUsed ? "bg-slate-800 text-slate-400" : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                        )}>
                          {isUsed ? 'Ingresado' : 'Válido'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white line-clamp-1">
                        {t.event?.title || 'Festival'}
                      </h4>

                      <p className="text-xs text-slate-400">
                        Sector: <strong className="text-slate-300">{t.ticket_type_name || 'VIP'}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Titular: {t.attendee_name}
                      </p>

                      <div className="pt-1.5 flex items-center gap-2">
                        <Link
                          href={`/mis-entradas/${t.id || t.ticket_code}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          <span>Pase individual & PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center">
                        <QrCode className="w-full h-full text-slate-950" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Ver pase &gt;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Focused Physical Ticket Pass */}
            <div className="lg:col-span-6 sticky top-24">
              {selectedTicket ? (
                <TicketView ticket={selectedTicket} />
              ) : (
                <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs">
                  Seleccioná un ticket de la lista para ver su pase con código QR
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl max-w-md mx-auto p-8">
            <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-white">No tenés entradas en esta categoría</h3>
            <p className="text-xs text-slate-400 mt-2">
              Explorá la cartelera de eventos disponibles para adquirir tus pases oficiales.
            </p>
            <Link
              href="/eventos"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
            >
              Ver cartelera de eventos
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
