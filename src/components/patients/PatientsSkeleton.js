const PatientsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-52 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-72 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>

      <div className="h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
      <div className="h-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
    </div>
  );
};

export default PatientsSkeleton;
