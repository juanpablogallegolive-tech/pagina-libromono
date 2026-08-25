'use client';
import { useMemo, useState } from 'react';
import { cop } from '@/lib/format';

export default function LiquidacionCalc() {
  const [salario, setSalario] = useState('1450000');
  const [dias, setDias] = useState('365');

  const r = useMemo(() => {
    const s = Number(salario) || 0;
    const d = Number(dias) || 0;
    const prima = Math.round((s * d) / 360);
    const cesantias = Math.round((s * d) / 360);
    const intereses = Math.round(cesantias * 0.12);
    const vacaciones = Math.round((s * d) / 720);
    return { prima, cesantias, intereses, vacaciones, total: prima + cesantias + intereses + vacaciones };
  }, [salario, dias]);

  return (
    <div className="card p-6">
      <h2 className="mb-1 font-semibold text-slate-700">Calculadora de liquidación</h2>
      <p className="mb-4 text-xs text-slate-400">Prima, cesantías +12% e intereses, y vacaciones proporcionales</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Salario mensual (COP)</label>
          <input type="number" min="0" className="input" value={salario} onChange={(e) => setSalario(e.target.value)} />
        </div>
        <div>
          <label className="label">Días trabajados</label>
          <input type="number" min="0" className="input" value={dias} onChange={(e) => setDias(e.target.value)} />
        </div>
      </div>
      <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <div><p className="text-xs text-slate-500">Prima de servicios</p><p className="font-bold text-slate-800">{cop(r.prima)}</p></div>
        <div><p className="text-xs text-slate-500">Cesantías</p><p className="font-bold text-slate-800">{cop(r.cesantias)}</p></div>
        <div><p className="text-xs text-slate-500">Intereses cesantías</p><p className="font-bold text-slate-800">{cop(r.intereses)}</p></div>
        <div><p className="text-xs text-slate-500">Vacaciones</p><p className="font-bold text-slate-800">{cop(r.vacaciones)}</p></div>
        <div><p className="text-xs text-slate-500">Total liquidación</p><p className="text-lg font-bold text-emerald-700">{cop(r.total)}</p></div>
      </div>
    </div>
  );
}
