'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { useToast } from '@/context/ToastContext';
import { SEED_EVENTS } from '@/lib/services/event.service';
import {
  DiscountCodeItem,
  getDiscounts,
  createDiscount,
  toggleDiscountActive,
  deleteDiscount
} from '@/lib/services/discount.service';

export default function OrganizerDiscountsPage() {
  const { success, warning, info } = useToast();
  const [discounts, setDiscounts] = useState<DiscountCodeItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState(15);
  const [newMaxUses, setNewMaxUses] = useState(200);
  const [newEventId, setNewEventId] = useState('all');
  const [newExpiresAt, setNewExpiresAt] = useState('2026-12-31');

  const loadData = () => {
    setDiscounts(getDiscounts());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('eventhub_discounts_updated', handleUpdate);
    return () => {
      window.removeEventListener('eventhub_discounts_updated', handleUpdate);
    };
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      warning('Código vacío', 'Ingresá un código promocional válido');
      return;
    }

    const eventTitle =
      newEventId === 'all'
        ? 'Todos los eventos'
        : SEED_EVENTS.find((e) => e.id === newEventId)?.title || 'Evento específico';

    const created = await createDiscount({
      code: newCode.trim().toUpperCase(),
      type: newType,
      value: Number(newValue),
      max_uses: Number(newMaxUses),
      event_id: newEventId === 'all' ? null : newEventId,
      event_title: eventTitle,
      expires_at: newExpiresAt,
    });

    loadData();
    setShowCreateModal(false);
    setNewCode('');
    success('Cupón creado', `El código "${created.code}" ya está activo y disponible en el checkout`);
  };

  const handleToggleActive = (id: string, code: string) => {
    const updated = toggleDiscountActive(id);
    loadData();
    if (updated?.is_active) {
      success('Cupón reactivado', `El código ${code} fue reactivado exitosamente`);
    } else {
      info('Cupón pausado', `El código ${code} fue pausado temporalmente`);
    }
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`¿Eliminar definitivamente el cupón ${code}?`)) {
      deleteDiscount(id);
      loadData();
      info('Cupón eliminado', `Se eliminó el código promocional ${code}`);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success('Código copiado', `Copiaste "${code}" al portapapeles`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // KPIs
  const totalCodes = discounts.length;
  const activeCodes = discounts.filter((d) => d.is_active).length;
  const totalUses = discounts.reduce((acc, d) => acc + (d.used_count || 0), 0);

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
            Gestión de Códigos de Descuento
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Creá y administrá cupones promocionales con porcentaje o monto fijo y control de stock de usos.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Crear Nuevo Código
        </button>
      </div>

      {/* Discount KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Cupones Creados</span>
          <div className="text-2xl font-black text-white font-display flex items-center gap-2">
            <Tag className="w-5 h-5 text-accent-400" />
            {totalCodes}
          </div>
          <p className="text-[11px] text-slate-500">Configurados para ticketing</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase">Cupones Activos</span>
          <div className="text-2xl font-black text-emerald-300 font-display flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {activeCodes}
          </div>
          <p className="text-[11px] text-slate-500">Aceptados al momento del checkout</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-brand-400 uppercase">Usos Canjeados</span>
          <div className="text-2xl font-black text-brand-300 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            {totalUses}
          </div>
          <p className="text-[11px] text-slate-500">Tickets con descuento procesados</p>
        </div>
      </div>

      {/* Discounts List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Cupones de Descuento Vigentes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Los asistentes pueden ingresar estos códigos en el proceso de compra
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Código</th>
                <th className="pb-3 font-semibold">Beneficio</th>
                <th className="pb-3 font-semibold">Evento Aplicable</th>
                <th className="pb-3 font-semibold">Usos Realizados</th>
                <th className="pb-3 font-semibold">Vencimiento</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {discounts.map((d) => {
                const percentUsed = Math.min(100, Math.round((d.used_count / d.max_uses) * 100));
                const isExhausted = d.used_count >= d.max_uses;

                return (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(d.code)}
                          className="font-mono font-black text-sm text-brand-300 hover:text-white flex items-center gap-1.5 transition-colors"
                          title="Hacer clic para copiar código"
                        >
                          <Tag className="w-3.5 h-3.5 text-accent-400 shrink-0" />
                          <span>{d.code}</span>
                          {copiedCode === d.code ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                          )}
                        </button>
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
                            className={`h-full rounded-full transition-all duration-300 ${isExhausted ? 'bg-rose-500' : 'bg-emerald-500'}`}
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

                    <td className="py-4 text-right space-x-3">
                      <button
                        onClick={() => handleToggleActive(d.id, d.code)}
                        className={`text-xs font-semibold transition-colors ${
                          d.is_active ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                      >
                        {d.is_active ? 'Pausar' : 'Activar'}
                      </button>

                      <button
                        onClick={() => handleDelete(d.id, d.code)}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                        title="Eliminar cupón"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
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
                  Código del Cupón *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. PROMOVIP25"
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
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
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
