import { getDb } from '@/lib/store';
import EmpresasClient from '@/components/EmpresasClient';

export default function EmpresasPage() {
  const db = getDb();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🏢 Empresas</h1>
        <p className="text-sm text-slate-500">Clientes y proveedores del sistema contable</p>
      </div>
      <EmpresasClient initial={db.empresas} />
    </div>
  );
}
