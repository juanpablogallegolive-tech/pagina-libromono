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
  const f = db.facturas.find((x) => x.id === Number(params.id));
  if (!f) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  const b = await req.json();
  Object.assign(f, {
    empresaId: b.empresaId != null ? Number(b.empresaId) : f.empresaId,
    numero: b.numero ?? f.numero,
    fecha: b.fecha ?? f.fecha,
    tipo: b.tipo ?? f.tipo,
    concepto: b.concepto ?? f.concepto,
    valorBase: b.valorBase != null ? Number(b.valorBase) : f.valorBase,
    iva: b.iva != null ? Number(b.iva) : f.iva,
    retencion: b.retencion != null ? Number(b.retencion) : f.retencion,
    estado: b.estado ?? f.estado,
  });
  return NextResponse.json(f);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await sesionValida())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const db = getDb();
  db.facturas = db.facturas.filter((x) => x.id !== Number(params.id));
  return NextResponse.json({ ok: true });
}
