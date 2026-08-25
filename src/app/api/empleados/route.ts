import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, Empleado } from '@/lib/store';

async function sesionValida() {
  const s = await getServerSession(authOptions);
  return !!s?.user;
}

export async function GET() {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json(getDb().empleados);
}

export async function POST(req: Request) {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const b = await req.json();
  const db = getDb();
  const nuevo: Empleado = {
    id: db.nextId.empleados++,
    nombre: String(b.nombre ?? '').trim(),
    cedula: String(b.cedula ?? '').trim(),
    cargo: String(b.cargo ?? '').trim(),
    salario: Math.max(0, Number(b.salario) || 0),
    fechaIngreso: String(b.fechaIngreso ?? new Date().toISOString().slice(0, 10)),
    activo: b.activo !== false,
  };
  if (!nuevo.nombre || !nuevo.salario) {
    return NextResponse.json({ error: 'Nombre y salario son obligatorios' }, { status: 400 });
  }
  db.empleados.push(nuevo);
  return NextResponse.json(nuevo, { status: 201 });
}
