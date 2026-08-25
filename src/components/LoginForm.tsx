'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError('');
    const res = await signIn('credentials', { redirect: false, email, password });
    if (res?.error) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      setCargando(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Iniciar Sesión</h2>
      <p className="mt-1 text-sm text-slate-500">Ingresa tus credenciales para continuar</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="label" htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" required autoComplete="email"
            className="input" placeholder="correo@ferreteria.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input id="password" type="password" required autoComplete="current-password"
            className="input" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 border border-rose-200">{error}</p>
        )}
        <div className="flex items-center justify-between text-sm">
          <a href="#" className="text-emerald-700 hover:underline">¿Olvidaste tu contraseña?</a>
        </div>
        <button type="submit" disabled={cargando} className="btn-primary w-full py-2.5">
          {cargando ? 'Ingresando…' : 'Iniciar Sesión'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿No tienes cuenta? <a href="#" className="font-semibold text-emerald-700 hover:underline">Regístrate aquí</a>
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900">
        <p className="font-bold">Acceso de demostración</p>
        <p>admin@ferreteria.com · admin123 (Administrador)</p>
        <p>contador@ferreteria.com · contador123 (Contador)</p>
        <p>vista@ferreteria.com · vista123 (Solo lectura)</p>
      </div>
    </div>
  );
}
