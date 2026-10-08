const DoctorsSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-64 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse mt-2" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>

      <div className="h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-xl border border-slate-200 bg-white p-5 animate-pulse dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorsSkeleton;
