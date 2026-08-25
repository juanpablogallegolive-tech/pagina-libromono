'use client';
import { useRef, useState } from 'react';

interface Msg { role: 'user' | 'assistant'; content: string }

export default function Chat({ endpoint, sugerencias, gradient = 'from-blue-600 to-violet-700', placeholder }: {
  endpoint: string; sugerencias: string[]; gradient?: string; placeholder: string;
}) {
  const [mensajes, setMensajes] = useState<Msg[]>([]);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  async function enviar(contenido: string) {
    if (!contenido.trim() || pensando) return;
    const nuevos: Msg[] = [...mensajes, { role: 'user', content: contenido.trim() }];
    setMensajes([...nuevos, { role: 'assistant', content: '' }]);
    setTexto('');
    setPensando(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nuevos }),
      });
      if (!res.ok || !res.body) throw new Error('fallo');
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMensajes([...nuevos, { role: 'assistant', content: acc }]);
        finRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch {
      setMensajes([...nuevos, { role: 'assistant', content: '⚠️ Hubo un error al contactar el asistente. Intenta de nuevo.' }]);
    }
    setPensando(false);
  }

  return (
    <div className="card flex h-[560px] flex-col overflow-hidden">
      <div className={`flex-1 space-y-4 overflow-y-auto bg-gradient-to-b ${gradient} to- opacity-95 p-4`}>
        {mensajes.length === 0 && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-white/95 p-6 text-center shadow-lg">
            <p className="text-3xl">🤖</p>
            <p className="mt-2 font-bold text-slate-800">¡Hola! ¿En qué te ayudo hoy?</p>
            <p className="mt-1 text-sm text-slate-500">Tengo acceso a los datos reales de tu contabilidad.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {sugerencias.map((s) => (
                <button key={s} onClick={() => enviar(s)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-current hover:text-blue-700">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {mensajes.map((m, i) => (
          m.role === 'user'
            ? <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-white p-3 text-sm text-slate-800 shadow">{m.content}</div>
            : (
              <div key={i} className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-slate-900/85 p-3 text-sm text-emerald-50 shadow">
                {m.content || '…'}
              </div>
            )
        ))}
        <div ref={finRef} />
      </div>
      <form className="flex gap-2 border-t border-slate-200 bg-white p-3"
        onSubmit={(e) => { e.preventDefault(); enviar(texto); }}>
        <input className="input" placeholder={placeholder} value={texto}
          onChange={(e) => setTexto(e.target.value)} disabled={pensando} />
        <button type="submit" className="btn-primary" disabled={pensando || !texto.trim()}>
          {pensando ? '…' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
