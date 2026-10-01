'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarPlus,
  ArrowLeft,
  Ticket,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { SEED_EVENTS } from '@/lib/services/event.service';

interface TicketTypeInput {
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const { success, error, warning } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('festivales');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city, setCity] = useState('Buenos Aires');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('21:00');
  const [capacity, setCapacity] = useState(1500);

  // Dynamic ticket types list
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([
    { name: 'GENERAL - FASE 1', price: 15000, quantity: 800, description: 'Acceso general al predio' },
    { name: 'VIP LOUNGE', price: 32000, quantity: 200, description: 'Acceso prioritario, deck exclusivo y barra propia' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: 'NUEVA ENTRADA', price: 20000, quantity: 100, description: 'Descripción del sector' },
    ]);
  };

  const handleRemoveTicketType = (index: number) => {
    if (ticketTypes.length <= 1) {
      warning('Atención', 'El evento debe contar con al menos un tipo de entrada');
      return;
    }
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleTicketChange = (index: number, field: keyof TicketTypeInput, value: any) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !venueName.trim() || !startDate) {
      warning('Campos incompletos', 'Completá los campos obligatorios del evento');
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const startsAt = new Date(`${startDate}T${startTime}:00`).toISOString();

      const newEvent: any = {
        id: 'e_custom_' + Math.random().toString(36).substring(2, 9),
        organizer_id: 'd1000000-0000-0000-0000-000000000001',
        title,
        slug,
        description,
        short_description: description.substring(0, 140),
        image_url: imageUrl,
        venue_name: venueName,
        venue_address: venueAddress,
        city,
        state: 'CABA',
        country: 'Argentina',
        starts_at: startsAt,
        ends_at: new Date(new Date(startsAt).getTime() + 8 * 3600 * 1000).toISOString(),
        capacity: Number(capacity),
        status: 'published',
        is_featured: true,
        category: {
          id: 'c_custom',
          name: category === 'festivales' ? 'Festivales' : 'Música en Vivo',
          slug: category,
          description: null,
          icon_name: 'PartyPopper',
          created_at: new Date().toISOString(),
        },
        organizer: {
          id: 'd1000000-0000-0000-0000-000000000001',
          user_id: 'b0000000-0000-0000-0000-000000000002',
          name: 'Mi Productora Pro',
          slug: 'mi-productora',
          description: 'Productora de eventos oficial',
          logo_url: null,
          banner_url: null,
          contact_email: 'productora@eventhub.com',
          contact_phone: null,
          website_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ticket_types: ticketTypes.map((tt, idx) => ({
          id: 't_custom_' + idx + '_' + Math.random().toString(36).substring(2, 7),
          event_id: 'e_custom',
          name: tt.name,
          description: tt.description,
          price: Number(tt.price),
          currency: 'ARS',
          quantity: Number(tt.quantity),
          sold_quantity: 0,
          max_per_order: 6,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      };

      // Add to in-memory events array
      SEED_EVENTS.unshift(newEvent);

      success('¡Evento publicado con éxito!', 'Ya está disponible en la cartelera para comprar entradas');

      setTimeout(() => {
        router.push(`/eventos/${slug}`);
      }, 1200);
    } catch (err: any) {
      error('Error al publicar evento', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          href="/organizer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al panel de organizador
        </Link>
      </div>

      <div>
        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block mb-1">
          Nueva Producción
        </span>
        <h1 className="font-display text-3xl font-extrabold text-white">
          Crear y Publicar Evento
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configurá los datos del evento, fechas, ubicación y definí los diferentes tipos de entrada a la venta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: General Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" /> Información General
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Título del Evento *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Ultra Beats Arena: Edición 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="festivales">Festivales & Fiestas</option>
                  <option value="musica">Música & Recitales</option>
                  <option value="tecnologia">Tecnología & Startups</option>
                  <option value="gastronomia">Gastronomía & Vinos</option>
                  <option value="deportes">Deportes & Maratones</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Capacidad Total Estimada *
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descripción del Evento *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Detallá el cronograma, DJs o artistas invitados, accesos, recomendaciones y requisitos de edad..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> URL de Imagen de Portada
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Date and Location */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" /> Fecha y Ubicación
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fecha del Evento *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hora de Inicio (Apertura de Puertas)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre del Lugar / Recinto *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Estadio Cubierto Parque"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dirección y Ciudad
              </label>
              <input
                type="text"
                placeholder="Ej. Av. Coronel Roca 3500, Buenos Aires"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Ticket Types */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-accent-500" /> Tipos de Entrada y Precios
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Definí los cupos de cada tanda o sector (General, VIP, Early Bird)
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddTicketType}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Tipo
            </button>
          </div>

          <div className="space-y-4">
            {ticketTypes.map((tt, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Sector #{idx + 1}</span>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTicketType(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={tt.name}
                      onChange={(e) => handleTicketChange(idx, 'name', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Precio ($ ARS)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={tt.price}
                      onChange={(e) => handleTicketChange(idx, 'price', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Cantidad / Stock</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={tt.quantity}
                      onChange={(e) => handleTicketChange(idx, 'quantity', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl font-display font-extrabold text-base bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Guardando y publicando evento...</span>
          ) : (
            <>
              <CalendarPlus className="w-5 h-5" />
              <span>PUBLICAR EVENTO EN CARTELERA</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}
