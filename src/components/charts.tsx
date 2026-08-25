// Gráficas SVG puras (server components, sin dependencias)
import { cop } from '@/lib/format';

export function AreaChart({ series, labels }: {
  series: { nombre: string; color: string; datos: number[] }[];
  labels: string[];
}) {
  const W = 760, H = 260, PAD = 10, BASE = 210;
  const n = labels.length;
  const max = Math.max(1, ...series.flatMap((s) => s.datos)) * 1.15;
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (n - 1);
  const y = (v: number) => BASE - (v / max) * (BASE - 25);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfica ingresos vs egresos">
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>
      {[0, 1, 2, 3].map((g) => {
        const gy = 25 + g * ((BASE - 25) / 3);
        return <line key={g} x1={PAD} x2={W - PAD} y1={gy} y2={gy} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={g === 3 ? '0' : '4 4'} />;
      })}
      {series.map((s, si) => {
        const puntos = s.datos.map((v, i) => `${x(i)},${y(v)}`).join(' ');
        const area = `M ${x(0)},${BASE} L ${s.datos.map((v, i) => `${x(i)},${y(v)}`).join(' L ')} L ${x(n - 1)},${BASE} Z`;
        return (
          <g key={si}>
            <path d={area} fill={`url(#grad-${si})`} />
            <polyline points={puntos} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {s.datos.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="white" stroke={s.color} strokeWidth="2">
                <title>{`${s.nombre} ${labels[i]}: ${cop(v)}`}</title>
              </circle>
            ))}
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize="11" fill="#94a3b8">{l}</text>
      ))}
    </svg>
  );
}

export function Donut({ datos }: { datos: { nombre: string; valor: number; color: string }[] }) {
  const total = Math.max(1, datos.reduce((s, d) => s + d.valor, 0));
  const R = 56, C = 2 * Math.PI * R;
  let acumulado = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0" role="img" aria-label="Distribución por empresa">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {datos.map((d, i) => {
          const frac = d.valor / total;
          const el = (
            <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={d.color} strokeWidth="18"
              strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-acumulado * C}
              transform="rotate(-90 70 70)">
              <title>{`${d.nombre}: ${cop(d.valor)} (${(frac * 100).toFixed(1)}%)`}</title>
            </circle>
          );
          acumulado += frac;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" fontSize="11" fill="#94a3b8">Total</text>
        <text x="70" y="82" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">
          {(total / 1_000_000).toFixed(1)}M
        </text>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {datos.map((d, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate text-slate-600">{d.nombre}</span>
            </span>
            <span className="shrink-0 font-semibold text-slate-700">{((d.valor / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
