'use client';
import { REGLAS_PASSWORD } from '@/lib/validacion';

export default function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1">
      {REGLAS_PASSWORD.map((r) => {
        const ok = password ? r.test(password) : false;
        return (
          <li key={r.id} className={`flex items-center gap-2 text-xs ${password ? (ok ? 'text-emerald-600' : 'text-slate-500') : 'text-slate-400'}`}>
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
              ok ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'
            }`}>{ok ? '✓' : ''}</span>
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}
