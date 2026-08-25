'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Empresa } from '@/lib/store';
import Modal from './Modal';

const VACIA: Omit<Empresa, 'id'> = {
  nit: '', razonSocial: '', tipo: 'CLIENTE', direccion: '', telefono: '', email: '', activo: true,
};

export default function EmpresasClient({ initial }: { initial: Empresa[] }) {
  const router = useRouter();
  const [abrir, setAbrir] = useState(false);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [form, setForm] = useState<typeof VACIA | Empresa>(VACIA);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [q, setQ] = useState('');

  const lista = initial.filter(
    (e) => e.razonSocial.toLowerCase().includes(q.toLowerCase()) || e.nit.includes(q)
  );

  function nueva() { setForm(VACIA); setEditando(null); setError(''); setAbrir(true); }
  function editar(e: Empresa) { setForm(e); setEditando(e); setError(''); setAbrir(true); }

  async function guardar() {
    setGuardando(true); setError('');
    const res = await fetch(editando ? `/api/empresas/${editando.id}` : '/api/empresas', {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setGuardando(false);
    if (!res.ok) { setError((await res.json()).error ?? 'Error al guardar'); return; }
    setAbrir(false); router.refresh();
  }

  async function eliminar(e: Empresa) {
    if (!confirm(`¿Eliminar la empresa "${e.razonSocial}"?`)) return;
    const res = await fetch(`/api/empresas/${e.id}`, { method: 'DELETE' });
    if (!res.ok) alert((await res.json()).error ?? 'Error');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Buscar por nombre o NIT…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={nueva} className="btn-primary ml-auto">+ Nueva empresa</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Razón social</th><th className="px-5 py-3">NIT</th>
                <th className="px-5 py-3">Tipo</th><th className="px-5 py-3">Contacto</th>
                <th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-700">{e.razonSocial}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{e.nit}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${e.tipo === 'CLIENTE' ? 'bg-emerald-100 text-emerald-800' : e.tipo === 'PROVEEDOR' ? 'bg-blue-100 text-blue-800' : 'bg-violet-100 text-violet-800'}`}>{e.tipo}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{e.email}<br />{e.telefono}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${e.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{e.activo ? 'Activa' : 'Inactiva'}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => editar(e)} className="mr-2 text-sm font-semibold text-blue-700 hover:underline">Editar</button>
                    <button onClick={() => eliminar(e)} className="text-sm font-semibold text-rose-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo={editando ? 'Editar empresa' : 'Nueva empresa'} abierto={abrir} onCerrar={() => setAbrir(false)}>
        <div className="space-y-4">
          <div>
            <label className="label">Razón social *</label>
            <input className="input" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">NIT *</label>
              <input className="input" placeholder="900123456-1" value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Empresa['tipo'] })}>
                <option>CLIENTE</option><option>PROVEEDOR</option><option>AMBOS</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Dirección</label>
            <input className="input" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Empresa activa
          </label>
          {error && <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setAbrir(false)}>Cancelar</button>
            <button className="btn-primary" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
