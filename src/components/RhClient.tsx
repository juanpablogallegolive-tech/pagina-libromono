'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Empleado } from '@/lib/store';
import { cop, fecha } from '@/lib/format';
import Modal from './Modal';

export default function RhClient({ initial }: { initial: Empleado[] }) {
  const router = useRouter();
  const [abrir, setAbrir] = useState(false);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [verInactivos, setVerInactivos] = useState(false);
  const VACIO = { nombre: '', cedula: '', cargo: '', salario: '', fechaIngreso: new Date().toISOString().slice(0, 10), activo: true };
  const [form, setForm] = useState(VACIO);

  const lista = initial.filter((e) => verInactivos || e.activo);

  function nuevo() { setForm(VACIO); setEditando(null); setError(''); setAbrir(true); }
  function editar(e: Empleado) {
    setForm({ nombre: e.nombre, cedula: e.cedula, cargo: e.cargo, salario: String(e.salario), fechaIngreso: e.fechaIngreso, activo: e.activo });
    setEditando(e); setError(''); setAbrir(true);
  }
  async function guardar() {
    setGuardando(true); setError('');
    const res = await fetch(editando ? `/api/empleados/${editando.id}` : '/api/empleados', {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, salario: Number(form.salario) }),
    });
    setGuardando(false);
    if (!res.ok) { setError((await res.json()).error ?? 'Error'); return; }
    setAbrir(false); router.refresh();
  }
  async function eliminar(e: Empleado) {
    if (!confirm(`¿Eliminar a ${e.nombre}?`)) return;
    await fetch(`/api/empleados/${e.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={verInactivos} onChange={(e) => setVerInactivos(e.target.checked)} />
          Mostrar inactivos
        </label>
        <button onClick={nuevo} className="btn-primary ml-auto">+ Nuevo empleado</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Nombre</th><th className="px-5 py-3">Cédula</th>
                <th className="px-5 py-3">Cargo</th><th className="px-5 py-3">Ingreso</th>
                <th className="px-5 py-3 text-right">Salario</th><th className="px-5 py-3 text-right">Deducciones</th>
                <th className="px-5 py-3 text-right">Neto a pagar</th><th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((e) => (
                <tr key={e.id} className={e.activo ? 'hover:bg-slate-50' : 'bg-slate-50/60 text-slate-400'}>
                  <td className="px-5 py-3 font-semibold text-slate-700">{e.nombre}</td>
                  <td className="px-5 py-3 font-mono text-xs">{e.cedula}</td>
                  <td className="px-5 py-3">{e.cargo}</td>
                  <td className="px-5 py-3 text-slate-500">{fecha(e.fechaIngreso)}</td>
                  <td className="px-5 py-3 text-right">{cop(e.salario)}</td>
                  <td className="px-5 py-3 text-right text-rose-600">{cop(Math.round(e.salario * 0.08))}</td>
                  <td className="px-5 py-3 text-right font-semibold">{cop(e.salario - Math.round(e.salario * 0.08))}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <button onClick={() => editar(e)} className="mr-2 text-xs font-semibold text-blue-700 hover:underline">Editar</button>
                    <button onClick={() => eliminar(e)} className="text-xs font-semibold text-rose-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo={editando ? 'Editar empleado' : 'Nuevo empleado'} abierto={abrir} onCerrar={() => setAbrir(false)}>
        <div className="space-y-4">
          <div>
            <label className="label">Nombre completo *</label>
            <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cédula</label>
              <input className="input" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
            </div>
            <div>
              <label className="label">Cargo</label>
              <input className="input" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Salario mensual (COP) *</label>
              <input type="number" min="0" className="input" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} />
            </div>
            <div>
              <label className="label">Fecha de ingreso</label>
              <input type="date" className="input" value={form.fechaIngreso} onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Empleado activo
          </label>
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
