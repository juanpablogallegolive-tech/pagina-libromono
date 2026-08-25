import Link from 'next/link';
import { getDb, resumen, totalFactura } from '@/lib/store';
import { cop, fecha } from '@/lib/format';
import StatCard from '@/components/StatCard';
import { AreaChart, Donut } from '@/components/charts';

const COLORES = ['#059669', '#0d9488', '#2563eb', '#7c3aed', '#d97706', '#94a3b8'];
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function DashboardPage() {
  const anio = new Date().getFullYear();
  const r = resumen(anio);
  const db = getDb();

  // Serie mensual del año en curso
  const serie = MESES.map((m, i) => {
    const prefijo = `${anio}-${String(i + 1).padStart(2, '0')}`;
    const delMes = db.facturas.filter((f) => f.fecha.startsWith(prefijo));
    return {
      ingresos: delMes.filter((f) => f.tipo === 'INGRESO').reduce((s, f) => s + totalFactura(f), 0),
      egresos: delMes.filter((f) => f.tipo === 'EGRESO').reduce((s, f) => s + totalFactura(f), 0),
    };
  });
  const mesActual = new Date().getMonth();
  const mesPrevio = Math.max(0, mesActual - 1);
  const tendenciaIng = serie[mesPrevio].ingresos > 0
    ? ((serie[mesActual].ingresos - serie[mesPrevio].ingresos) / serie[mesPrevio].ingresos) * 100
    : 0;
  const tendenciaEgr = serie[mesPrevio].egresos > 0
    ? ((serie[mesActual].egresos - serie[mesPrevio].egresos) / serie[mesPrevio].egresos) * 100
    : 0;

  // Dona: top empresas por ingresos históricos
  const topEmpresas = db.empresas
    .map((e) => ({
      nombre: e.razonSocial,
      valor: db.facturas
        .filter((f) => f.empresaId === e.id && f.tipo === 'INGRESO')
        .reduce((s, f) => s + totalFactura(f), 0),
    }))
    .filter((e) => e.valor > 0)
    .sort((a, b) => b.valor - a.valor);
  const top5 = topEmpresas.slice(0, 5).map((e, i) => ({ ...e, color: COLORES[i] }));
  if (topEmpresas.length > 5) {
    top5.push({
      nombre: 'Otras', color: COLORES[5],
      valor: topEmpresas.slice(5).reduce((s, e) => s + e.valor, 0),
    });
  }

  // Cartera por vencer (pendientes más antiguas) y últimas facturas
  const hoy = new Date();
  const dias = (f: string) => Math.floor((hoy.getTime() - new Date(f + 'T12:00:00').getTime()) / 86400000);
  const porCobrar = db.facturas
    .filter((f) => f.tipo === 'INGRESO' && f.estado !== 'PAGADA')
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 5)
    .map((f) => ({ ...f, edad: dias(f.fecha), empresa: db.empresas.find((e) => e.id === f.empresaId)?.razonSocial ?? '—' }));
  const recientes = [...db.facturas]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 6)
    .map((f) => ({ ...f, empresa: db.empresas.find((e) => e.id === f.empresaId)?.razonSocial ?? '—' }));

  const flecha = (t: number) => (t >= 0 ? { txt: '▲', color: 'text-emerald-600' } : { txt: '▼', color: 'text-rose-600' });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 p-6 text-white shadow-lg">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            {hoy.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="mt-1 text-2xl font-bold">Panel general · Ferretería El Paisa</h1>
          <p className="mt-1 text-sm text-emerald-100">
            {r.empresasActivas} empresas · {r.empleadosActivos} empleados · {r.facturasTotal} facturas registradas
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/facturas" className="btn bg-white/10 text-white backdrop-blur hover:bg-white/20">+ Nueva factura</Link>
          <Link href="/reportes" className="btn bg-emerald-500 text-white hover:bg-emerald-600">Ver reportes</Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard titulo={`Ingresos ${anio}`} valor={cop(r.ingresosAnio)} icono="📈" tono="emerald"
          sub={`${flecha(tendenciaIng).txt} ${Math.abs(tendenciaIng).toFixed(0)}% vs mes anterior`} />
        <StatCard titulo={`Egresos ${anio}`} valor={cop(r.egresosAnio)} icono="📉" tono="rose"
          sub={`${flecha(tendenciaEgr).txt} ${Math.abs(tendenciaEgr).toFixed(0)}% vs mes anterior`} />
        <StatCard titulo="Utilidad del año" valor={cop(r.utilidad)} icono="🪙" tono="blue"
          sub={`Margen ${(r.ingresosAnio ? (r.utilidad / r.ingresosAnio) * 100 : 0).toFixed(1)}%`} />
        <StatCard titulo="Nómina mensual" valor={cop(r.nominaMensual)} icono="👥" tono="amber" sub={`${r.empleadosActivos} empleados activos`} />
        <StatCard titulo="Por cobrar (CxC)" valor={cop(r.cxC)} icono="📬" tono="emerald" sub="Facturas pendientes de clientes" />
        <StatCard titulo="Por pagar (CxP)" valor={cop(r.cxP)} icono="📮" tono="rose" sub="Obligaciones con proveedores" />
        <StatCard titulo="Facturas pendientes" valor={String(r.facturasPendientes)} icono="⏳" tono="amber" sub={`de ${r.facturasTotal} registradas`} />
        <StatCard titulo="Retención asumida" valor={cop(db.facturas.filter((f) => f.tipo === 'INGRESO' && f.retencion > 0).reduce((s, f) => s + f.retencion, 0))} icono="🧾" tono="slate" sub="En facturas de venta del año" />
      </div>

      {/* Gráficas */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Flujo ingresos vs egresos {anio}</h2>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>Ingresos</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>Egresos</span>
            </div>
          </div>
          <AreaChart
            labels={MESES}
            series={[
              { nombre: 'Ingresos', color: '#059669', datos: serie.map((s) => s.ingresos) },
              { nombre: 'Egresos', color: '#f43f5e', datos: serie.map((s) => s.egresos) },
            ]}
          />
        </div>
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-700">Ingresos por empresa</h2>
          <Donut datos={top5.length ? top5 : [{ nombre: 'Sin datos', valor: 1, color: '#e2e8f0' }]} />
        </div>
      </div>

      {/* Tablas inferiores */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-700">Movimientos recientes</h2>
            <Link href="/facturas" className="text-sm font-semibold text-emerald-700 hover:underline">Ver todas →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Empresa</th><th className="px-5 py-3">Factura</th>
                  <th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recientes.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="max-w-44 truncate px-5 py-3 font-semibold text-slate-700">{f.empresa}</td>
                    <td className="px-5 py-3">{f.numero}</td>
                    <td className="px-5 py-3 text-slate-500">{fecha(f.fecha)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${f.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{f.tipo}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{cop(totalFactura(f))}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${f.estado === 'PAGADA' ? 'bg-emerald-100 text-emerald-800' : f.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>{f.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-700">Cartera por cobrar</h2>
            <Link href="/saldos" className="text-sm font-semibold text-emerald-700 hover:underline">Saldos →</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {porCobrar.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-700">{f.empresa}</p>
                  <p className="text-xs text-slate-400">{f.numero} · {fecha(f.fecha)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{cop(totalFactura(f))}</p>
                  <p className={`text-xs ${f.edad > 60 ? 'text-rose-600' : f.edad > 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {f.edad} días
                  </p>
                </div>
              </li>
            ))}
            {porCobrar.length === 0 && <li className="px-5 py-10 text-center text-sm text-slate-400">Sin cartera pendiente 🎉</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
