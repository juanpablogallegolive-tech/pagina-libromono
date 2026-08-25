// Valores UVT y tarifas de retención en la fuente (parametrizables).
// UVT oficiales según proyecto instructions: 2024=47065, 2025=49799, 2026=52631.
export const UVT: Record<number, number> = { 2024: 47065, 2025: 49799, 2026: 52631 };
export const ANIOS = [2024, 2025, 2026];

export type Concepto = 'SERVICIOS' | 'COMPRAS' | 'HONORARIOS' | 'ARRENDAMIENTO' | 'TRANSPORTE' | 'RENTAS_TRABAJO';

export const CONCEPTOS: { id: Concepto; label: string; minUvt: Record<number, number> }[] = [
  { id: 'SERVICIOS', label: 'Servicios', minUvt: { 2024: 4, 2025: 4, 2026: 4 } },
  { id: 'COMPRAS', label: 'Compras', minUvt: { 2024: 27, 2025: 27, 2026: 27 } },
  { id: 'HONORARIOS', label: 'Honorarios', minUvt: { 2024: 3, 2025: 3, 2026: 3 } },
  { id: 'ARRENDAMIENTO', label: 'Arrendamiento', minUvt: { 2024: 3, 2025: 3, 2026: 3 } },
  { id: 'TRANSPORTE', label: 'Transporte', minUvt: { 2024: 4, 2025: 4, 2026: 4 } },
  { id: 'RENTAS_TRABAJO', label: 'Rentas de trabajo (nómina)', minUvt: { 2024: 0, 2025: 0, 2026: 0 } },
];

export const TARIFAS: Record<Exclude<Concepto, 'RENTAS_TRABAJO'>, Record<number, number>> = {
  SERVICIOS: { 2024: 0.04, 2025: 0.04, 2026: 0.06 },
  COMPRAS: { 2024: 0.025, 2025: 0.025, 2026: 0.02545 },
  HONORARIOS: { 2024: 0.1, 2025: 0.1, 2026: 0.1 },
  ARRENDAMIENTO: { 2024: 0.035, 2025: 0.035, 2026: 0.035 },
  TRANSPORTE: { 2024: 0.01, 2025: 0.01, 2026: 0.01 },
};

// Rangos progresivos rentas de trabajo (Art. 383 ET, valores parametrizables)
const RANGOS_TRABAJO = [
  { hasta: 1490, tarifa: 0 },
  { hasta: 1700, tarifa: 0.19 },
  { hasta: 4100, tarifa: 0.28 },
  { hasta: 4640, tarifa: 0.33 },
  { hasta: Infinity, tarifa: 0.39 },
];
const DEDUCCION_TRABAJO: Record<number, number> = { 2024: 1090, 2025: 1090, 2026: 1250 };

export interface ResultadoRetefuente {
  concepto: Concepto; anio: number; base: number; uvtValor: number;
  baseUvt: number; baseMinimaUvt: number; tarifa: number;
  sujetaARetencion: boolean; retencion: number; nota: string;
}

export function calcularRetefuente(concepto: Concepto, anio: number, base: number): ResultadoRetefuente {
  const uvtValor = UVT[anio] ?? UVT[2026];
  const def = CONCEPTOS.find((c) => c.id === concepto)!;
  const baseMinimaUvt = def.minUvt[anio] ?? 0;
  const baseUvt = base / uvtValor;

  if (concepto === 'RENTAS_TRABAJO') {
    const deduccion = DEDUCCION_TRABAJO[anio] ?? 1250;
    const baseGravable = Math.max(0, baseUvt - deduccion);
    const rango = RANGOS_TRABAJO.find((rr) => baseGravable <= rr.hasta)!;
    const retencion = Math.max(0, baseGravable * rango.tarifa * uvtValor);
    return {
      concepto, anio, base, uvtValor, baseUvt, baseMinimaUvt: deduccion,
      tarifa: rango.tarifa, sujetaARetencion: retencion > 0,
      retencion: Math.round(retencion / 10) * 10,
      nota: `Rentas de trabajo: deducción de ${deduccion} UVT y tarifa progresiva del impuesto a la renta.`,
    };
  }

  const tarifa = TARIFAS[concepto][anio] ?? 0;
  const sujeta = baseUvt > baseMinimaUvt;
  const retencion = sujeta ? Math.round((base * tarifa) / 10) * 10 : 0;
  return {
    concepto, anio, base, uvtValor, baseUvt, baseMinimaUvt, tarifa,
    sujetaARetencion: sujeta, retencion,
    nota: sujeta
      ? `La base (${baseUvt.toFixed(1)} UVT) supera el mínimo de ${baseMinimaUvt} UVT: se practica retención.`
      : `La base (${baseUvt.toFixed(1)} UVT) NO supera el mínimo de ${baseMinimaUvt} UVT: no hay retención.`,
  };
}
