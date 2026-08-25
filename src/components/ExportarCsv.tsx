'use client';
export default function ExportarCsv({ csv, nombre }: { csv: string; nombre: string }) {
  function descargar() {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nombre; a.click();
    URL.revokeObjectURL(url);
  }
  return <button onClick={descargar} className="btn-ghost">⬇️ Exportar CSV</button>;
}
