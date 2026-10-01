'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { useToast } from '@/context/ToastContext';
import { SEED_EVENTS } from '@/lib/services/event.service';

interface DiscountCodeItem {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  max_uses: number;
  used_count: number;
  event_title: string;
  is_active: boolean;
  expires_at: string;
}

export default function OrganizerDiscountsPage() {
  const { success, warning } = useToast();

  const [discounts, setDiscounts] = useState<DiscountCodeItem[]>([
    {
      id: 'd_1',
      code: 'EVENTHUB20',
      type: 'percentage',
      value: 20,
      max_uses: 500,
      used_count: 34,
      event_title: 'Todos los eventos',
      is_active: true,
      expires_at: '2026-12-31',
    },
    {
      id: 'd_2',
      code: 'AMIGOS5000',
      type: 'fixed',
      value: 5000,
      max_uses: 100,
      used_count: 89,
      event_title: 'Neon Echoes: Sunset Festival 2026',
      is_active: true,
      expires_at: '2026-11-15',
    },
    {
      id: 'd_3',
      code: 'EARLYVIP30',
      type: 'percentage',
      value: 30,
      max_uses: 50,
      used_count: 50,
      event_title: 'AI & Cloud Future Summit 2026',
      is_active: false,
      expires_at: '2026-08-30',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState(15);
  const [newMaxUses, setNewMaxUses] = useState(200);
  const [newEventId, setNewEventId] = useState('all');

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      warning('Código vacío', 'Ingresá un código promocional válido');
      return;
    }

    const eventTitle =
      newEventId === 'all'
        ? 'Todos los eventos'
        : SEED_EVENTS.find((e) => e.id === newEventId)?.title || 'Evento específico';

    const created: DiscountCodeItem = {
      id: 'd_' + Math.random().toString(36).substring(2, 9),
      code: newCode.trim().toUpperCase(),
      type: newType,
      value: Number(newValue),
      max_uses: Number(newMaxUses),
      used_count: 0,
      event_title: eventTitle,
      is_active: true,
      expires_at: '2026-12-31',
    };

    setDiscounts([created, ...discounts]);
    setShowCreateModal(false);
    setNewCode('');
    success('Cupón creado', `El código ${created.code} ya está activo para el checkout`);
  };

  const handleToggleActive = (id: string) => {
    setDiscounts(
      discounts.map((d) => (d.id === id ? { ...d, is_active: !d.is_active } : d))
    );
    success('Estado actualizado', 'Se actualizó la disponibilidad del código');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al dashboard
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-white">
            Códigos de Descuento y Promociones
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generá cupones promocionales con porcentaje o importe fijo y control de usos máximos.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Crear Nuevo Código
        </button>
      </div>

      {/* Discounts List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Código</th>
                <th className="pb-3 font-semibold">Descuento</th>
                <th className="pb-3 font-semibold">Evento Aplicable</th>
                <th className="pb-3 font-semibold">Usos Realizados</th>
                <th className="pb-3 font-semibold">Vencimiento</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {discounts.map((d) => {
                const percentUsed = Math.min(100, Math.round((d.used_count / d.max_uses) * 100));
                const isExhausted = d.used_count >= d.max_uses;

                return (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-accent-400 shrink-0" />
                        <span className="font-mono font-black text-sm text-white">{d.code}</span>
                      </div>
                    </td>

                    <td className="py-4 pr-4 font-bold text-white">
                      {d.type === 'percentage' ? `${d.value}% OFF` : formatCurrency(d.value) + ' OFF'}
                    </td>

                    <td className="py-4 pr-4 text-slate-300 max-w-[200px] truncate">
                      {d.event_title}
                    </td>

                    <td className="py-4 pr-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>{d.used_count} de {d.max_uses}</span>
                          <span className="font-bold">{percentUsed}%</span>
                        </div>
                        <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isExhausted ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 pr-4 text-slate-400 font-mono">
                      {d.expires_at}
                    </td>

                    <td className="py-4 pr-4">
                      {isExhausted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30">
                          Agotado
                        </span>
                      ) : d.is_active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                          Pausado
                        </span>
                      )}
                    </td>

                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(d.id)}
                        className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                      >
                        {d.is_active ? 'Pausar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-display font-bold text-xl text-white">
              Crear Nuevo Código Promocional
            </h3>

            <form onSubmit={handleCreateDiscount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código (en mayúsculas) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. VERANO30"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white uppercase font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Descuento
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($ ARS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor del Descuento *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Límite de Usos *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aplicable a
                  </label>
                  <select
                    value={newEventId}
                    onChange={(e) => setNewEventId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="all">Todos los eventos</option>
                    {SEED_EVENTS.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-glow transition-all"
                >
                  Guardar Código
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
