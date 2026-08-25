'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Empresa, Factura } from '@/lib/store';
import { cop, fecha } from '@/lib/format';
import { UVT } from '@/lib/uvt';
import Modal from './Modal';

type FacturaConTotal = Factura & { total: number };
const HOY = () => new Date().toISOString().slice(0, 10);

export default function FacturasClient({ initial, empresas }: { initial: FacturaConTotal[]; empresas: Empresa[] }) {
  const router = useRouter();
  const [abrir, setAbrir] = useState(false);
  const [editando, setEditando] = useState<Factura | null>(null);
  const [fTipo, setFTipo] = useState('TODAS');
  const [fEstado, setFEstado] = useState('TODOS');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    empresaId: '', numero: '', fecha: HOY(), tipo: 'INGRESO' as Factura['tipo'],
    concepto: '', valorBase: '', iva: '', retencion: '', estado: 'PENDIENTE' as Factura['estado'],
  });

  const lista = useMemo(
    () => initial.filter((f) =>
      (fTipo === 'TODAS' || f.tipo === fTipo) &&
      (fEstado === 'TODOS' || f.estado === fEstado) &&
      (f.numero.toLowerCase().includes(q.toLowerCase()) ||
        f.concepto.toLowerCase().includes(q.toLowerCase()) ||
        (empresas.find((e) => e.id === f.empresaId)?.razonSocial.toLowerCase().includes(q.toLowerCase()) ?? false))
    ), [initial, fTipo, fEstado, q, empresas]
  );
  const totales = useMemo(() => ({
    ingresos: lista.filter((f) => f.tipo === 'INGRESO').reduce((s, f) => s + f.total, 0),
    egresos: lista.filter((f) => f.tipo === 'EGRESO').reduce((s, f) => s + f.total, 0),
  }), [lista]);

  function nueva() {
    const siguiente = initial.length + 1;
    setForm({ empresaId: String(empresas[0]?.id ?? ''), numero: `FC-${new Date().getFullYear()}-${String(siguiente).padStart(3, '0')}`,
      fecha: HOY(), tipo: 'INGRESO', concepto: '', valorBase: '', iva: '', retencion: '', estado: 'PENDIENTE' });
    setEditando(null); setError(''); setAbrir(true);
  }
  function editar(f: FacturaConTotal) {
    setForm({ empresaId: String(f.empresaId), numero: f.numero, fecha: f.fecha, tipo: f.tipo,
      concepto: f.concepto, valorBase: String(f.valorBase), iva: String(f.iva), retencion: String(f.retencion), estado: f.estado });
    setEditando(f); setError(''); setAbrir(true);
  }

  async function guardar() {
    setGuardando(true); setError('');
    const res = await fetch(editando ? `/api/facturas/${editando.id}` : '/api/facturas', {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form, empresaId: Number(form.empresaId),
        valorBase: Number(form.valorBase), iva: Number(form.iva || 0), retencion: Number(form.retencion || 0),
      }),
    });
    setGuardando(false);
    if (!res.ok) { setError((await res.json()).error ?? 'Error al guardar'); return; }
    setAbrir(false); router.refresh();
  }
  async function eliminar(f: FacturaConTotal) {
    if (!confirm(`¿Eliminar la factura ${f.numero}?`)) return;
    await fetch(`/api/facturas/${f.id}`, { method: 'DELETE' });
    router.refresh();
  }
  async function marcarPagada(f: FacturaConTotal) {
    await fetch(`/api/facturas/${f.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'PAGADA' }),
    });
    router.refresh();
  }

  const vb = Number(form.valorBase) || 0;
  const autoIva = () => setForm({ ...form, iva: String(Math.round(vb * 0.19)) });
  const autoRtf = () => {
    const anio = Number(form.fecha.slice(0, 4)) || new Date().getFullYear();
    const uvt = UVT[anio] ?? UVT[2026];
    const tarifa = form.tipo === 'EGRESO' ? 0.025 : 0.04;
    setForm({ ...form, retencion: vb / uvt > 4 ? String(Math.round((vb * tarifa) / 10) * 10) : '0' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Buscar número, concepto o empresa…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input w-auto" value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
          <option value="TODAS">Todos los tipos</option><option>INGRESO</option><option>EGRESO</option>
        </select>
        <select className="input w-auto" value={fEstado} onChange={(e) => setFEstado(e.target.value)}>
          <option value="TODOS">Todos los estados</option><option>PAGADA</option><option>PENDIENTE</option><option>VENCIDA</option>
        </select>
        <button onClick={nueva} className="btn-primary ml-auto">+ Nueva factura</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Ingresos (filtro)</p><p className="text-xl font-bold text-emerald-700">{cop(totales.ingresos)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Egresos (filtro)</p><p className="text-xl font-bold text-rose-700">{cop(totales.egresos)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Diferencia</p><p className="text-xl font-bold text-slate-800">{cop(totales.ingresos - totales.egresos)}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Número</th><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Empresa</th>
                <th className="px-5 py-3">Concepto</th><th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3 text-right">Base</th><th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-700">{f.numero}</td>
                  <td className="px-5 py-3 text-slate-500">{fecha(f.fecha)}</td>
                  <td className="px-5 py-3">{empresas.find((e) => e.id === f.empresaId)?.razonSocial ?? '—'}</td>
                  <td className="max-w-52 truncate px-5 py-3 text-slate-500">{f.concepto}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${f.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{f.tipo}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-500">{cop(f.valorBase)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{cop(f.total)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${f.estado === 'PAGADA' ? 'bg-emerald-100 text-emerald-800' : f.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>{f.estado}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    {f.estado !== 'PAGADA' && (
                      <button onClick={() => marcarPagada(f)} className="mr-2 text-xs font-semibold text-emerald-700 hover:underline">✓ Pagada</button>
                    )}
                    <button onClick={() => editar(f)} className="mr-2 text-xs font-semibold text-blue-700 hover:underline">Editar</button>
                    <button onClick={() => eliminar(f)} className="text-xs font-semibold text-rose-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-400">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo={editando ? `Editar factura ${editando.numero}` : 'Nueva factura'} abierto={abrir} onCerrar={() => setAbrir(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Empresa *</label>
              <select className="input" value={form.empresaId} onChange={(e) => setForm({ ...form, empresaId: e.target.value })}>
                {empresas.map((e) => <option key={e.id} value={e.id}>{e.razonSocial}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Número *</label>
              <input className="input" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Factura['tipo'] })}>
                <option>INGRESO</option><option>EGRESO</option>
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as Factura['estado'] })}>
                <option>PENDIENTE</option><option>PAGADA</option><option>VENCIDA</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Concepto</label>
            <input className="input" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Valor base (COP) *</label>
              <input type="number" min="0" className="input" value={form.valorBase} onChange={(e) => setForm({ ...form, valorBase: e.target.value })} />
            </div>
            <div>
              <label className="label">IVA</label>
              <div className="flex gap-2">
                <input type="number" min="0" className="input" value={form.iva} onChange={(e) => setForm({ ...form, iva: e.target.value })} />
                <button type="button" onClick={autoIva} className="btn-ghost whitespace-nowrap px-2 text-xs">19%</button>
              </div>
            </div>
            <div>
              <label className="label">Retención</label>
              <div className="flex gap-2">
                <input type="number" min="0" className="input" value={form.retencion} onChange={(e) => setForm({ ...form, retencion: e.target.value })} />
                <button type="button" onClick={autoRtf} className="btn-ghost whitespace-nowrap px-2 text-xs">Auto</button>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Total: </span>
            <span className="font-bold text-slate-800">{cop(vb + (Number(form.iva) || 0) - (Number(form.retencion) || 0))}</span>
          </div>
          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setAbrir(false)}>Cancelar</button>
            <button className="btn-primary" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
