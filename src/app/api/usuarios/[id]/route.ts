import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/store';

async function esAdmin() {
  const s = await getServerSession(authOptions);
  return s?.user?.rol === 'ADMIN' ? s : null;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await esAdmin())) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  const db = getDb();
  const u = db.usuarios.find((x) => x.id === Number(params.id));
  if (!u) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  const b = await req.json();
  if (b.email && db.usuarios.some((x) => x.id !== u.id && x.email.toLowerCase() === String(b.email).toLowerCase())) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
  }
  Object.assign(u, {
    nombre: b.nombre ?? u.nombre,
    email: b.email != null ? String(b.email).toLowerCase() : u.email,
    password: b.password || u.password,
    rol: ['ADMIN', 'CONTADOR', 'VISTA'].includes(b.rol) ? (b.rol ?? u.rol) : u.rol,
    activo: b.activo ?? u.activo,
  });
  return NextResponse.json({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo, creado: u.creado });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await esAdmin();
  if (!s) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  const db = getDb();
  const id = Number(params.id);
  if (String(id) === s.user?.id) {
    return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });
  }
  db.usuarios = db.usuarios.filter((u) => u.id !== id);
  return NextResponse.json({ ok: true });
}
