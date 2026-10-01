import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'brand' | 'emerald' | 'accent' | 'amber';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'brand',
}: MetricCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
            color === 'brand' && "bg-brand-500/10 text-brand-400 border border-brand-500/20",
            color === 'emerald' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            color === 'accent' && "bg-accent-500/10 text-accent-400 border border-accent-500/20",
            color === 'amber' && "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-bold text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
