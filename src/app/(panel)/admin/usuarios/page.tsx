import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/store';
import UsuariosClient from '@/components/UsuariosClient';

export default async function AdminUsuariosPage() {
  const session = await getServerSession(authOptions);
  const rol = session?.user?.rol ?? 'VISTA';
  const miId = session?.user?.id ?? '';
  const usuarios = getDb().usuarios.map(({ password: _p, ...u }) => u);

  if (rol !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Administración</h1>
        <div className="card p-10 text-center">
          <p className="text-4xl">🔒</p>
          <p className="mt-3 font-semibold text-slate-700">Acceso restringido</p>
          <p className="text-sm text-slate-500">Solo los usuarios con rol <b>ADMIN</b> pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Administración de usuarios</h1>
        <p className="text-sm text-slate-500">Control de acceso al sistema contable</p>
      </div>
      <UsuariosClient initial={usuarios} miId={miId} />
    </div>
  );
}
