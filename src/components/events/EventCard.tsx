'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, Flame, Heart } from 'lucide-react';
import { EventWithDetails } from '@/types/event.types';
import { formatCurrency } from '@/lib/utils/currency';
import { formatEventShortDate } from '@/lib/utils/date';
import { isEventFavorite, toggleFavorite } from '@/lib/services/favorite.service';

interface EventCardProps {
  event: EventWithDetails;
}

export function EventCard({ event }: EventCardProps) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isEventFavorite(event.id));
  }, [event.id]);

  const { day, month } = formatEventShortDate(event.starts_at);
  const lowestPrice = event.ticket_types && event.ticket_types.length > 0
    ? Math.min(...event.ticket_types.filter(t => t.is_active).map(t => t.price))
    : 0;

  const totalQuantity = event.ticket_types?.reduce((acc, t) => acc + t.quantity, 0) || 1;
  const totalSold = event.ticket_types?.reduce((acc, t) => acc + t.sold_quantity, 0) || 0;
  const isAlmostSoldOut = totalSold / totalQuantity >= 0.8 && totalSold < totalQuantity;
  const isSoldOut = totalSold >= totalQuantity;

  return (
    <div className="group relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-card transition-all duration-300">
      
      {/* Thumbnail Container */}
      <Link href={`/eventos/${event.slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 block">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'}
          alt={event.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Date Stamp Badge */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 flex flex-col items-center shadow-lg">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400 leading-none">{month}</span>
          <span className="text-base font-extrabold text-white leading-none mt-0.5">{day}</span>
        </div>

        {/* Urgency Badge */}
        {isAlmostSoldOut && (
          <div className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Flame className="w-3.5 h-3.5 fill-slate-950" />
            ¡Últimas Entradas!
          </div>
        )}
        {isSoldOut && (
          <div className="absolute top-3 right-3 bg-rose-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
            Agotado
          </div>
        )}

        {/* Category Pill */}
        {event.category && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700/60 text-slate-200 text-xs font-medium px-2.5 py-0.5 rounded-md">
            {event.category.name}
          </div>
        )}

        {/* Favorite Heart Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(event.id);
            setFav(!fav);
          }}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-rose-400 hover:scale-110 transition-all shadow-md z-10"
          title="Guardar en favoritos"
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/eventos/${event.slug}`}>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-300 transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {event.short_description || event.description}
          </p>

          <div className="mt-4 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>{new Date(event.starts_at).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(event.starts_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue_name}, {event.city}</span>
            </div>
          </div>
        </div>

        {/* Price & Buy Button Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Desde</span>
            <span className="font-bold text-base text-white">
              {formatCurrency(lowestPrice)}
            </span>
          </div>

          <Link
            href={`/eventos/${event.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all active:scale-95"
          >
            <Ticket className="w-3.5 h-3.5" />
            Comprar
          </Link>
        </div>

      </div>

    </div>
  );
}
