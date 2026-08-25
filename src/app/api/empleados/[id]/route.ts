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
  const emp = db.empleados.find((e) => e.id === Number(params.id));
  if (!emp) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  const b = await req.json();
  Object.assign(emp, {
    nombre: b.nombre ?? emp.nombre,
    cedula: b.cedula ?? emp.cedula,
    cargo: b.cargo ?? emp.cargo,
    salario: b.salario != null ? Number(b.salario) : emp.salario,
    fechaIngreso: b.fechaIngreso ?? emp.fechaIngreso,
    activo: b.activo ?? emp.activo,
  });
  return NextResponse.json(emp);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const db = getDb();
  db.empleados = db.empleados.filter((e) => e.id !== Number(params.id));
  return NextResponse.json({ ok: true });
}
