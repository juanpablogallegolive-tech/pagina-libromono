import Chat from '@/components/Chat';
import ExogenaPanel from '@/components/ExogenaPanel';

const FORMATOS = [
  { id: '1001', t: '1001 · Pagos y gastos', d: 'Pagos o abonos en cuenta y gastos deducibles' },
  { id: '1003', t: '1003 · Retenciones', d: 'Retenciones en la fuente practicadas' },
  { id: '1005', t: '1005 · IVA descontable', d: 'Impuesto sobre las ventas descontable' },
  { id: '1006', t: '1006 · IVA generado', d: 'Impuesto sobre las ventas generado' },
  { id: '1007', t: '1007 · Ingresos', d: 'Ingresos recibidos en el año' },
  { id: '1008', t: '1008 · Cuentas por cobrar', d: 'Saldos de cuentas por cobrar al 31 dic' },
  { id: '1009', t: '1009 · Cuentas por pagar', d: 'Saldos de cuentas por pagar al 31 dic' },
  { id: '2276', t: '2276 · Rentas de trabajo', d: 'Pagos a trabajadores y su retención' },
];

export default function IaExogenaPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 p-6 text-white shadow">
        <h1 className="text-2xl font-bold">🇨🇴 IA Exógena — Medios Magnéticos</h1>
        <p className="mt-1 text-sm text-emerald-100">
          Genera los formatos DIAN en Excel con los datos reales del sistema.
        </p>
        <div className="mt-4 grid gap-2 text-xs text-emerald-50 sm:grid-cols-2">
          <p><span className="font-bold">Firmante:</span> BLANCA ODILA GOMEZ OCAMPO</p>
          <p><span className="font-bold">NIT del emisor:</span> 32390784-4</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FORMATOS.map((f) => (
          <div key={f.id} className="card p-4">
            <p className="font-bold text-emerald-800">{f.t}</p>
            <p className="mt-1 text-xs text-slate-500">{f.d}</p>
          </div>
        ))}
      </div>

      <ExogenaPanel formatos={FORMATOS.map((f) => f.id)} />

      <Chat
        endpoint="/api/ia-exogena/chat"
        placeholder="Pregúntame sobre la exógena, topes y formatos…"
        gradient="from-emerald-600 to-teal-700"
        sugerencias={[
          '¿Qué formatos debo reportar?',
          'Explícame el formato 1001',
          '¿Cuáles son los topes de la exógena?',
          '¿Cómo se llena el 2276?',
        ]}
      />
    </div>
  );
}
