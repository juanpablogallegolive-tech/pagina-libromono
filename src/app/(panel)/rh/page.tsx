import { getDb } from '@/lib/store';
import { cop } from '@/lib/format';
import RhClient from '@/components/RhClient';
import LiquidacionCalc from '@/components/LiquidacionCalc';

export default function RhPage() {
  const db = getDb();
  const activos = db.empleados.filter((e) => e.activo);
  const nomina = activos.reduce((s, e) => s + e.salario, 0);
  const salud = Math.round(nomina * 0.085);
  const pension = Math.round(nomina * 0.12);
  const arl = Math.round(nomina * 0.021);
  const caja = Math.round(nomina * 0.04);
  const deduccionEmpleado = Math.round(nomina * 0.04) * 2;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">👥 Recursos Humanos</h1>
        <p className="text-sm text-slate-500">Empleados, nómina y liquidaciones — Ferretería El Paisa</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Empleados activos</p><p className="text-xl font-bold text-slate-800">{activos.length}</p></div>
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Nómina mensual</p><p className="text-xl font-bold text-slate-800">{cop(nomina)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Aportes (salud+pensión+ARL+caja)</p><p className="text-xl font-bold text-amber-700">{cop(salud + pension + arl + caja)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs text-slate-500">Deducción empleado (4%+4%)</p><p className="text-xl font-bold text-rose-700">{cop(deduccionEmpleado)}</p></div>
      </div>

      <RhClient initial={db.empleados} />
      <LiquidacionCalc />
    </div>
  );
}
