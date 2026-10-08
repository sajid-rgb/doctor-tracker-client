const Footer = ({ className = '' }) => {
  const currentYear = 2026;

  return (
    <footer
      className={`border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 sm:px-6 lg:px-8 2xl:px-10 text-xs text-slate-500 transition-colors ${className}`}
    >
      <div className="max-w-[1680px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
          <span>&copy; {currentYear} Doctor Tracker</span>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Doctors Network
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
