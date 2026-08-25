import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, Usuario } from '@/lib/store';

async function esAdmin() {
  const s = await getServerSession(authOptions);
  return s?.user?.rol === 'ADMIN' ? s : null;
}

export async function GET() {
  if (!(await esAdmin())) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  const usuarios = getDb().usuarios.map(({ password, ...u }) => u);
  return NextResponse.json(usuarios);
}

export async function POST(req: Request) {
  if (!(await esAdmin())) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  const b = await req.json();
  const db = getDb();
  if (!b.email || !b.nombre || !b.password) {
    return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios' }, { status: 400 });
  }
  if (db.usuarios.some((u) => u.email.toLowerCase() === String(b.email).toLowerCase())) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
  }
  const nuevo: Usuario = {
    id: db.nextId.usuarios++,
    nombre: String(b.nombre).trim(),
    email: String(b.email).trim().toLowerCase(),
    password: String(b.password),
    rol: ['ADMIN', 'CONTADOR', 'VISTA'].includes(b.rol) ? b.rol : 'VISTA',
    activo: true,
    creado: new Date().toISOString().slice(0, 10),
  };
  db.usuarios.push(nuevo);
  const { password: _p, ...res } = nuevo;
  return NextResponse.json(res, { status: 201 });
}
