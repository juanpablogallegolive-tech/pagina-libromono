'use client';
import { useMemo, useState } from 'react';
import { calcularRetefuente, CONCEPTOS, ANIOS, Concepto } from '@/lib/uvt';
import { cop, pct } from '@/lib/format';

export default function RetefuenteCalc() {
  const [concepto, setConcepto] = useState<Concepto>('SERVICIOS');
  const [anio, setAnio] = useState(2026);
  const [valor, setValor] = useState('5000000');

  const r = useMemo(
    () => calcularRetefuente(concepto, anio, Number(valor) || 0),
    [concepto, anio, valor]
  );

  return (
    <div className="card p-6">
      <h2 className="mb-4 font-semibold text-slate-700">Calculadora de retención</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="label">Concepto</label>
          <select className="input" value={concepto} onChange={(e) => setConcepto(e.target.value as Concepto)}>
            {CONCEPTOS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Año</label>
          <select className="input" value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Base gravable (COP)</label>
          <input type="number" min="0" className="input" value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">Valor UVT {anio}</p>
          <p className="font-bold text-slate-800">${r.uvtValor.toLocaleString('es-CO')}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Base en UVT</p>
          <p className="font-bold text-slate-800">{r.baseUvt.toFixed(2)} UVT</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Tarifa aplicable</p>
          <p className="font-bold text-slate-800">{r.concepto === 'RENTAS_TRABAJO' ? pct(r.tarifa) + ' (progresiva)' : pct(r.tarifa)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Retención</p>
          <p className={`text-lg font-bold ${r.sujetaARetencion ? 'text-rose-700' : 'text-slate-400'}`}>{cop(r.retencion)}</p>
        </div>
      </div>
      <p className={`mt-3 text-sm ${r.sujetaARetencion ? 'text-rose-700' : 'text-slate-500'}`}>
        {r.sujetaARetencion ? '✔️ ' : 'ℹ️ '}{r.nota}
      </p>
    </div>
  );
}
