import React from 'react';
import { Metadata } from 'next';
import { getEvents } from '@/lib/services/event.service';
import { EventExplorer } from '@/components/events/EventExplorer';
import { Ticket } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explorar Eventos | EventHub',
  description: 'Descubrí los mejores recitales, festivales, fiestas y conferencias. Comprá entradas oficiales con QR garantizado.',
};

export const revalidate = 30;

export default async function EventosPage() {
  const events = await getEvents();

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
            <Ticket className="w-3.5 h-3.5" /> Cartelera Oficial
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explorá y Comprá Entradas
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Entradas 100% garantizadas con código QR único generado al instante. Elegí tu festival o show favorito.
          </p>
        </div>

        {/* Interactive Explorer with Filters */}
        <EventExplorer initialEvents={events} />

      </div>
    </div>
  );
}
