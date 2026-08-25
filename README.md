# Contabilidad Ferretería — Ferretería El Paisa

Sistema contable y de gestión humana **multi-empresa** construido con **Next.js 14 (App Router) + Tailwind CSS + NextAuth**, listo para desplegar en **Vercel**.

## Módulos
| Ruta | Módulo |
|---|---|
| `/` | Dashboard con indicadores en tiempo real |
| `/empresas` | Clientes y proveedores (CRUD) |
| `/facturas` | Ingresos/egresos con IVA y retención (CRUD) |
| `/reportes` | Reportes por mes y por empresa + export CSV |
| `/retefuente` | Calculadora con UVT históricos 2024–2026 |
| `/saldos` | CxC / CxP con cartera por edades |
| `/rh` | Empleados, nómina y liquidaciones |
| `/contador-ia` | Asistente contable (streaming, azul/morado) |
| `/ia-exogena` | Medios Magnéticos DIAN + generación Excel (verde) |
| `/admin/usuarios` | Administración de usuarios (solo ADMIN) |
| `/auth/forgot-password` | Recuperar contraseña (token 1 hora) |
| `/auth/reset-password` | Nueva contraseña con token |
| `/auth/register` | Crear cuenta (rol VISTA inicial) |

## Accesos de demostración
| Email | Contraseña | Rol |
|---|---|---|
| admin@ferreteria.com | admin123 | ADMIN |
| contador@ferreteria.com | contador123 | CONTADOR |
| vista@ferreteria.com | vista123 | VISTA |

## Desarrollo local
```bash
npm install
npm run dev        # http://localhost:3000
```

## Despliegue en Vercel
Ver **[DEPLOY.md](./DEPLOY.md)** — 3 minutos, sin configurar base de datos.

## Nota sobre los datos
Esta versión usa un **almacén en memoria con datos de demostración** (6 empresas, 26 facturas, 7 empleados): funciona en cualquier hosting sin configurar nada. Para persistencia real en producción, conecta PostgreSQL/Neon reemplazando `src/lib/store.ts` (la interfaz ya está aislada para ese cambio).
