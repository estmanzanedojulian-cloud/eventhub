'use client';

import React, { useState, useMemo } from 'react';
import { EventWithDetails } from '@/types/event.types';
import { EventFilters } from './EventFilters';
import { EventCard } from './EventCard';
import { CalendarX, Search } from 'lucide-react';

interface EventExplorerProps {
  initialEvents: EventWithDetails[];
}

export function EventExplorer({ initialEvents }: EventExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('soonest');

  // Extract unique categories
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string }>();
    initialEvents.forEach((e) => {
      if (e.category) {
        map.set(e.category.slug, {
          id: e.category.id,
          name: e.category.name,
          slug: e.category.slug,
        });
      }
    });
    return Array.from(map.values());
  }, [initialEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return initialEvents
      .filter((evt) => {
        // Query search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = evt.title.toLowerCase().includes(q);
          const matchVenue = evt.venue_name.toLowerCase().includes(q);
          const matchCity = evt.city.toLowerCase().includes(q);
          const matchDesc = evt.description.toLowerCase().includes(q);
          if (!matchTitle && !matchVenue && !matchCity && !matchDesc) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (evt.category?.slug !== selectedCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'soonest') {
          return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
        }
        if (sortBy === 'price_asc') {
          const priceA = a.ticket_types?.length ? Math.min(...a.ticket_types.map(t => t.price)) : 0;
          const priceB = b.ticket_types?.length ? Math.min(...b.ticket_types.map(t => t.price)) : 0;
          return priceA - priceB;
        }
        if (sortBy === 'price_desc') {
          const priceA = a.ticket_types?.length ? Math.max(...a.ticket_types.map(t => t.price)) : 0;
          const priceB = b.ticket_types?.length ? Math.max(...b.ticket_types.map(t => t.price)) : 0;
          return priceB - priceA;
        }
        return 0;
      });
  }, [initialEvents, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-10">
      
      {/* Filters Control Bar */}
      <EventFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        totalResults={filteredEvents.length}
      />

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <CalendarX className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">No encontramos eventos</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            No hay eventos que coincidan con &quot;{searchQuery}&quot; en la categoría seleccionada. Probá modificando el término de búsqueda o restableciendo los filtros.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-6 px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
          >
            Ver todos los eventos
          </button>
        </div>
      )}

    </div>
  );
}
