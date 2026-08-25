import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/auth/login' },
  secret: process.env.NEXTAUTH_SECRET || 'libromono-dev-secret-cambiar-en-produccion',
});

export const config = {
  matcher: [
    '/empresas/:path*', '/facturas/:path*', '/reportes/:path*', '/retefuente/:path*',
    '/saldos/:path*', '/rh/:path*', '/contador-ia/:path*', '/ia-exogena/:path*',
    '/admin/:path*',
  ],
};
