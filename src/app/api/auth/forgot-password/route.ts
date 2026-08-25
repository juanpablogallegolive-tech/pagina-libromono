import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getDb } from '@/lib/store';

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Ingresa un correo válido' }, { status: 400 });
  }
  const db = getDb();
  const user = db.usuarios.find(
    (u) => u.email.toLowerCase() === email!.toLowerCase() && u.activo
  );
  if (!user) {
    // No revelamos si el correo existe o no (seguridad)
    return NextResponse.json({ ok: true, mensaje: 'Si el correo está registrado, se generó un enlace de recuperación.' });
  }
  const token = randomBytes(32).toString('hex');
  db.reseteos = db.reseteos.filter((r) => r.email !== user.email);
  db.reseteos.push({ token, email: user.email, expira: Date.now() + 60 * 60 * 1000 });
  return NextResponse.json({
    ok: true,
    resetUrl: `/auth/reset-password?token=${token}`,
    mensaje: 'Enlace generado. Es válido por 1 hora.',
  });
}
