import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const generateMetadata = async (props) => {
  const searchParams = props?.searchParams ? await props.searchParams : {};
  const registered = searchParams?.registered === 'true';
  const callbackUrl = searchParams?.callbackUrl || '';

  if (registered) {
    return {
      title: 'Account Registered - Sign In | Doctor Tracker',
      description: 'Your clinical account has been created. Sign in to access Doctor Tracker.',
    };
  }

  if (callbackUrl.includes('/doctors')) {
    return {
      title: 'Sign In to Access Doctors Directory | Doctor Tracker',
      description: 'Authentication required to manage clinicians and hospital affiliations.',
    };
  }

  if (callbackUrl.includes('/patients')) {
    return {
      title: 'Sign In to Access Patients Registry | Doctor Tracker',
      description: 'Authentication required to access registered patient records and history.',
    };
  }

  return {
    title: 'Sign In | Doctor Tracker',
    description: 'Sign in to access your clinical portal, manage clinicians, and track patient records.',
  };
};

const LoginContent = async ({ searchParamsPromise }) => {
  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
  const callbackUrl = searchParams?.callbackUrl || '/dashboard';
  const registered = searchParams?.registered === 'true';

  return <LoginForm callbackUrl={callbackUrl} registered={registered} />;
};

const LoginPage = (props) => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <LoginContent searchParamsPromise={props.searchParams} />
    </Suspense>
  );
};

export default LoginPage;
