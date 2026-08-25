'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const MODULOS = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/empresas', label: 'Empresas', icon: '🏢' },
  { href: '/facturas', label: 'Facturas', icon: '📄' },
  { href: '/reportes', label: 'Reportes', icon: '📈' },
  { href: '/retefuente', label: 'Retefuente', icon: '🧾' },
  { href: '/saldos', label: 'Saldos', icon: '💰' },
  { href: '/rh', label: 'RH', icon: '👥' },
  { href: '/contador-ia', label: 'Contador IA', icon: '🤖' },
  { href: '/ia-exogena', label: 'IA Exógena', icon: '🇨🇴' },
  { href: '/admin/usuarios', label: 'Admin', icon: '⚙️' },
];

export default function Sidebar({ rol }: { rol: string }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const items = MODULOS.filter((m) => !m.href.startsWith('/admin') || rol === 'ADMIN');

  return (
    <>
      <button onClick={() => setAbierto(!abierto)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-900 p-2 text-white shadow-lg lg:hidden"
        aria-label="Menú">☰</button>
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-100 transition-transform lg:translate-x-0 ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg">🛠️</span>
          <div>
            <p className="text-sm font-bold leading-tight">Ferretería El Paisa</p>
            <p className="text-xs text-slate-400">Contabilidad & RH</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {items.map((m) => {
            const activo = m.href === '/' ? pathname === '/' : pathname.startsWith(m.href);
            return (
              <Link key={m.href} href={m.href} onClick={() => setAbierto(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  activo ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}>
                <span>{m.icon}</span>{m.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-slate-800 p-4 text-xs text-slate-500">
          © 2024–2026 Sistema Contable Ferretería
        </div>
      </aside>
      {abierto && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setAbierto(false)} />}
    </>
  );
}
