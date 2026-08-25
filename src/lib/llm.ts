import { contextoParaIA } from './store';

export interface ChatMsg { role: 'user' | 'assistant' | 'system'; content: string }

// ---------- Cliente LLM (API compatible con OpenAI, ej. Abacus) ----------
async function* streamRemoto(messages: ChatMsg[]): AsyncGenerator<string> {
  const base = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'gpt-4.1-mini',
      stream: true,
      messages,
    }),
  });
  if (!res.ok || !res.body) throw new Error(`LLM ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const data = t.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch { /* fragmento incompleto */ }
    }
  }
}

// ---------- Contador experto offline (sin API key) ----------
function respuestaOffline(pregunta: string): string {
  const q = pregunta.toLowerCase();
  const ctx = contextoParaIA();
  const r = JSON.parse(ctx).resumen;
  const cop = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  const L: string[] = [];
  if (/factur|venta|ingres/.test(q)) {
    L.push(`📄 **Facturación ${new Date().getFullYear()}**`);
    L.push(`- Ingresos del año: **${cop(r.ingresosAnio)}**`);
    L.push(`- Egresos del año: **${cop(r.egresosAnio)}**`);
    L.push(`- Facturas registradas: **${r.facturasTotal}** (${r.facturasPendientes} pendientes o vencidas)`);
  } else if (/retefuente|retenci|uvt/.test(q)) {
    L.push('🧾 **Retención en la fuente**');
    L.push('- UVT vigentes: 2024 = $47.065 · 2025 = $49.799 · 2026 = $52.631');
    L.push('- Tarifas comunes 2026: servicios 6% · compras 2,545% · honorarios 10% · arrendamiento 3,5%');
    L.push('- Servicios y compras: retención solo si la base supera 4 UVT (servicios) o 27 UVT (compras).');
    L.push('- Usa el módulo **Retefuente** para calcular caso por caso.');
  } else if (/n[oó]mina|empleado|salario|liquidac|prima|cesant/.test(q)) {
    L.push(`👥 **Nómina actual**`);
    L.push(`- Empleados activos: **${r.empleadosActivos}**`);
    L.push(`- Total nómina mensual: **${cop(r.nominaMensual)}**`);
    L.push(`- Aportes estimados: salud 8,5% · pensión 12% · ARL ~2,1% · caja 4%.`);
    L.push(`- En el módulo **RH** puedes calcular liquidaciones (prima, cesantías +12%, vacaciones).`);
  } else if (/saldo|cuentas por cobrar|cxc|cxp|deud|pagar/.test(q)) {
    L.push(`💰 **Saldos**`);
    L.push(`- Por cobrar (CxC): **${cop(r.cxC)}**`);
    L.push(`- Por pagar (CxP): **${cop(r.cxP)}**`);
    L.push(`- Utilidad del año: **${cop(r.utilidad)}**`);
  } else if (/ex[oó]gena|medios magn[eé]ticos|1001|1003|2276/.test(q)) {
    L.push('📊 **Exógena (Medios Magnéticos)**');
    L.push('- Formatos soportados: 1001, 1003, 1005, 1006, 1007, 1008, 1009 y 2276.');
    L.push('- El reporte se genera en Excel desde el módulo **IA Exógena** con los datos reales del sistema.');
    L.push('- Firmante: BLANCA ODILA GOMEZ OCAMPO — NIT 32390784-4.');
  } else if (/utilidad|ganancia|p[eé]rdida|resultado/.test(q)) {
    L.push(`📈 **Resultados ${new Date().getFullYear()}**`);
    L.push(`- Ingresos: ${cop(r.ingresosAnio)}`);
    L.push(`- Egresos: ${cop(r.egresosAnio)}`);
    L.push(`- **Utilidad: ${cop(r.utilidad)}** (margen ${(r.ingresosAnio ? (r.utilidad / r.ingresosAnio) * 100 : 0).toFixed(1)}%)`);
  } else {
    L.push('Soy el **Contador IA** de Ferretería El Paisa. Puedo ayudarte con:');
    L.push('- 📄 Facturación e ingresos del año');
    L.push('- 🧾 Retención en la fuente y UVT (2024–2026)');
    L.push('- 👥 Nómina, liquidaciones y aportes');
    L.push('- 💰 Cuentas por cobrar y por pagar');
    L.push('- 📊 Información exógena (medios magnéticos)');
    L.push('Pregúntame, por ejemplo: *«¿cuál es mi utilidad este año?»*');
  }
  return L.join('\n');
}

async function* streamOffline(pregunta: string): AsyncGenerator<string> {
  const texto = respuestaOffline(pregunta);
  const partes = texto.split(/(\s+)/);
  for (const p of partes) {
    yield p;
    await new Promise((res) => setTimeout(res, 12));
  }
}

// ---------- API pública ----------
export async function* streamChat(
  mensajes: ChatMsg[],
  promptSistema: string
): AsyncGenerator<string> {
  const todos: ChatMsg[] = [
    { role: 'system', content: `${promptSistema}\n\nDatos actuales del sistema (JSON):\n${contextoParaIA()}` },
    ...mensajes.filter((m) => m.role !== 'system').slice(-12),
  ];
  if (process.env.LLM_API_KEY) {
    try {
      yield* streamRemoto(todos);
      return;
    } catch {
      yield '⚠️ No pude conectar con el modelo configurado (revisa LLM_API_KEY). Respondo en modo offline con los datos del sistema:\n\n';
    }
  }
  const ultima = [...mensajes].reverse().find((m) => m.role === 'user')?.content ?? '';
  yield* streamOffline(ultima);
}

export const PROMPT_CONTADOR = `Eres el Contador IA de "Ferretería El Paisa" (contabilidad colombiana).
Responde SIEMPRE en español colombiano, con formato claro y montos en pesos (COP).
Usa los datos reales del sistema que se adjuntan. Sé conciso (máx. 200 palabras) y práctico.
Si te preguntan por temas tributarios, cita los valores UVT conocidos: 2024=47065, 2025=49799, 2026=52631.`;

export const PROMPT_EXOGENA = `Eres el asistente de IA Exógena (Medios Magnéticos, DIAN Colombia) de "Ferretería El Paisa".
Responde en español colombiano. Explica los formatos 1001, 1003, 1005, 1006, 1007, 1008, 1009 y 2276,
sus topes de reporte y cómo se construyen con los datos del sistema. Firmante: BLANCA ODILA GOMEZ OCAMPO, NIT 32390784-4.`;
