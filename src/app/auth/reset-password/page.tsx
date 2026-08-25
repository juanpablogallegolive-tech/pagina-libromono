import AuthShell from '@/components/AuthShell';
import ResetForm from '@/components/ResetForm';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <AuthShell>
      <ResetForm token={searchParams?.token ?? ''} />
    </AuthShell>
  );
}
