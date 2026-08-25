import { getDb, totalFactura } from '@/lib/store';
import FacturasClient from '@/components/FacturasClient';

export default function FacturasPage() {
  const db = getDb();
  const facturas = [...db.facturas]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((f) => ({ ...f, total: totalFactura(f) }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📄 Facturas</h1>
        <p className="text-sm text-slate-500">Ingresos y egresos de todas las empresas</p>
      </div>
      <FacturasClient initial={facturas} empresas={db.empresas} />
    </div>
  );
}
