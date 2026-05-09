export default function ProjectLoading() {
  return (
    <div className="p-3 md:p-6 max-w-full mx-auto fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 mb-4">
        {/* Breadcrumbs */}
        <div className="h-4 w-48 bg-surface-800 rounded animate-pulse"></div>

        {/* Title & Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="h-8 w-64 md:w-96 bg-surface-800 rounded animate-pulse mb-1"></div>
            <div className="h-4 w-full max-w-2xl bg-surface-800 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-10 bg-surface-800 rounded-lg animate-pulse"></div>
        </div>

        {/* Metrics */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="h-8 w-56 bg-surface-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-surface-900/50 border border-accent-400/10 w-full overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 bg-surface-800 rounded-lg animate-pulse"></div>
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="min-h-[500px] w-full bg-surface-900/30 rounded-xl border border-surface-800/50 p-6 flex flex-col gap-4">
         <div className="h-8 w-1/4 bg-surface-800 rounded animate-pulse"></div>
         <div className="h-48 w-full bg-surface-800 rounded-lg animate-pulse"></div>
         <div className="h-48 w-full bg-surface-800 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}
