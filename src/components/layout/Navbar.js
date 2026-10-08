'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  LogOut,
  Activity,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import { removeTokenCookie } from '@/lib/auth-cookie';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Doctors', href: '/doctors', icon: Stethoscope },
    { name: 'Patients', href: '/patients', icon: Users },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await removeTokenCookie();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="flex h-16 w-full max-w-[1680px] mx-auto items-center justify-between px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            prefetch={false}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Doctor Tracker
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                Clinical Management
              </span>
            </div>
          </Link>

          <nav className="hidden md:ml-8 md:flex md:items-center md:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex md:items-center md:gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 py-1 pl-1 pr-3 dark:border-slate-800 dark:bg-slate-800/70">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
                Staff Portal
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Active Session
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
            title="Sign out from Doctor Tracker"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
          </button>
        </div>

        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-4 dark:border-slate-800 dark:bg-slate-900 md:hidden animate-in slide-in-from-top duration-200 shadow-lg">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Staff Portal
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Active Authenticated Session
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 hover:bg-red-100 py-2.5 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400 cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
