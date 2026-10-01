'use client';

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface EventFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categories: { id: string; name: string; slug: string }[];
  totalResults: number;
}

export function EventFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
  totalResults,
}: EventFiltersProps) {
  return (
    <div className="space-y-6">
      
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por recital, festival, lugar o ciudad..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500 appearance-none pr-9 cursor-pointer"
            >
              <option value="soonest">📅 Más próximos</option>
              <option value="price_asc">💵 Menor precio</option>
              <option value="price_desc">💎 Mayor precio</option>
            </select>
            <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onCategoryChange('all')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
            selectedCategory === 'all'
              ? "bg-brand-600 text-white shadow-glow"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
          )}
        >
          Todos los eventos
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.slug)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
              selectedCategory === cat.slug
                ? "bg-brand-600 text-white shadow-glow"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        <span>
          Mostrando <strong className="text-white">{totalResults}</strong> {totalResults === 1 ? 'evento disponible' : 'eventos disponibles'}
        </span>
        {(searchQuery || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('all');
            }}
            className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Limpiar filtros
          </button>
        )}
      </div>

    </div>
  );
}
