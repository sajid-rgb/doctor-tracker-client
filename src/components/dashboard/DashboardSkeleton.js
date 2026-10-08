const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-slate-200 bg-white p-5 animate-pulse dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 h-[360px] rounded-2xl border border-slate-200 bg-white p-5 animate-pulse dark:border-slate-800 dark:bg-slate-900" />
        <div className="lg:col-span-5 h-[360px] rounded-2xl border border-slate-200 bg-white p-5 animate-pulse dark:border-slate-800 dark:bg-slate-900" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 h-[380px] rounded-2xl border border-slate-200 bg-white p-5 animate-pulse dark:border-slate-800 dark:bg-slate-900" />
        <div className="lg:col-span-5 h-[380px] rounded-2xl border border-slate-200 bg-white p-5 animate-pulse dark:border-slate-800 dark:bg-slate-900" />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
