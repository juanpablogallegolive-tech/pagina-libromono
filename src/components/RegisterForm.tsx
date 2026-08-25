'use client';
import { useState } from 'react';
import Link from 'next/link';
import PasswordChecklist from './PasswordChecklist';
import { passwordValida } from '@/lib/validacion';

export default function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [creado, setCreado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const coinciden = password && confirmar && password === confirmar;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!passwordValida(password)) { setError('La contraseña no cumple todos los requisitos'); return; }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return; }
    setGuardando(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    });
    const data = await res.json();
    setGuardando(false);
    if (!res.ok) { setError(data.error ?? 'Error'); return; }
    setCreado(true);
  }

  if (creado) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Crear Cuenta</h2>
        <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-bold">✅ Cuenta creada</p>
          <p className="mt-1">Tu cuenta quedó registrada con rol de lectura (VISTA). Un administrador puede cambiar tu rol desde el panel.</p>
        </div>
        <Link href="/auth/login" className="btn-primary mt-6 w-full py-2.5 text-center">Ir a iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Crear Cuenta</h2>
      <p className="mt-1 text-sm text-slate-500">Regístrate para comenzar</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="label" htmlFor="nombre">Nombre completo</label>
          <input id="nombre" type="text" required className="input" placeholder="Tu nombre y apellido"
            value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" required className="input" placeholder="correo@ejemplo.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input id="password" type="password" required autoComplete="new-password" className="input"
            placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <PasswordChecklist password={password} />
        </div>
        <div>
          <label className="label" htmlFor="confirmar">Confirmar contraseña</label>
          <input id="confirmar" type="password" required autoComplete="new-password" className="input"
            placeholder="••••••••" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
          {confirmar && !coinciden && <p className="mt-1 text-xs text-rose-600">Las contraseñas no coinciden</p>}
        </div>
        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={guardando} className="btn-primary w-full py-2.5">
          {guardando ? 'Creando…' : 'Crear Cuenta'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta? <Link href="/auth/login" className="font-semibold text-emerald-700 hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}
