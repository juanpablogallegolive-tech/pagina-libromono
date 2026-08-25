// ============================================================
// Almacén de datos en memoria (modo demostración, sin DB externa).
// Para producción con persistencia real, conecta PostgreSQL/Neon:
// reemplaza las funciones de este módulo por llamadas a Prisma.
// ============================================================
export type Rol = 'ADMIN' | 'CONTADOR' | 'VISTA';
export type TipoEmpresa = 'CLIENTE' | 'PROVEEDOR' | 'AMBOS';
export type TipoFactura = 'INGRESO' | 'EGRESO';
export type EstadoFactura = 'PAGADA' | 'PENDIENTE' | 'VENCIDA';

export interface Usuario {
  id: number; nombre: string; email: string; password: string;
  rol: Rol; activo: boolean; creado: string;
}
export interface Empresa {
  id: number; nit: string; razonSocial: string; tipo: TipoEmpresa;
  direccion: string; telefono: string; email: string; activo: boolean;
}
export interface Factura {
  id: number; empresaId: number; numero: string; fecha: string;
  tipo: TipoFactura; concepto: string; valorBase: number;
  iva: number; retencion: number; estado: EstadoFactura;
}
export interface Empleado {
  id: number; nombre: string; cedula: string; cargo: string;
  salario: number; fechaIngreso: string; activo: boolean;
}

export function totalFactura(f: Factura): number {
  return f.valorBase + f.iva - f.retencion;
}

export interface ResetToken {
  token: string; email: string; expira: number;
}

interface DB {
  usuarios: Usuario[]; empresas: Empresa[]; facturas: Factura[];
  empleados: Empleado[]; nextId: Record<string, number>; seeded: boolean;
  reseteos: ResetToken[];
}

const g = globalThis as unknown as { __libromonoDB?: DB };

function seed(db: DB) {
  db.usuarios = [
    { id: 1, nombre: 'Blanca Odila Gomez Ocampo', email: 'admin@ferreteria.com', password: 'admin123', rol: 'ADMIN', activo: true, creado: '2024-02-01' },
    { id: 2, nombre: 'Juan Pablo Gallego', email: 'contador@ferreteria.com', password: 'contador123', rol: 'CONTADOR', activo: true, creado: '2024-03-15' },
    { id: 3, nombre: 'Ana María Ruiz', email: 'vista@ferreteria.com', password: 'vista123', rol: 'VISTA', activo: true, creado: '2024-06-20' },
  ];
  db.empresas = [
    { id: 1, nit: '900123456-1', razonSocial: 'Distarco S.A.S', tipo: 'PROVEEDOR', direccion: 'Cra 21 #45-12, Sincelejo', telefono: '3105558877', email: 'ventas@distarco.com', activo: true },
    { id: 2, nit: '901234567-8', razonSocial: 'Comercializadora del Norte S.A.S', tipo: 'CLIENTE', direccion: 'Av. Las Palmas #30-05', telefono: '3159876543', email: 'contacto@comnorte.com', activo: true },
    { id: 3, nit: '800987654-3', razonSocial: 'Servicios Técnicos de Sucre Ltda', tipo: 'AMBOS', direccion: 'Calle 28 #18-40', telefono: '3123456789', email: 'gerencia@stsucre.com', activo: true },
    { id: 4, nit: '902345678-9', razonSocial: 'Inversiones Sincelejo S.A.S', tipo: 'CLIENTE', direccion: 'Cra 14 #22-60', telefono: '3187654321', email: 'facturacion@inversionessincelejo.com', activo: true },
    { id: 5, nit: '830112233-4', razonSocial: 'Maderas y Construcciones El Roble', tipo: 'PROVEEDOR', direccion: 'Km 3 Vía Corozal', telefono: '3145678901', email: 'pedidos@elroble.com', activo: true },
    { id: 6, nit: '700556677-8', razonSocial: 'Ferretería Central Momposina', tipo: 'CLIENTE', direccion: 'Barrio Centro, Mompós', telefono: '3112223344', email: 'centralmomposina@gmail.com', activo: true },
  ];
  const F = (id: number, empresaId: number, numero: string, fecha: string, tipo: TipoFactura, concepto: string, valorBase: number, iva: number, retencion: number, estado: EstadoFactura): Factura =>
    ({ id, empresaId, numero, fecha, tipo, concepto, valorBase, iva, retencion, estado });
  db.facturas = [
    F(1, 2, 'FC-2025-001', '2025-02-14', 'INGRESO', 'Venta de materiales de construcción', 12500000, 2375000, 0, 'PAGADA'),
    F(2, 5, 'FV-2025-002', '2025-03-02', 'EGRESO', 'Compra de inventario tornillería', 8400000, 1596000, 210000, 'PAGADA'),
    F(3, 4, 'FC-2025-003', '2025-03-28', 'INGRESO', 'Suministro de herramientas', 6800000, 1292000, 0, 'PAGADA'),
    F(4, 3, 'FV-2025-004', '2025-04-11', 'EGRESO', 'Mantenimiento equipos de corte', 1900000, 361000, 95000, 'PAGADA'),
    F(5, 2, 'FC-2025-005', '2025-05-19', 'INGRESO', 'Venta por mayor cemento y arena', 22300000, 4237000, 0, 'PAGADA'),
    F(6, 1, 'FV-2025-006', '2025-06-07', 'EGRESO', 'Compra pinturas industrializadas', 15600000, 2964000, 390000, 'PAGADA'),
    F(7, 6, 'FC-2025-007', '2025-07-23', 'INGRESO', 'Venta tubería PVC', 5250000, 997500, 0, 'PENDIENTE'),
    F(8, 5, 'FV-2025-008', '2025-08-15', 'EGRESO', 'Madera tratada para estanterías', 7350000, 1396500, 183750, 'PAGADA'),
    F(9, 4, 'FC-2025-009', '2025-09-30', 'INGRESO', 'Arriendo andamios obra centro', 4700000, 893000, 235000, 'VENCIDA'),
    F(10, 2, 'FC-2026-001', '2026-01-16', 'INGRESO', 'Venta materiales obra hotel', 18500000, 3515000, 0, 'PAGADA'),
    F(11, 1, 'FV-2026-002', '2026-01-29', 'EGRESO', 'Pedido herramientas eléctricas', 11250000, 2137500, 281250, 'PAGADA'),
    F(12, 3, 'FC-2026-003', '2026-02-12', 'INGRESO', 'Servicio instalación eléctrica bodega', 9600000, 1824000, 384000, 'PENDIENTE'),
    F(13, 5, 'FV-2026-004', '2026-02-25', 'EGRESO', 'Compra aglomerado y chapas', 4250000, 807500, 106250, 'PAGADA'),
    F(14, 6, 'FC-2026-005', '2026-03-08', 'INGRESO', 'Venta a granel clavos y alambre', 3150000, 598500, 0, 'PAGADA'),
    F(15, 4, 'FC-2026-006', '2026-03-27', 'INGRESO', 'Suministro grifería completa', 14800000, 2812000, 0, 'PENDIENTE'),
    F(16, 1, 'FV-2026-007', '2026-04-09', 'EGRESO', 'Reposición sellantes y adhesivos', 2870000, 545300, 71750, 'PAGADA'),
    F(17, 3, 'FV-2026-008', '2026-04-22', 'EGRESO', 'Servicio afilado y reparación', 890000, 169100, 44375, 'PAGADA'),
    F(18, 2, 'FC-2026-009', '2026-05-05', 'INGRESO', 'Venta estructura metálica', 26400000, 5016000, 0, 'PAGADA'),
    F(19, 5, 'FV-2026-010', '2026-05-21', 'EGRESO', 'Compra madera pino cepillado', 9950000, 1890500, 248750, 'VENCIDA'),
    F(20, 6, 'FC-2026-011', '2026-06-03', 'INGRESO', 'Venta accesorios plomería', 2740000, 520600, 0, 'PAGADA'),
    F(21, 1, 'FV-2026-012', '2026-06-18', 'EGRESO', 'Pedido especial soldaduras', 6300000, 1197000, 157500, 'PENDIENTE'),
    F(22, 4, 'FC-2026-013', '2026-07-07', 'INGRESO', 'Equipamiento taller mecánico', 17200000, 3268000, 0, 'PAGADA'),
    F(23, 3, 'FC-2026-014', '2026-07-24', 'INGRESO', 'Mantenimiento preventivo planta', 5800000, 1102000, 290000, 'PENDIENTE'),
    F(24, 5, 'FV-2026-015', '2026-08-06', 'EGRESO', 'Compra tableros y molduras', 8150000, 1548500, 203750, 'PAGADA'),
    F(25, 2, 'FC-2026-016', '2026-08-15', 'INGRESO', 'Venta cerraduras y chapas finas', 6920000, 1314800, 0, 'PENDIENTE'),
    F(26, 6, 'FC-2026-017', '2026-08-22', 'INGRESO', 'Servicio asesoría obra Mompós', 2450000, 465500, 122500, 'VENCIDA'),
  ];
  db.empleados = [
    { id: 1, nombre: 'Carlos José Pérez Lemus', cedula: '1098765432', cargo: 'Jefe de ventas', salario: 2400000, fechaIngreso: '2021-03-01', activo: true },
    { id: 2, nombre: 'María Fernanda Ruiz Ospina', cedula: '1032456789', cargo: 'Cajera principal', salario: 1450000, fechaIngreso: '2022-07-15', activo: true },
    { id: 3, nombre: 'Andrés Felipe Márquez', cedula: '1122334455', cargo: 'Auxiliar de bodega', salario: 1300000, fechaIngreso: '2023-01-20', activo: true },
    { id: 4, nombre: 'Luisa Marcela Berrocal', cedula: '1045678901', cargo: 'Contadora', salario: 2800000, fechaIngreso: '2020-08-03', activo: true },
    { id: 5, nombre: 'Jorge Enrique Mendoza', cedula: '71234567', cargo: 'Conductor repartidor', salario: 1400000, fechaIngreso: '2023-05-10', activo: true },
    { id: 6, nombre: 'Yuliana Patricia Padilla', cedula: '1091122334', cargo: 'Vendedora piso', salario: 1350000, fechaIngreso: '2024-09-02', activo: true },
    { id: 7, nombre: 'Óscar Iván Montes', cedula: '84555222', cargo: 'Vigilante', salario: 1300000, fechaIngreso: '2019-11-11', activo: false },
  ];
  db.nextId = { usuarios: 4, empresas: 7, facturas: 27, empleados: 8 };
  db.seeded = true;
}

export function getDb(): DB {
  if (!g.__libromonoDB) {
    g.__libromonoDB = { usuarios: [], empresas: [], facturas: [], empleados: [], nextId: {}, seeded: false, reseteos: [] };
  }
  const db = g.__libromonoDB;
  if (!db.seeded) seed(db);
  if (!db.reseteos) db.reseteos = [];
  return db;
}

// ---------- Helpers de agregación ----------
export interface Resumen {
  ingresosAnio: number; egresosAnio: number; utilidad: number;
  cxC: number; cxP: number; facturasPendientes: number; facturasTotal: number;
  nominaMensual: number; empleadosActivos: number; empresasActivas: number;
}
export function resumen(anio = new Date().getFullYear()): Resumen {
  const db = getDb();
  const fact = db.facturas.filter((f) => f.fecha.startsWith(String(anio)));
  const ingresosAnio = fact.filter((f) => f.tipo === 'INGRESO').reduce((s, f) => s + totalFactura(f), 0);
  const egresosAnio = fact.filter((f) => f.tipo === 'EGRESO').reduce((s, f) => s + totalFactura(f), 0);
  const cxC = db.facturas.filter((f) => f.tipo === 'INGRESO' && f.estado !== 'PAGADA').reduce((s, f) => s + totalFactura(f), 0);
  const cxP = db.facturas.filter((f) => f.tipo === 'EGRESO' && f.estado !== 'PAGADA').reduce((s, f) => s + totalFactura(f), 0);
  const activos = db.empleados.filter((e) => e.activo);
  return {
    ingresosAnio, egresosAnio, utilidad: ingresosAnio - egresosAnio,
    cxC, cxP,
    facturasPendientes: db.facturas.filter((f) => f.estado !== 'PAGADA').length,
    facturasTotal: db.facturas.length,
    nominaMensual: activos.reduce((s, e) => s + e.salario, 0),
    empleadosActivos: activos.length,
    empresasActivas: db.empresas.filter((e) => e.activo).length,
  };
}

export function contextoParaIA(): string {
  const r = resumen();
  const db = getDb();
  const topEmpresas = [...db.empresas].map((e) => ({
    empresa: e.razonSocial, nit: e.nit, tipo: e.tipo,
    facturas: db.facturas.filter((f) => f.empresaId === e.id).length,
  }));
  return JSON.stringify({
    empresa: 'Ferretería El Paisa', anioActual: new Date().getFullYear(),
    resumen: r,
    retencionPracticadaAnio: db.facturas
      .filter((f) => f.tipo === 'EGRESO' && f.retencion > 0)
      .reduce((s, f) => s + f.retencion, 0),
    retencionAsumidaAnio: db.facturas
      .filter((f) => f.tipo === 'INGRESO' && f.retencion > 0)
      .reduce((s, f) => s + f.retencion, 0),
    empresas: topEmpresas,
    empleadosActivos: r.empleadosActivos,
  }, null, 2);
}
