import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDb } from './store';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'libromono-dev-secret-cambiar-en-produccion',
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const db = getDb();
        const user = db.usuarios.find(
          (u) => u.email.toLowerCase() === credentials.email!.toLowerCase()
        );
        if (!user || !user.activo || user.password !== credentials.password) return null;
        return { id: String(user.id), name: user.nombre, email: user.email, rol: user.rol };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = (user as { rol?: string }).rol ?? 'VISTA';
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { rol?: string }).rol = token.rol as string;
        (session.user as { id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
};
