import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, Factura } from '@/lib/store';

async function sesionValida() {
  const s = await getServerSession(authOptions);
  return !!s?.user;
}

export async function GET() {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json(getDb().facturas);
}

export async function POST(req: Request) {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const b = await req.json();
  const db = getDb();
  const nueva: Factura = {
    id: db.nextId.facturas++,
    empresaId: Number(b.empresaId),
    numero: String(b.numero ?? '').trim(),
    fecha: String(b.fecha ?? new Date().toISOString().slice(0, 10)),
    tipo: b.tipo === 'EGRESO' ? 'EGRESO' : 'INGRESO',
    concepto: String(b.concepto ?? '').trim(),
    valorBase: Math.max(0, Number(b.valorBase) || 0),
    iva: Math.max(0, Number(b.iva) || 0),
    retencion: Math.max(0, Number(b.retencion) || 0),
    estado: ['PAGADA', 'PENDIENTE', 'VENCIDA'].includes(b.estado) ? b.estado : 'PENDIENTE',
  };
  if (!nueva.empresaId || !nueva.numero || !nueva.valorBase) {
    return NextResponse.json({ error: 'Empresa, número y valor base son obligatorios' }, { status: 400 });
  }
  db.facturas.push(nueva);
  return NextResponse.json(nueva, { status: 201 });
}
