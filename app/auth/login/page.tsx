import { Metadata } from 'next';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Login - NO PERIPHERALS',
  description: 'Login to access the NO PERIPHERALS collective.',
};

export default function LoginPage() {
  return <LoginForm />;
}
