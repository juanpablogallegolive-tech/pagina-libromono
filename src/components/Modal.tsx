'use client';
export default function Modal({ titulo, abierto, onCerrar, children }: {
  titulo: string; abierto: boolean; onCerrar: () => void; children: React.ReactNode;
}) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCerrar}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{titulo}</h3>
          <button onClick={onCerrar} className="rounded-lg px-2 text-xl text-slate-400 hover:bg-slate-100">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
