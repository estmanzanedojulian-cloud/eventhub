'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  Keyboard,
  ShieldCheck
} from 'lucide-react';
import { ValidationResult } from '@/types/ticket.types';
import { validateTicketQR, getSavedCheckins } from '@/lib/services/scanner.service';
import { SEED_EVENTS } from '@/lib/services/event.service';
import { cn } from '@/lib/utils/cn';

interface QRScannerProps {
  initialEventId?: string;
}

export function QRScanner({ initialEventId }: QRScannerProps) {
  const [selectedEventId, setSelectedEventId] = useState(
    initialEventId || SEED_EVENTS[0].id
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ValidationResult | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  // Load check-in history
  useEffect(() => {
    setRecentScans(getSavedCheckins());
  }, [scanResult]);

  // Audio chimes
  const playSound = (type: 'success' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  };

  const handleProcessScan = async (decodedText: string) => {
    if (isValidating) return;
    setIsValidating(true);

    try {
      const res = await validateTicketQR(decodedText, selectedEventId);
      setScanResult(res);

      if (res.success && res.code === 'VALID') {
        playSound('success');
      } else {
        playSound('error');
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        code: 'ERROR',
        message: err.message || 'Error al validar el ticket',
      });
      playSound('error');
    } finally {
      setIsValidating(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleProcessScan(decodedText);
        },
        () => {
          // Frame parse error (ignore continuous scan frames)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera start issue:', err);
      setCameraError(
        'No se pudo activar la cámara directamente. Asegurate de otorgar permisos de cámara en tu navegador o utilizá el ingreso manual de código abajo.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleProcessScan(manualCode.trim());
    setManualCode('');
  };

  const selectedEvent = SEED_EVENTS.find((e) => e.id === selectedEventId) || SEED_EVENTS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Event Selector & Sound Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="w-full sm:w-auto">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Evento Seleccionado para Acceso
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setScanResult(null);
            }}
            className="w-full sm:w-80 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-brand-500"
          >
            {SEED_EVENTS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white"
            title={soundEnabled ? 'Silenciar sonidos de validación' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {!isScanning ? (
            <button
              onClick={startCamera}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" /> Activar Cámara
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center justify-center gap-2"
            >
              <CameraOff className="w-4 h-4" /> Detener Cámara
            </button>
          )}
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left: Camera Viewfinder */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-400" /> Visor del Escáner
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">
              {isScanning ? 'Cámara activa' : 'En pausa'}
            </span>
          </div>

          {/* HTML5 QR Code Mount Element */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            <div id={scannerContainerId} className="w-full h-full" />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/90">
                <Camera className="w-12 h-12 text-slate-600" />
                <p className="text-xs text-slate-400 max-w-xs">
                  Hacé clic en &quot;Activar Cámara&quot; para escanear tickets en tiempo real desde tu dispositivo móvil o laptop.
                </p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
                >
                  Iniciar Cámara
                </button>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-60 h-60 border-2 border-brand-400/80 rounded-2xl animate-pulse" />
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
              {cameraError}
            </div>
          )}

          {/* Manual Ticket Code Input */}
          <form onSubmit={handleManualSubmit} className="pt-2">
            <label className="text-[11px] text-slate-400 font-semibold block mb-1.5 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" /> Ingreso Manual de Código o Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. EVT-NEON-8F4A91 o Token"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 uppercase font-mono"
              />
              <button
                type="submit"
                disabled={isValidating || !manualCode.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition-colors"
              >
                Validar
              </button>
            </div>
          </form>

        </div>

        {/* Right: Validation Feedback Display */}
        <div className="space-y-6">
          
          {/* Validation Result Box (The most critical UI component for door staff) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl min-h-[300px] flex flex-col justify-center">
            
            {scanResult ? (
              <div className="space-y-5 animate-in zoom-in-95 duration-200 text-center">
                
                {/* Result Type Banner */}
                {scanResult.code === 'VALID' && (
                  <div className="p-6 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-100 space-y-2 shadow-glow">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                    <h2 className="font-display font-black text-2xl text-emerald-300">
                      ✅ ENTRADA VÁLIDA
                    </h2>
                    <p className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
                      Acceso Autorizado
                    </p>
                  </div>
                )}

                {scanResult.code === 'ALREADY_USED' && (
                  <div className="p-6 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-100 space-y-2 shadow-2xl">
                    <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
                    <h2 className="font-display font-black text-2xl text-rose-300">
                      ❌ ENTRADA YA UTILIZADA
                    </h2>
                    <p className="text-xs text-rose-200 font-semibold">
                      Acceso Denegado — Código ya escaneado previamente
                    </p>
                    {scanResult.first_checkin_at && (
                      <p className="text-[11px] text-rose-300 font-mono mt-1">
                        Primer ingreso: {new Date(scanResult.first_checkin_at).toLocaleTimeString('es-AR')} hs
                      </p>
                    )}
                  </div>
                )}

                {scanResult.code === 'INVALID_EVENT' && (
                  <div className="p-6 rounded-2xl bg-amber-950/80 border-2 border-amber-500 text-amber-100 space-y-2">
                    <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto" />
                    <h2 className="font-display font-black text-2xl text-amber-300">
                      ❌ ENTRADA INCORRECTA
                    </h2>
                    <p className="text-xs text-amber-200">
                      Esta entrada pertenece a otro evento
                    </p>
                  </div>
                )}

                {scanResult.code === 'NOT_FOUND' && (
                  <div className="p-6 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-100 space-y-2">
                    <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
                    <h2 className="font-display font-black text-2xl text-rose-300">
                      ❌ QR INVÁLIDO
                    </h2>
                    <p className="text-xs text-rose-200">
                      Código no registrado en el sistema
                    </p>
                  </div>
                )}

                {/* Attendee Details Card */}
                {(scanResult.attendee_name || scanResult.ticket_code) && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                    {scanResult.attendee_name && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Titular:</span>
                        <strong className="text-white text-sm">{scanResult.attendee_name}</strong>
                      </div>
                    )}
                    {scanResult.ticket_type && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sector / Tipo:</span>
                        <span className="text-brand-300 font-extrabold uppercase">{scanResult.ticket_type}</span>
                      </div>
                    )}
                    {scanResult.ticket_code && (
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Código Ticket:</span>
                        <span className="text-slate-200 font-bold">{scanResult.ticket_code}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Reset button */}
                <button
                  onClick={() => setScanResult(null)}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Siguiente Entrada
                </button>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <ShieldCheck className="w-16 h-16 mx-auto text-slate-700" />
                <h4 className="font-bold text-base text-slate-300">Esperando Código QR</h4>
                <p className="text-xs max-w-xs mx-auto">
                  Apunta la cámara del teléfono hacia el QR del asistente o ingresa el código del ticket.
                </p>
              </div>
            )}

          </div>

          {/* Quick Recent Activity Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Últimas Validaciones en Puerta
            </h4>

            {recentScans.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {recentScans.slice(0, 5).map((scan) => (
                  <div
                    key={scan.id || Math.random()}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {scan.result === 'VALID' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-white block">{scan.attendee_name || scan.ticket_code}</span>
                        <span className="text-[10px] text-slate-400">{scan.ticket_type || 'Ticket'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {scan.checked_in_at ? new Date(scan.checked_in_at).toLocaleTimeString('es-AR') : 'Reciente'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Aún no se realizaron validaciones en esta sesión.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
