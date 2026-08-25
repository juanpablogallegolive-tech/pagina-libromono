'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PasswordChecklist from './PasswordChecklist';
import { passwordValida } from '@/lib/validacion';

export default function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [lista, setLista] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const coinciden = password && confirmar && password === confirmar;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!passwordValida(password)) { setError('La contraseña no cumple todos los requisitos'); return; }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return; }
    setGuardando(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setGuardando(false);
    if (!res.ok) { setError(data.error ?? 'Error'); return; }
    setLista(false);
  }

  if (!token) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Nueva Contraseña</h2>
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ Este enlace no incluye un token válido. Solicita uno nuevo desde recuperar contraseña.
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/auth/forgot-password" className="font-semibold text-emerald-700 hover:underline">Solicitar nuevo enlace</Link>
        </p>
      </div>
    );
  }

  if (!lista) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Nueva Contraseña</h2>
        <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-bold">✅ Contraseña actualizada</p>
          <p className="mt-1">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        </div>
        <button onClick={() => router.push('/auth/login')} className="btn-primary mt-6 w-full py-2.5">
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Nueva Contraseña</h2>
      <p className="mt-1 text-sm text-slate-500">Crea una contraseña segura</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="label" htmlFor="password">Nueva contraseña</label>
          <input id="password" type="password" required autoComplete="new-password" className="input"
            placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <PasswordChecklist password={password} />
        </div>
        <div>
          <label className="label" htmlFor="confirmar">Confirmar contraseña</label>
          <input id="confirmar" type="password" required autoComplete="new-password" className="input"
            placeholder="••••••••" value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)} />
          {confirmar && !coinciden && <p className="mt-1 text-xs text-rose-600">Las contraseñas no coinciden</p>}
        </div>
        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={guardando} className="btn-primary w-full py-2.5">
          {guardando ? 'Guardando…' : 'Restablecer Contraseña'}
        </button>
      </form>
    </div>
  );
}
