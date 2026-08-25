import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AuthShell from '@/components/AuthShell';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/');
  return (
    <AuthShell>
      <Suspense fallback={<div className="py-24 text-center text-slate-400">Cargando…</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
