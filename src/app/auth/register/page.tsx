import AuthShell from '@/components/AuthShell';
import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthShell footer="© 2024 Sistema Contable Profesional">
      <RegisterForm />
    </AuthShell>
  );
}
