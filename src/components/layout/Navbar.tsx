'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Ticket,
  Search,
  CalendarPlus,
  QrCode,
  LayoutDashboard,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils/cn';
import { UserRole } from '@/types/database.types';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, role, isOrganizer, isStaff, isAdmin, signOut, setDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const rolesList: { id: UserRole; label: string; desc: string; color: string }[] = [
    { id: 'USER', label: 'Asistente (User)', desc: 'Explorar, comprar y ver QR', color: 'bg-indigo-500' },
    { id: 'ORGANIZER', label: 'Organizador', desc: 'Crear eventos, entradas y métricas', color: 'bg-emerald-500' },
    { id: 'STAFF', label: 'Staff / Seguridad', desc: 'Escanear QR y validar accesos', color: 'bg-amber-500' },
    { id: 'ADMIN', label: 'Administrador', desc: 'Control global de la plataforma', color: 'bg-rose-500' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-brand-500 to-accent-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Event<span className="text-brand-400">Hub</span>
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold -mt-1">
              Ticketera Pro
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/eventos"
            className={cn(
              "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
              pathname === '/eventos'
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            )}
          >
            <Search className="w-4 h-4 text-brand-400" />
            Explorar Eventos
          </Link>

          {/* User Links */}
          <Link
            href="/mis-entradas"
            className={cn(
              "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
              pathname.startsWith('/mis-entradas')
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            )}
          >
            <Ticket className="w-4 h-4 text-accent-500" />
            Mis Entradas
          </Link>

          {/* Organizer Links */}
          {isOrganizer && (
            <>
              <Link
                href="/organizer/dashboard"
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                  pathname.startsWith('/organizer/dashboard')
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/30"
                )}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                Panel Organizador
              </Link>
              <Link
                href="/organizer/events/new"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center gap-1.5"
              >
                <CalendarPlus className="w-4 h-4 text-indigo-400" />
                Crear Evento
              </Link>
            </>
          )}

          {/* Staff Scanner Link */}
          {isStaff && (
            <Link
              href="/staff/scan"
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                pathname.startsWith('/staff/scan')
                  ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                  : "text-slate-300 hover:text-amber-300 hover:bg-amber-950/30"
              )}
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              Escanear QR
            </Link>
          )}

          {/* Admin Link */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                pathname.startsWith('/admin')
                  ? "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                  : "text-slate-300 hover:text-rose-300 hover:bg-rose-950/30"
              )}
            >
              <Shield className="w-4 h-4 text-rose-400" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right side: Role Switcher & Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Quick Demo Role Selector */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 transition-all shadow-sm"
              title="Cambiar rol activo para probar la plataforma"
            >
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                role === 'USER' && "bg-indigo-400",
                role === 'ORGANIZER' && "bg-emerald-400",
                role === 'STAFF' && "bg-amber-400",
                role === 'ADMIN' && "bg-rose-400"
              )} />
              <span>Rol: <strong className="text-white">{role}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Cambiar Rol de Prueba
                  </p>
                  <p className="text-[11px] text-slate-400">Verifica cómo ve el sistema cada actor</p>
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setDemoRole(r.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors",
                      role === r.id ? "bg-slate-800 text-white" : "hover:bg-slate-800/60 text-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", r.color)} />
                        {r.label}
                      </span>
                      {role === r.id && <span className="text-[10px] text-brand-400 font-mono">Activo</span>}
                    </div>
                    <span className="text-[11px] text-slate-400 ml-4">{r.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link
                href="/perfil"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{profile?.full_name || user.email}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all active:scale-95"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-900 border border-slate-700 text-slate-200"
          >
            {role}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-4">
          <Link
            href="/eventos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <Search className="w-4 h-4 text-brand-400" /> Explorar Eventos
          </Link>
          <Link
            href="/mis-entradas"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <Ticket className="w-4 h-4 text-accent-500" /> Mis Entradas
          </Link>
          {isOrganizer && (
            <Link
              href="/organizer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-300 hover:bg-emerald-950/40"
            >
              <LayoutDashboard className="w-4 h-4" /> Panel Organizador
            </Link>
          )}
          {isStaff && (
            <Link
              href="/staff/scan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-300 hover:bg-amber-950/40"
            >
              <QrCode className="w-4 h-4" /> Escanear QR
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-950/40"
            >
              <Shield className="w-4 h-4" /> Admin Global
            </Link>
          )}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300"
                >
                  <User className="w-4 h-4" /> Mi Perfil ({profile?.full_name || user.email})
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-rose-400 text-left"
                >
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-medium text-slate-200 bg-slate-800 rounded-lg"
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold text-white bg-brand-600 rounded-lg"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
