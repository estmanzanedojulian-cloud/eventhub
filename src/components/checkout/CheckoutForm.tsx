'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  ShieldCheck,
  CreditCard,
  Tag,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventWithDetails } from '@/types/event.types';
import { formatCurrency } from '@/lib/utils/currency';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { executeCheckout } from '@/lib/services/checkout.service';

interface CheckoutFormProps {
  event: EventWithDetails;
}

export function CheckoutForm({ event }: CheckoutFormProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { success, error, warning } = useToast();

  const [cartItems, setCartItems] = useState<Array<{ ticket_type_id: string; quantity: number }>>([]);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent?: number; amount?: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'demo_card' | 'mercadopago'>('demo_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load cart from sessionStorage or pick first available ticket
  useEffect(() => {
    if (user || profile) {
      if (!attendeeName) setAttendeeName(profile?.full_name || '');
      if (!attendeeEmail) setAttendeeEmail(profile?.email || user?.email || '');
    }

    if (typeof window !== 'undefined') {
      try {
        const rawCart = sessionStorage.getItem('eventhub_checkout_cart');
        if (rawCart) {
          const parsed = JSON.parse(rawCart);
          if (parsed.items && parsed.items.length > 0) {
            setCartItems(parsed.items);
            return;
          }
        }
      } catch {}

      // Fallback: pick first active ticket type
      const firstActive = event.ticket_types.find((t) => t.is_active && (t.quantity - t.sold_quantity) > 0);
      if (firstActive) {
        setCartItems([{ ticket_type_id: firstActive.id, quantity: 1 }]);
      }
    }
  }, [user, profile, event]);

  // Calculations
  const detailedItems = cartItems.map((item) => {
    const tt = event.ticket_types.find((t) => t.id === item.ticket_type_id);
    const unitPrice = tt?.price || 0;
    return {
      ticket_type_id: item.ticket_type_id,
      name: tt?.name || 'Entrada',
      unit_price: unitPrice,
      quantity: item.quantity,
      subtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = detailedItems.reduce((acc, i) => acc + i.subtotal, 0);

  // Calculate discount
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.percent) {
      discountAmount = Math.round(subtotal * (appliedDiscount.percent / 100));
    } else if (appliedDiscount.amount) {
      discountAmount = Math.min(appliedDiscount.amount, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyDiscount = () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'EVENTHUB20') {
      setAppliedDiscount({ code, percent: 20 });
      success('¡Cupón aplicado!', '20% de descuento en tu compra');
    } else if (code === 'AMIGOS5000') {
      setAppliedDiscount({ code, amount: 5000 });
      success('¡Cupón aplicado!', '$5.000 de descuento en tu compra');
    } else {
      error('Código no válido', 'El código de descuento no existe o ha expirado');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      warning('Datos incompletos', 'Por favor ingresá el nombre y email del asistente');
      return;
    }

    if (cartItems.length === 0 || subtotal === 0) {
      warning('Carrito vacío', 'Seleccioná al menos una entrada para continuar');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await executeCheckout({
        event_id: event.id,
        items: cartItems,
        discount_code: appliedDiscount?.code,
        attendee_info: {
          attendee_name: attendeeName.trim(),
          attendee_email: attendeeEmail.trim(),
        },
        payment_method: paymentMethod,
      });

      if (response.success) {
        setIsSuccess(true);
        // Fire celebration confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        success('¡Compra confirmada con éxito!', `Se generaron ${response.tickets_count} tickets con QR único`);

        // Clear session cart
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('eventhub_checkout_cart');
        }

        setTimeout(() => {
          router.push('/mis-entradas');
        }, 1800);
      }
    } catch (err: any) {
      error('Error al procesar la compra', err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/eventos/${event.slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Modificar selección de entradas
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Form & Attendee details */}
        <div className="lg:col-span-7 space-y-8">
          
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Checkout Seguro
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Completá tus datos para emitir los tickets nominativos y sus códigos QR individuales.
            </p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Attendee Details Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-brand-400" /> Datos del Asistente Principal
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Los tickets se vincularán a este correo y estarán siempre disponibles en tu cuenta.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Método de Pago
              </h3>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-brand-500/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'demo_card'}
                      onChange={() => setPaymentMethod('demo_card')}
                      className="text-brand-500 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-white block">
                        Pasarela Demo (Instantánea / Tarjeta de Prueba)
                      </span>
                      <span className="text-xs text-slate-400">
                        Simula la confirmación bancaria inmediata y emite los QR en la base de datos.
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-500/20">
                    Activo
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Confirmation Button */}
            <button
              type="submit"
              disabled={isSubmitting || isSuccess || total === 0}
              className="w-full py-4 rounded-2xl font-display font-extrabold text-base bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-glow transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Validando stock y emitiendo entradas...</span>
              ) : isSuccess ? (
                <span className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" /> ¡Compra Exitosa! Redirigiendo...
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>CONFIRMAR COMPRA — {formatCurrency(total)}</span>
                </>
              )}
            </button>

          </form>

        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 sticky top-24 shadow-2xl space-y-6">
            
            <h3 className="font-display font-bold text-lg text-white pb-4 border-b border-slate-800">
              Resumen de la Orden
            </h3>

            {/* Event Mini Banner */}
            <div className="flex gap-3 items-center">
              <img
                src={event.image_url || ''}
                alt={event.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{event.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{event.venue_name}, {event.city}</p>
                <p className="text-[11px] text-brand-400 mt-0.5">
                  {new Date(event.starts_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} • {new Date(event.starts_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                </p>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              {detailedItems.map((item) => (
                <div key={item.ticket_type_id} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="text-slate-400 ml-1">× {item.quantity}</span>
                  </div>
                  <span className="font-mono text-slate-200">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Discount Code Input Box */}
            <div className="pt-4 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-accent-500" /> Código de Descuento
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. EVENTHUB20"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  disabled={appliedDiscount !== null}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                {appliedDiscount ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedDiscount(null);
                      setDiscountCode('');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-rose-400 hover:bg-slate-700"
                  >
                    Quitar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                  >
                    Aplicar
                  </button>
                )}
              </div>

              <div className="mt-2 text-[11px] text-slate-400">
                Probá con <code className="text-accent-400 font-mono">EVENTHUB20</code> (20% OFF)
              </div>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Descuento aplicado ({appliedDiscount?.code}):</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                <span>TOTAL:</span>
                <span className="text-xl font-display text-brand-300">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Anti-Overselling Trust Badge */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Entradas generadas individualmente en base de datos. Cada una cuenta con su propio QR irrepetible.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
