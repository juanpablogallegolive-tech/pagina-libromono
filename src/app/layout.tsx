import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Contabilidad Ferretería — Ferretería El Paisa',
  description: 'Sistema contable y de gestión humana multi-empresa para Ferretería El Paisa.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
