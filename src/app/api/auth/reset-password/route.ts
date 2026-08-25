import { NextResponse } from 'next/server';
import { getDb } from '@/lib/store';
import { passwordValida } from '@/lib/validacion';

export async function POST(req: Request) {
  const { token, password } = (await req.json()) as { token?: string; password?: string };
  if (!token || !password) {
    return NextResponse.json({ error: 'Solicitud incompleta' }, { status: 400 });
  }
  if (!passwordValida(password)) {
    return NextResponse.json({ error: 'La contraseña no cumple todos los requisitos' }, { status: 400 });
  }
  const db = getDb();
  const reseteo = db.reseteos.find((r) => r.token === token);
  if (!reseteo || reseteo.expira < Date.now()) {
    return NextResponse.json({ error: 'El enlace es inválido o ya expiró. Solicita uno nuevo.' }, { status: 400 });
  }
  const user = db.usuarios.find((u) => u.email === reseteo.email);
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  user.password = password;
  db.reseteos = db.reseteos.filter((r) => r.token !== token);
  return NextResponse.json({ ok: true });
}
