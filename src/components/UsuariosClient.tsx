'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rol } from '@/lib/store';
import { fecha } from '@/lib/format';
import Modal from './Modal';

type UsuarioPub = { id: number; nombre: string; email: string; rol: Rol; activo: boolean; creado: string };

export default function UsuariosClient({ initial, miId }: { initial: UsuarioPub[]; miId: string }) {
  const router = useRouter();
  const [abrir, setAbrir] = useState(false);
  const [editando, setEditando] = useState<UsuarioPub | null>(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const VACIO = { nombre: '', email: '', password: '', rol: 'VISTA' as Rol };
  const [form, setForm] = useState(VACIO);

  function nuevo() { setForm(VACIO); setEditando(null); setError(''); setAbrir(true); }
  function editar(u: UsuarioPub) {
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
    setEditando(u); setError(''); setAbrir(true);
  }
  async function guardar() {
    setGuardando(true); setError('');
    const body = editando && !form.password
      ? { nombre: form.nombre, email: form.email, rol: form.rol }
      : form;
    const res = await fetch(editando ? `/api/usuarios/${editando.id}` : '/api/usuarios', {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setGuardando(false);
    if (!res.ok) { setError((await res.json()).error ?? 'Error'); return; }
    setAbrir(false); router.refresh();
  }
  async function alternar(u: UsuarioPub) {
    await fetch(`/api/usuarios/${u.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activo: !u.activo }),
    });
    router.refresh();
  }
  async function eliminar(u: UsuarioPub) {
    if (!confirm(`¿Eliminar a ${u.nombre}?`)) return;
    const res = await fetch(`/api/usuarios/${u.id}`, { method: 'DELETE' });
    if (!res.ok) alert((await res.json()).error ?? 'Error');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex">
        <button onClick={nuevo} className="btn-primary ml-auto">+ Nuevo usuario</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Nombre</th><th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Rol</th><th className="px-5 py-3">Creado</th>
                <th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initial.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-700">
                    {u.nombre}{String(u.id) === miId && <span className="ml-2 badge bg-emerald-100 text-emerald-800">tú</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${u.rol === 'ADMIN' ? 'bg-emerald-100 text-emerald-800' : u.rol === 'CONTADOR' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>{u.rol}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{fecha(u.creado)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => alternar(u)}>
                      <span className={`badge ${u.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {u.activo ? 'Activo' : 'Bloqueado'}
                      </span>
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <button onClick={() => editar(u)} className="mr-2 text-xs font-semibold text-blue-700 hover:underline">Editar</button>
                    <button onClick={() => eliminar(u)} className="text-xs font-semibold text-rose-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo={editando ? 'Editar usuario' : 'Nuevo usuario'} abierto={abrir} onCerrar={() => setAbrir(false)}>
        <div className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{editando ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</label>
              <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="label">Rol</label>
              <select className="input" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
                <option>VISTA</option><option>CONTADOR</option><option>ADMIN</option>
              </select>
            </div>
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
