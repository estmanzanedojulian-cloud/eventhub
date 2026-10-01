import React from 'react';
import { Metadata } from 'next';
import { QRScanner } from '@/components/scanner/QRScanner';
import { QrCode, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Control de Acceso / Escáner | EventHub Staff',
  description: 'Módulo móvil de validación de entradas y control de acceso en molinetes.',
};

export default function StaffScanPage() {
  return (
    <div className="py-8 sm:py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <QrCode className="w-3.5 h-3.5" /> Terminal de Acceso Staff
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Escáner y Validación de Entradas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Validación atómica en tiempo real. Previene doble check-in de una misma entrada.
          </p>
        </div>

        {/* Scanner Component */}
        <QRScanner />

      </div>
    </div>
  );
}
