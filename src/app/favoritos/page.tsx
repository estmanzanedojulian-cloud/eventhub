'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Search, ArrowRight, Sparkles } from 'lucide-react';
import { SEED_EVENTS } from '@/lib/services/event.service';
import { getLocalFavorites } from '@/lib/services/favorite.service';
import { EventCard } from '@/components/events/EventCard';
import { EventWithDetails } from '@/types/event.types';

export default function FavoritosPage() {
  const [favoriteEvents, setFavoriteEvents] = useState<EventWithDetails[]>([]);

  useEffect(() => {
    const favIds = getLocalFavorites();
    const favs = SEED_EVENTS.filter((e) => favIds.includes(e.id));
    setFavoriteEvents(favs);
  }, []);

  return (
    <div className="py-12 sm:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Eventos Guardados
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white">
            Mis Eventos Favoritos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Revisá los festivales y recitales que marcaste para no perderte las fechas de preventa.
          </p>
        </div>

        {favoriteEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl max-w-md mx-auto p-8 space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/40 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-white">No tenés eventos en favoritos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explorá la cartelera y hacé clic en el ícono de corazón para guardar tus shows preferidos.
            </p>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
            >
              <Search className="w-3.5 h-3.5" /> Explorar cartelera
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
