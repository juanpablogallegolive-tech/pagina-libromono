import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & { id?: string; rol?: string };
  }
  interface User {
    rol?: string;
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    rol?: string;
    uid?: string;
  }
}
