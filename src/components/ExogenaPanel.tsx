'use client';
import { useState } from 'react';

export default function ExogenaPanel({ formatos }: { formatos: string[] }) {
  const [formato, setFormato] = useState(formatos[0] ?? '1001');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [generando, setGenerando] = useState(false);
  const [msg, setMsg] = useState('');

  async function generar() {
    setGenerando(true); setMsg('');
    try {
      const res = await fetch('/api/ia-exogena/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formato, anio }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exogena_${formato}_${anio}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('✅ Reporte generado y descargado.');
    } catch {
      setMsg('⚠️ No se pudo generar el reporte. Intenta de nuevo.');
    }
    setGenerando(false);
  }

  return (
    <div className="card p-6">
      <h2 className="mb-1 font-semibold text-slate-700">Generar reporte exógena</h2>
      <p className="mb-4 text-xs text-slate-400">Archivo Excel (.xlsx) construido con facturas, retenciones y nómina del sistema.</p>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="label">Formato</label>
          <select className="input w-auto" value={formato} onChange={(e) => setFormato(e.target.value)}>
            {formatos.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Año gravable</label>
          <select className="input w-auto" value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            <option>2024</option><option>2025</option><option>2026</option>
          </select>
        </div>
        <button onClick={generar} disabled={generando} className="btn-primary">
          {generando ? 'Generando…' : '⬇️ Generar Excel'}
        </button>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </div>
    </div>
  );
}
