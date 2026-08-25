export default function AuthShell({ children, footer = '© 2024 Sistema Contable Ferretería' }: {
  children: React.ReactNode; footer?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-white md:flex">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">🛠️</div>
            <h1 className="text-3xl font-bold leading-tight">Sistema Contable</h1>
            <p className="mt-2 text-lg text-emerald-100">Ferretería — Gestión Integral</p>
            <ul className="mt-8 space-y-2 text-sm text-emerald-50">
              <li>✓ Facturación, retefuente y saldos</li>
              <li>✓ Nómina y gestión humana</li>
              <li>✓ Contador IA e IA Exógena (DIAN)</li>
            </ul>
          </div>
          <p className="text-xs text-emerald-200">{footer}</p>
        </div>
        <div className="bg-white p-8 md:p-10">
          {children}
          <p className="mt-8 text-center text-xs text-slate-400 md:hidden">{footer}</p>
        </div>
      </div>
    </main>
  );
}
