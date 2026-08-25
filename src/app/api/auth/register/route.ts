import { NextResponse } from 'next/server';
import { getDb } from '@/lib/store';
import { passwordValida } from '@/lib/validacion';

export async function POST(req: Request) {
  const { nombre, email, password } = (await req.json()) as {
    nombre?: string; email?: string; password?: string;
  };
  if (!nombre?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Ingresa un correo válido' }, { status: 400 });
  }
  if (!passwordValida(password)) {
    return NextResponse.json({ error: 'La contraseña no cumple todos los requisitos' }, { status: 400 });
  }
  const db = getDb();
  if (db.usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: 'Ya existe una cuenta con este correo' }, { status: 409 });
  }
  db.usuarios.push({
    id: db.nextId.usuarios++,
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    password,
    rol: 'VISTA',
    activo: true,
    creado: new Date().toISOString().slice(0, 10),
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
