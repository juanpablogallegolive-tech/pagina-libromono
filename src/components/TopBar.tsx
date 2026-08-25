'use client';
import { signOut } from 'next-auth/react';

export default function TopBar({ nombre, rol }: { nombre: string; rol: string }) {
  const colorRol = rol === 'ADMIN' ? 'bg-emerald-100 text-emerald-800'
    : rol === 'CONTADOR' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700';
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="pl-12 lg:pl-0">
        <p className="text-sm font-semibold text-slate-700">Panel de gestión</p>
        <p className="text-xs text-slate-400">Multi-empresa · Contabilidad · Recursos Humanos</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">{nombre}</p>
          <span className={`badge ${colorRol}`}>{rol}</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="btn-ghost text-xs">Cerrar sesión</button>
      </div>
    </header>
  );
}
