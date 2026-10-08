import { Suspense } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account | Doctor Tracker',
  description: 'Register as a doctor or clinical administrator on the Doctor Tracker healthcare network.',
};

const RegisterPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
};

export default RegisterPage;
