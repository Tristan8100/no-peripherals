import { Metadata } from 'next';
import { RegisterForm } from '@/components/register-form';

export const metadata: Metadata = {
  title: 'Register - NO PERIPHERALS',
  description: 'Create your account and join the NO PERIPHERALS collective.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
