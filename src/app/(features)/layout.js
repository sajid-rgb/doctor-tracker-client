import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: {
    template: '%s | Doctor Tracker',
    default: 'Doctor Tracker Portal',
  },
  description: 'Clinical management dashboard for doctors and patients',
};

const ProtectedLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 py-5 sm:py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ProtectedLayout;
