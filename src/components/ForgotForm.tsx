'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotForm() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true); setError(''); setMensaje(''); setResetUrl('');
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setEnviando(false);
    if (!res.ok) { setError(data.error ?? 'Error'); return; }
    setMensaje(data.mensaje);
    if (data.resetUrl) setResetUrl(data.resetUrl);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Recuperar Contraseña</h2>
      <p className="mt-1 text-sm text-slate-500">Ingresa tu email para recuperar tu cuenta</p>

      {!resetUrl && !mensaje && (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="label" htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" required className="input" placeholder="correo@ferreteria.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <button type="submit" disabled={enviando} className="btn-primary w-full py-2.5">
            {enviando ? 'Enviando…' : 'Enviar Enlace de Recuperación'}
          </button>
        </form>
      )}

      {mensaje && !resetUrl && (
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          📬 {mensaje}
        </div>
      )}

      {resetUrl && (
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-bold">✅ Enlace de recuperación generado</p>
            <p className="mt-1">Válido por 1 hora. Como no hay servicio de correo configurado en modo demostración, el enlace se muestra aquí:</p>
            <Link href={resetUrl} className="mt-3 block break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-emerald-800 underline">
              {resetUrl}
            </Link>
          </div>
          <Link href={resetUrl} className="btn-primary w-full py-2.5">Continuar → Restablecer contraseña</Link>
        </div>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/auth/login" className="font-semibold text-emerald-700 hover:underline">← Volver al inicio de sesión</Link>
      </p>
    </div>
  );
}
