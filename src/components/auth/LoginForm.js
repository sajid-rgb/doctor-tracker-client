'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { setTokenCookie } from '@/lib/auth-cookie';
import { API_BASE_URL } from '@/lib/constants';
import Input from '@/components/ui/Input';

const LoginForm = ({
  callbackUrl = '/dashboard',
  registered = false,
}) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(
    registered ? 'Account created successfully! Please sign in below.' : ''
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsLoading(true);

      let res;
      try {
        res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        });
      } catch (networkErr) {
        throw new Error(
          `Failed to connect to Express server at ${API_BASE_URL}. Please make sure your backend is running.`
        );
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        const errMsg =
          data.message ||
          data.error ||
          (Array.isArray(data.errors) ? data.errors.map((e) => e.msg || e.message).join(', ') : null) ||
          'Login failed. Please verify your credentials.';
        setError(errMsg);
        return;
      }

      const token = data.data?.token || data.token;

      if (!token) {
        setError('Login response did not return an authentication token.');
        return;
      }

      await setTokenCookie(token);

      setSuccess('Login successful! Redirecting to clinical dashboard...');

      setTimeout(() => {
        router.push(callbackUrl || '/dashboard');
      }, 500);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-blue-50/50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs mb-4">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to Doctor Tracker
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to access your doctor &amp; patient clinical portal
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none backdrop-blur-xl">

          {success && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/90 p-3.5 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/90 p-3.5 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">Error: </span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              icon={Mail}
              accent="blue"
            />

            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              icon={Lock}
              accent="blue"
              endAction={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200/80 pt-5 text-center dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
