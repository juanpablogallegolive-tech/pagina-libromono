import Link from 'next/link';
import { getDb, resumen, totalFactura } from '@/lib/store';
import { cop, fecha } from '@/lib/format';
import StatCard from '@/components/StatCard';

export default function DashboardPage() {
  const anio = new Date().getFullYear();
  const r = resumen(anio);
  const db = getDb();
  const recientes = [...db.facturas]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 8)
    .map((f) => ({ ...f, empresa: db.empresas.find((e) => e.id === f.empresaId)?.razonSocial ?? '—' }));

  const acceso = [
    { href: '/facturas', t: 'Facturas', d: 'Registrar y consultar', i: '📄' },
    { href: '/retefuente', t: 'Retefuente', d: 'Calcular retenciones', i: '🧾' },
    { href: '/rh', t: 'Nómina y RH', d: 'Empleados y liquidaciones', i: '👥' },
    { href: '/contador-ia', t: 'Contador IA', d: 'Asistente financiero', i: '🤖' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-900 p-6 text-white shadow">
        <h1 className="text-2xl font-bold">Dashboard · Ferretería El Paisa</h1>
        <p className="mt-1 text-sm text-emerald-100">
          Resumen contable {anio} · {r.empresasActivas} empresas activas · {r.empleadosActivos} empleados
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard titulo={`Ingresos ${anio}`} valor={cop(r.ingresosAnio)} icono="📈" tono="emerald" sub="Facturas de venta" />
        <StatCard titulo={`Egresos ${anio}`} valor={cop(r.egresosAnio)} icono="📉" tono="rose" sub="Compras y servicios" />
        <StatCard titulo="Utilidad del año" valor={cop(r.utilidad)} icono="🪙" tono="blue"
          sub={`Margen ${(r.ingresosAnio ? (r.utilidad / r.ingresosAnio) * 100 : 0).toFixed(1)}%`} />
        <StatCard titulo="Nómina mensual" valor={cop(r.nominaMensual)} icono="👥" tono="amber" sub={`${r.empleadosActivos} empleados activos`} />
        <StatCard titulo="Por cobrar (CxC)" valor={cop(r.cxC)} icono="📬" tono="emerald" sub="Cuentas pendientes de clientes" />
        <StatCard titulo="Por pagar (CxP)" valor={cop(r.cxP)} icono="📮" tono="rose" sub="Obligaciones con proveedores" />
        <StatCard titulo="Facturas pendientes" valor={String(r.facturasPendientes)} icono="⏳" tono="amber" sub={`de ${r.facturasTotal} registradas`} />
        <StatCard titulo="Empresas activas" valor={String(r.empresasActivas)} icono="🏢" tono="slate" sub="Clientes y proveedores" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-700">Últimas facturas</h2>
          <Link href="/facturas" className="text-sm font-semibold text-emerald-700 hover:underline">Ver todas →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Número</th><th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Empresa</th><th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">Tipo</th><th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recientes.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-700">{f.numero}</td>
                  <td className="px-5 py-3 text-slate-500">{fecha(f.fecha)}</td>
                  <td className="px-5 py-3">{f.empresa}</td>
                  <td className="max-w-56 truncate px-5 py-3 text-slate-500">{f.concepto}</td>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {acceso.map((a) => (
          <Link key={a.href} href={a.href} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="text-2xl">{a.i}</span>
            <p className="mt-2 font-semibold text-slate-700 group-hover:text-emerald-700">{a.t}</p>
            <p className="text-xs text-slate-400">{a.d}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
