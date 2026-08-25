import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, Empresa } from '@/lib/store';

async function sesionValida() {
  const s = await getServerSession(authOptions);
  return !!s?.user;
}

export async function GET() {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json(getDb().empresas);
}

export async function POST(req: Request) {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const b = await req.json();
  const db = getDb();
  const nueva: Empresa = {
    id: db.nextId.empresas++,
    nit: String(b.nit ?? '').trim(),
    razonSocial: String(b.razonSocial ?? '').trim(),
    tipo: ['CLIENTE', 'PROVEEDOR', 'AMBOS'].includes(b.tipo) ? b.tipo : 'CLIENTE',
    direccion: String(b.direccion ?? ''),
    telefono: String(b.telefono ?? ''),
    email: String(b.email ?? ''),
    activo: b.activo !== false,
  };
  if (!nueva.razonSocial || !nueva.nit) {
    return NextResponse.json({ error: 'NIT y razón social son obligatorios' }, { status: 400 });
  }
  db.empresas.push(nueva);
  return NextResponse.json(nueva, { status: 201 });
}
