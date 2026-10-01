import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getEventBySlug } from '@/lib/services/event.service';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: 'Checkout | EventHub' };

  return {
    title: `Finalizar Compra — ${event.title} | EventHub`,
    description: `Comprá tus entradas oficiales para ${event.title} con confirmación inmediata y código QR seguro.`,
  };
}

export default async function CheckoutPage({ params }: PageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen py-6">
      <CheckoutForm event={event} />
    </div>
  );
}
