import { getDb, totalFactura } from '@/lib/store';
import { cop, fecha } from '@/lib/format';

export default function SaldosPage() {
  const db = getDb();
  const hoy = new Date();

  function dias(fechaFactura: string): number {
    return Math.floor((hoy.getTime() - new Date(fechaFactura + 'T12:00:00').getTime()) / 86400000);
  }

  const cxc = db.facturas
    .filter((f) => f.tipo === 'INGRESO' && f.estado !== 'PAGADA')
    .map((f) => ({ ...f, total: totalFactura(f), dias: dias(f.fecha),
      empresa: db.empresas.find((e) => e.id === f.empresaId)?.razonSocial ?? '—' }))
    .sort((a, b) => b.dias - a.dias);
  const cxp = db.facturas
    .filter((f) => f.tipo === 'EGRESO' && f.estado !== 'PAGADA')
    .map((f) => ({ ...f, total: totalFactura(f), dias: dias(f.fecha),
      empresa: db.empresas.find((e) => e.id === f.empresaId)?.razonSocial ?? '—' }))
    .sort((a, b) => b.dias - a.dias);

  const totCxC = cxc.reduce((s, f) => s + f.total, 0);
  const totCxP = cxp.reduce((s, f) => s + f.total, 0);
  const vencidas = cxc.filter((f) => f.dias > 60).length;

  function tabla(titulo: string, datos: typeof cxc, tono: string) {
    return (
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">{titulo}</h2>
          <span className={`font-bold ${tono}`}>{cop(datos.reduce((s, f) => s + f.total, 0))}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Empresa</th><th className="px-5 py-3">Factura</th>
                <th className="px-5 py-3">Fecha</th><th className="px-5 py-3 text-right">Días</th>
                <th className="px-5 py-3">Edad</th><th className="px-5 py-3 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datos.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-700">{f.empresa}</td>
                  <td className="px-5 py-3">{f.numero}</td>
                  <td className="px-5 py-3 text-slate-500">{fecha(f.fecha)}</td>
                  <td className="px-5 py-3 text-right">{f.dias}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${f.dias > 90 ? 'bg-rose-100 text-rose-800' : f.dias > 60 ? 'bg-amber-100 text-amber-800' : f.dias > 30 ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {f.dias > 90 ? '+90 días' : f.dias > 60 ? '61–90 días' : f.dias > 30 ? '31–60 días' : '0–30 días'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">{cop(f.total)}</td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Sin saldos pendientes 🎉</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">💰 Saldos</h1>
        <p className="text-sm text-slate-500">Cuentas por cobrar y por pagar con cartera por edades</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Total por cobrar</p><p className="text-xl font-bold text-emerald-700">{cop(totCxC)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Total por pagar</p><p className="text-xl font-bold text-rose-700">{cop(totCxP)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Posición neta</p><p className="text-xl font-bold text-slate-800">{cop(totCxC - totCxP)}</p><p className="text-xs text-slate-400">{vencidas} facturas por cobrar con más de 60 días</p></div>
      </div>
      {tabla('📬 Cuentas por cobrar (clientes)', cxc, 'text-emerald-700')}
      {tabla('📮 Cuentas por pagar (proveedores)', cxp, 'text-rose-700')}
    </div>
  );
}
