'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils/currency';

interface SalesChartProps {
  data: Array<{
    date: string;
    sales: number;
    tickets: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxSales = Math.max(...data.map((d) => d.sales), 1);
  const chartHeight = 180;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-lg text-white">
            Evolución de Ventas e Ingresos
          </h3>
          <p className="text-xs text-slate-400">
            Ingresos diarios y tickets emitidos durante los últimos 7 días
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Ingresos ($)
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-500" /> Entradas vendidas
          </div>
        </div>
      </div>

      {/* SVG Responsive Bar/Area Chart */}
      <div className="relative pt-6">
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-[180px] w-full border-b border-slate-800 pb-2">
          {data.map((item, idx) => {
            const heightPercent = Math.max(10, Math.round((item.sales / maxSales) * 100));
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-center shadow-2xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                    <span className="text-[11px] font-bold text-white block">
                      {formatCurrency(item.sales)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.tickets} {item.tickets === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>
                )}

                {/* Bar */}
                <div className="w-full max-w-[48px] bg-slate-800 rounded-t-xl overflow-hidden relative flex flex-col justify-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 via-brand-500 to-indigo-400 rounded-t-xl transition-all duration-300 group-hover:brightness-125"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Day Label */}
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
        <div>
          <span className="text-slate-500 block">Total Semana:</span>
          <span className="text-sm font-bold text-white font-mono">
            {formatCurrency(data.reduce((acc, d) => acc + d.sales, 0))}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Total Tickets:</span>
          <span className="text-sm font-bold text-brand-300 font-mono">
            {data.reduce((acc, d) => acc + d.tickets, 0)} unidades
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Ticket Promedio:</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {formatCurrency(
              Math.round(
                data.reduce((acc, d) => acc + d.sales, 0) /
                  (data.reduce((acc, d) => acc + d.tickets, 0) || 1)
              )
            )}
          </span>
        </div>
      </div>

    </div>
  );
}
