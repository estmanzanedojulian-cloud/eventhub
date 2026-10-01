import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Share2,
  Heart,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Ticket
} from 'lucide-react';
import { getEventBySlug, getEvents } from '@/lib/services/event.service';
import { TicketSelector } from '@/components/events/TicketSelector';
import { formatEventDate, formatEventTime, formatRelativeTime } from '@/lib/utils/date';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: 'Evento no encontrado | EventHub' };

  return {
    title: `${event.title} | EventHub`,
    description: event.short_description || event.description.substring(0, 160),
    openGraph: {
      title: event.title,
      description: event.short_description || event.description.substring(0, 160),
      images: event.image_url ? [{ url: event.image_url }] : [],
    },
  };
}

export const revalidate = 30;

export default async function EventDetailPage({ params }: PageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const relativeTime = formatRelativeTime(event.starts_at);

  return (
    <div className="pb-24">
      
      {/* Top Banner Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Link
          href="/eventos"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a eventos
        </Link>
      </div>

      {/* Hero Visual Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Category Tag & Countdown Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2">
            {event.category && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md border border-slate-700 text-white">
                {event.category.name}
              </span>
            )}
            {relativeTime && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-600/90 text-white shadow-glow">
                {relativeTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Details, Description, Location */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Title & Quick Info */}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {event.title}
              </h1>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Date & Time Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Fecha y Hora</span>
                    <span className="text-sm font-bold text-white capitalize block mt-0.5">
                      {formatEventDate(event.starts_at)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Puertas: {formatEventTime(event.starts_at)}
                    </span>
                  </div>
                </div>

                {/* Venue & Location Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Lugar del Evento</span>
                    <span className="text-sm font-bold text-white block mt-0.5">
                      {event.venue_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {event.venue_address}, {event.city}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">
                Acerca de este evento
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Organizer Card */}
            {event.organizer && (
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-white">
                    {event.organizer.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Organizado por</span>
                    <h4 className="font-bold text-base text-white">{event.organizer.name}</h4>
                    <p className="text-xs text-slate-400">{event.organizer.contact_email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Guarantee Box */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-white">Compra Segura & Ticket Oficial</h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tus entradas se emiten con código QR intransferible y registro atómico en la base de datos de EventHub.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Ticket Selector Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TicketSelector
                eventSlug={event.slug}
                eventId={event.id}
                ticketTypes={event.ticket_types || []}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
