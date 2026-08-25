import { getDb, totalFactura } from '@/lib/store';
import { cop } from '@/lib/format';
import ExportarCsv from '@/components/ExportarCsv';

export default function ReportesPage() {
  const db = getDb();
  const anio = new Date().getFullYear();
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const porMes = meses.map((m, i) => {
    const prefijo = `${anio}-${String(i + 1).padStart(2, '0')}`;
    const delMes = db.facturas.filter((f) => f.fecha.startsWith(prefijo));
    const ingresos = delMes.filter((f) => f.tipo === 'INGRESO').reduce((s, f) => s + totalFactura(f), 0);
    const egresos = delMes.filter((f) => f.tipo === 'EGRESO').reduce((s, f) => s + totalFactura(f), 0);
    return { mes: m, ingresos, egresos, utilidad: ingresos - egresos };
  });
  const activos = porMes.filter((m) => m.ingresos > 0 || m.egresos > 0);
  const maxBarra = Math.max(1, ...activos.flatMap((m) => [m.ingresos, m.egresos]));

  const porEmpresa = db.empresas.map((e) => {
    const fs = db.facturas.filter((f) => f.empresaId === e.id);
    const ingresos = fs.filter((f) => f.tipo === 'INGRESO').reduce((s, f) => s + totalFactura(f), 0);
    const egresos = fs.filter((f) => f.tipo === 'EGRESO').reduce((s, f) => s + totalFactura(f), 0);
    const rtf = fs.reduce((s, f) => s + f.retencion, 0);
    return { nombre: e.razonSocial, nit: e.nit, ingresos, egresos, rtf, facturas: fs.length };
  }).sort((a, b) => b.ingresos - a.ingresos);

  const tIngresos = porEmpresa.reduce((s, e) => s + e.ingresos, 0);
  const tEgresos = porEmpresa.reduce((s, e) => s + e.egresos, 0);
  const tRtf = porEmpresa.reduce((s, e) => s + e.rtf, 0);

  const csv = [
    'Empresa;NIT;Ingresos;Egresos;Retencion;Facturas',
    ...porEmpresa.map((e) => `${e.nombre};${e.nit};${e.ingresos};${e.egresos};${e.rtf};${e.facturas}`),
  ].join('\n');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📈 Reportes</h1>
          <p className="text-sm text-slate-500">Comportamiento contable {anio}</p>
        </div>
        <ExportarCsv nombre={`reporte_${anio}.csv`} csv={csv} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Ingresos históricos</p><p className="text-xl font-bold text-emerald-700">{cop(tIngresos)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Egresos históricos</p><p className="text-xl font-bold text-rose-700">{cop(tEgresos)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Retención total registrada</p><p className="text-xl font-bold text-amber-700">{cop(tRtf)}</p></div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-700">Ingresos vs egresos por mes ({anio})</h2>
        <div className="flex items-end gap-3 overflow-x-auto pb-2">
          {activos.map((m) => (
            <div key={m.mes} className="flex min-w-14 flex-col items-center gap-1">
              <div className="flex h-40 items-end gap-1">
                <div className="w-5 rounded-t bg-emerald-500" style={{ height: `${(m.ingresos / maxBarra) * 100}%` }} title={`Ingresos: ${cop(m.ingresos)}`}></div>
                <div className="w-5 rounded-t bg-rose-400" style={{ height: `${(m.egresos / maxBarra) * 100}%` }} title={`Egresos: ${cop(m.egresos)}`}></div>
              </div>
              <span className="text-xs font-medium text-slate-500">{m.mes}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500"></span>Ingresos</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-rose-400"></span>Egresos</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-700">Detalle por empresa (histórico)</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Empresa</th><th className="px-5 py-3">NIT</th>
                <th className="px-5 py-3 text-right">Ingresos</th><th className="px-5 py-3 text-right">Egresos</th>
                <th className="px-5 py-3 text-right">Retención</th><th className="px-5 py-3 text-right">Facturas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {porEmpresa.map((e) => (
                <tr key={e.nit} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-700">{e.nombre}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{e.nit}</td>
                  <td className="px-5 py-3 text-right text-emerald-700">{cop(e.ingresos)}</td>
                  <td className="px-5 py-3 text-right text-rose-700">{cop(e.egresos)}</td>
                  <td className="px-5 py-3 text-right">{cop(e.rtf)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{e.facturas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
