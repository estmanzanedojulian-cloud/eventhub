'use client';

import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; description?: string; duration?: number }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = ({
    type = 'info',
    title,
    description,
    duration = 4000,
  }: {
    type?: ToastType;
    title: string;
    description?: string;
    duration?: number;
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, title, description };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (title: string, description?: string) => addToast({ type: 'success', title, description });
  const error = (title: string, description?: string) => addToast({ type: 'error', title, description });
  const warning = (title: string, description?: string) => addToast({ type: 'warning', title, description });

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5",
              t.type === 'success' && "bg-emerald-950/90 border-emerald-500/30 text-emerald-100",
              t.type === 'error' && "bg-rose-950/90 border-rose-500/30 text-rose-100",
              t.type === 'warning' && "bg-amber-950/90 border-amber-500/30 text-amber-100",
              t.type === 'info' && "bg-slate-900/90 border-indigo-500/30 text-slate-100"
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <h4 className="font-semibold text-sm leading-tight">{t.title}</h4>
              {t.description && <p className="text-xs text-slate-300 mt-1">{t.description}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
