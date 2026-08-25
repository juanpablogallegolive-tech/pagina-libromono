export function cop(n: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(n);
}
export function fecha(dt: string): string {
  const d = new Date(dt + (dt.length === 10 ? 'T12:00:00' : ''));
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function pct(n: number): string {
  return `${(n * 100).toLocaleString('es-CO', { maximumFractionDigits: 2 })}%`;
}
