export default function StatCard({ titulo, valor, sub, icono, tono = 'slate' }: {
  titulo: string; valor: string; sub?: string; icono: string;
  tono?: 'slate' | 'emerald' | 'rose' | 'blue' | 'amber';
}) {
  const tonos: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{valor}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${tonos[tono]}`}>{icono}</span>
      </div>
    </div>
  );
}
