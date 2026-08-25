import Chat from '@/components/Chat';

export default function ContadorIaPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-violet-700 p-6 text-white shadow">
        <h1 className="text-2xl font-bold">🤖 Contador IA</h1>
        <p className="mt-1 text-sm text-blue-100">
          Asistente contable y financiero con acceso a los datos reales del sistema — responde en pesos colombianos.
        </p>
      </div>
      <Chat
        endpoint="/api/contador-ia/chat"
        placeholder="Pregúntame sobre facturación, utilidad, nómina o impuestos…"
        gradient="from-blue-600 to-violet-700"
        sugerencias={[
          'Resume la situación financiera',
          '¿Cuánto debo de retefuente este año?',
          '¿Cuál es mi utilidad y margen?',
          '¿Cómo calculo una liquidación?',
        ]}
      />
    </div>
  );
}
