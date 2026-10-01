'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Plus, Minus, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TicketTypeRow } from '@/types/event.types';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';

interface TicketSelectorProps {
  eventSlug: string;
  eventId: string;
  ticketTypes: TicketTypeRow[];
}

export function TicketSelector({ eventSlug, eventId, ticketTypes }: TicketSelectorProps) {
  const router = useRouter();
  // Map of ticket_type_id -> quantity
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleIncrement = (ticket: TicketTypeRow) => {
    const current = quantities[ticket.id] || 0;
    const available = ticket.quantity - ticket.sold_quantity;
    const maxAllowed = Math.min(ticket.max_per_order, available);

    if (current < maxAllowed) {
      setQuantities((prev) => ({
        ...prev,
        [ticket.id]: current + 1,
      }));
    }
  };

  const handleDecrement = (ticketId: string) => {
    const current = quantities[ticketId] || 0;
    if (current > 0) {
      setQuantities((prev) => {
        const next = { ...prev };
        if (current === 1) {
          delete next[ticketId];
        } else {
          next[ticketId] = current - 1;
        }
        return next;
      });
    }
  };

  // Calculations
  const selectedItems = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const ticket = ticketTypes.find((t) => t.id === id)!;
      return {
        ticket_type_id: id,
        name: ticket?.name,
        unit_price: ticket?.price || 0,
        quantity: qty,
        subtotal: (ticket?.price || 0) * qty,
      };
    });

  const totalQuantity = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = selectedItems.reduce((acc, item) => acc + item.subtotal, 0);

  const handleProceedToCheckout = () => {
    if (totalQuantity === 0) return;

    // Store in sessionStorage for fast reliable hydration on checkout page
    const checkoutCart = {
      eventId,
      eventSlug,
      items: selectedItems.map(i => ({ ticket_type_id: i.ticket_type_id, quantity: i.quantity })),
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('eventhub_checkout_cart', JSON.stringify(checkoutCart));
    }

    router.push(`/eventos/${eventSlug}/checkout`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand-400" /> Seleccioná tus Entradas
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Máximo permitido según cada sector. Stock en tiempo real.
          </p>
        </div>
      </div>

      {/* Ticket Types List */}
      <div className="mt-6 space-y-4">
        {ticketTypes.map((ticket) => {
          const available = ticket.quantity - ticket.sold_quantity;
          const isSoldOut = !ticket.is_active || available <= 0;
          const isLowStock = available > 0 && available <= 20;
          const qty = quantities[ticket.id] || 0;

          return (
            <div
              key={ticket.id}
              className={cn(
                "p-5 rounded-2xl border transition-all duration-200",
                isSoldOut
                  ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                  : qty > 0
                  ? "bg-brand-950/20 border-brand-500/60 shadow-glow"
                  : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white">{ticket.name}</h4>
                    {isSoldOut && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/30 text-rose-300">
                        Agotado
                      </span>
                    )}
                    {!isSoldOut && isLowStock && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/30 text-amber-300">
                        ¡Quedan {available}!
                      </span>
                    )}
                  </div>

                  {ticket.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {ticket.description}
                    </p>
                  )}

                  <div className="mt-2 text-xs text-slate-400">
                    Máx. <strong className="text-slate-300">{ticket.max_per_order}</strong> por compra
                  </div>
                </div>

                {/* Price and Counter */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div className="text-right">
                    <span className="font-extrabold text-lg text-white block">
                      {formatCurrency(ticket.price)}
                    </span>
                    <span className="text-[10px] text-slate-400">por ticket</span>
                  </div>

                  {/* Quantity Stepper */}
                  {!isSoldOut ? (
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                      <button
                        onClick={() => handleDecrement(ticket.id)}
                        disabled={qty === 0}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-white">{qty}</span>
                      <button
                        onClick={() => handleIncrement(ticket)}
                        disabled={qty >= Math.min(ticket.max_per_order, available)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold px-4 py-2 bg-slate-900 rounded-xl">
                      No disponible
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Summary Bar */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block">Total a pagar:</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-white">
              {formatCurrency(totalAmount)}
            </span>
            {totalQuantity > 0 && (
              <span className="text-xs text-slate-400">
                ({totalQuantity} {totalQuantity === 1 ? 'entrada' : 'entradas'})
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleProceedToCheckout}
          disabled={totalQuantity === 0}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none text-white shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Continuar al Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
