import { ANIOS, CONCEPTOS, TARIFAS, UVT } from '@/lib/uvt';
import RetefuenteCalc from '@/components/RetefuenteCalc';

export default function RetefuentePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🧾 Retefuente</h1>
        <p className="text-sm text-slate-500">Retención en la fuente con topes históricos 2024–2026</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {ANIOS.map((a) => (
          <div key={a} className="card p-5">
            <p className="text-sm font-medium text-slate-500">UVT {a}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">${UVT[a].toLocaleString('es-CO')}</p>
          </div>
        ))}
      </div>

      <RetefuenteCalc />

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-700">Tarifas por concepto y año</h2>
          <p className="text-xs text-slate-400">Valores parametrizables en <code>src/lib/uvt.ts</code></p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Concepto</th>
                {ANIOS.map((a) => <th key={a} className="px-5 py-3 text-right">Tarifa {a}</th>)}
                <th className="px-5 py-3 text-right">Base mínima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(TARIFAS).map(([k, v]) => {
                const c = CONCEPTOS.find((x) => x.id === k)!;
                return (
                  <tr key={k} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-700">{c.label}</td>
                    {ANIOS.map((a) => (
                      <td key={a} className="px-5 py-3 text-right">{(v[a] * 100).toLocaleString('es-CO', { maximumFractionDigits: 3 })}%</td>
                    ))}
                    <td className="px-5 py-3 text-right text-slate-500">{c.minUvt[2026]} UVT</td>
                  </tr>
                );
              })}
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 font-semibold text-slate-700">Rentas de trabajo</td>
                {ANIOS.map((a) => <td key={a} className="px-5 py-3 text-right text-slate-500">progresiva</td>)}
                <td className="px-5 py-3 text-right text-slate-500">1090–1250 UVT deducibles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
