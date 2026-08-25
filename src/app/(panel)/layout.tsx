import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');
  const nombre = session.user.name ?? 'Usuario';
  const rol = session.user.rol ?? 'VISTA';
  return (
    <div className="min-h-screen">
      <Sidebar rol={rol} />
      <div className="lg:pl-64">
        <TopBar nombre={nombre} rol={rol} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
