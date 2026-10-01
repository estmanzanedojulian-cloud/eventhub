'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Search, ArrowRight, Sparkles, Trash2 } from 'lucide-react';
import { SEED_EVENTS } from '@/lib/services/event.service';
import { getLocalFavorites, saveLocalFavorites } from '@/lib/services/favorite.service';
import { EventCard } from '@/components/events/EventCard';
import { EventWithDetails } from '@/types/event.types';
import { useToast } from '@/context/ToastContext';

export default function FavoritosPage() {
  const [favoriteEvents, setFavoriteEvents] = useState<EventWithDetails[]>([]);
  const { info } = useToast();

  const loadFavorites = () => {
    const favIds = getLocalFavorites();
    const favs = SEED_EVENTS.filter((e) => favIds.includes(e.id));
    setFavoriteEvents(favs);
  };

  useEffect(() => {
    loadFavorites();

    const handleFavChange = () => {
      loadFavorites();
    };

    window.addEventListener('eventhub_favorites_updated', handleFavChange);
    return () => {
      window.removeEventListener('eventhub_favorites_updated', handleFavChange);
    };
  }, []);

  const handleClearAll = () => {
    if (confirm('¿Querés vaciar todos tus eventos favoritos?')) {
      saveLocalFavorites([]);
      setFavoriteEvents([]);
      info('Favoritos vaciados', 'Se quitaron todos los eventos de tu lista');
    }
  };

  return (
    <div className="py-12 sm:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Eventos Guardados
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white">
              Mis Eventos Favoritos
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Revisá los festivales y recitales que marcaste para no perderte las fechas de preventa ni cambios de precio.
            </p>
          </div>

          {favoriteEvents.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">
                {favoriteEvents.length} {favoriteEvents.length === 1 ? 'evento guardado' : 'eventos guardados'}
              </span>
              <button
                onClick={handleClearAll}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Vaciar lista
              </button>
            </div>
          )}
        </div>

        {/* Content Grid */}
        {favoriteEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl max-w-md mx-auto p-8 space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/40 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-white">No tenés eventos en favoritos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explorá la cartelera y hacé clic en el ícono de corazón para guardar tus shows preferidos y acceder rápidamente a ellos.
            </p>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
            >
              <Search className="w-3.5 h-3.5" /> Explorar cartelera de eventos
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
