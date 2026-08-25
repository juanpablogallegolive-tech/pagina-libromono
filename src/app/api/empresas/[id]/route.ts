import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/store';

async function sesionValida() {
  const s = await getServerSession(authOptions);
  return !!s?.user;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const db = getDb();
  const emp = db.empresas.find((e) => e.id === Number(params.id));
  if (!emp) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  const b = await req.json();
  Object.assign(emp, {
    nit: b.nit ?? emp.nit,
    razonSocial: b.razonSocial ?? emp.razonSocial,
    tipo: b.tipo ?? emp.tipo,
    direccion: b.direccion ?? emp.direccion,
    telefono: b.telefono ?? emp.telefono,
    email: b.email ?? emp.email,
    activo: b.activo ?? emp.activo,
  });
  return NextResponse.json(emp);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const db = getDb();
  const id = Number(params.id);
  if (db.facturas.some((f) => f.empresaId === id)) {
    return NextResponse.json({ error: 'No se puede eliminar: tiene facturas asociadas' }, { status: 409 });
  }
  db.empresas = db.empresas.filter((e) => e.id !== id);
  return NextResponse.json({ ok: true });
}
