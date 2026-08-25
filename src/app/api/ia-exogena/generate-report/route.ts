import { getServerSession } from 'next-auth';
import * as XLSX from 'xlsx';
import { authOptions } from '@/lib/auth';
import { getDb, totalFactura } from '@/lib/store';

const FIRMANTE = 'BLANCA ODILA GOMEZ OCAMPO';
const NIT_EMISOR = '32390784-4';

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!s?.user) return new Response('No autorizado', { status: 401 });

  const { formato, anio } = (await req.json()) as { formato: string; anio: number };
  const db = getDb();
  const delAnio = db.facturas.filter((f) => f.fecha.startsWith(String(anio)));
  const nombreEmpresa = (id: number) => db.empresas.find((e) => e.id === id)?.razonSocial ?? 'SIN NOMBRE';
  const nitEmpresa = (id: number) => db.empresas.find((e) => e.id === id)?.nit ?? '0';

  let columnas: string[] = [];
  let filas: (string | number)[][] = [];
  let descripcion = '';

  switch (formato) {
    case '1001':
      descripcion = 'Pagos o abonos en cuenta y gastos deducibles';
      columnas = ['CONCEPTO', 'RAZÓN SOCIAL', 'NIT TERCERO', 'BASE PAGOS', 'IVA', 'TOTAL PAGADO'];
      filas = delAnio.filter((f) => f.tipo === 'EGRESO').map((f) => [
        f.concepto, nombreEmpresa(f.empresaId), nitEmpresa(f.empresaId), f.valorBase, f.iva, totalFactura(f),
      ]);
      break;
    case '1003':
      descripcion = 'Retenciones en la fuente practicadas';
      columnas = ['CONCEPTO', 'RAZÓN SOCIAL', 'NIT TERCERO', 'BASE RETENCIÓN', 'RETENCIÓN PRACTICADA'];
      filas = delAnio.filter((f) => f.retencion > 0).map((f) => [
        f.concepto, nombreEmpresa(f.empresaId), nitEmpresa(f.empresaId), f.valorBase, f.retencion,
      ]);
      break;
    case '1005':
      descripcion = 'Impuesto sobre las ventas descontable';
      columnas = ['CONCEPTO', 'RAZÓN SOCIAL', 'NIT TERCERO', 'IVA DESCONTABLE'];
      filas = delAnio.filter((f) => f.tipo === 'EGRESO' && f.iva > 0).map((f) => [
        f.concepto, nombreEmpresa(f.empresaId), nitEmpresa(f.empresaId), f.iva,
      ]);
      break;
    case '1006':
      descripcion = 'Impuesto sobre las ventas generado';
      columnas = ['CONCEPTO', 'RAZÓN SOCIAL', 'NIT TERCERO', 'IVA GENERADO'];
      filas = delAnio.filter((f) => f.tipo === 'INGRESO' && f.iva > 0).map((f) => [
        f.concepto, nombreEmpresa(f.empresaId), nitEmpresa(f.empresaId), f.iva,
      ]);
      break;
    case '1007':
      descripcion = 'Ingresos recibidos en el año';
      columnas = ['CONCEPTO', 'RAZÓN SOCIAL', 'NIT TERCERO', 'INGRESO BRUTO'];
      filas = delAnio.filter((f) => f.tipo === 'INGRESO').map((f) => [
        f.concepto, nombreEmpresa(f.empresaId), nitEmpresa(f.empresaId), totalFactura(f),
      ]);
      break;
    case '1008':
      descripcion = 'Saldos de cuentas por cobrar al 31 de diciembre';
      columnas = ['FACTURA', 'RAZÓN SOCIAL', 'NIT TERCERO', 'SALDO CxC'];
      filas = delAnio.filter((f) => f.tipo === 'INGRESO' && f.estado !== 'PAGADA').map((f) => [
        f.numero, nombreEmpresa(f.empresaId), nitEmpresa(f.empresaId), totalFactura(f),
      ]);
      break;
    case '1009':
      descripcion = 'Saldos de cuentas por pagar al 31 de diciembre';
      columnas = ['FACTURA', 'RAZÓN SOCIAL', 'NIT TERCERO', 'SALDO CxP'];
      filas = delAnio.filter((f) => f.tipo === 'EGRESO' && f.estado !== 'PAGADA').map((f) => [
        f.numero, nombreEmpresa(f.empresaId), nitEmpresa(f.empresaId), totalFactura(f),
      ]);
      break;
    case '2276':
      descripcion = 'Pagos a trabajadores y retenciones (rentas de trabajo)';
      columnas = ['EMPLEADO', 'CÉDULA', 'CARGO', 'PAGO ANUAL ESTIMADO', 'RETENCIÓN ESTIMADA'];
      filas = db.empleados.filter((e) => e.activo).map((e) => {
        const anual = e.salario * 12;
        const baseUvt = anual / 52631;
        const gravable = Math.max(0, baseUvt - 1250);
        const tarifa = gravable <= 240 ? 0 : gravable <= 590 ? 0.19 : gravable <= 1000 ? 0.28 : 0.33;
        return [e.nombre, e.cedula, e.cargo, anual, Math.round((gravable * tarifa * 52631) / 10) * 10];
      });
      break;
    default:
      return new Response('Formato no soportado', { status: 400 });
  }

  const aoa: (string | number)[][] = [
    ['REPORTE EXÓGENA — MEDIOS MAGNÉTICOS DIAN'],
    [`Formato ${formato} · ${descripcion}`],
    [`Año gravable: ${anio}`],
    [`Emisor: Ferretería El Paisa · NIT: ${NIT_EMISOR}`],
    [`Firmante: ${FIRMANTE}`],
    [],
    columnas,
    ...filas,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Formato ${formato}`);
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

  return new Response(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="exogena_${formato}_${anio}.xlsx"`,
    },
  });
}
