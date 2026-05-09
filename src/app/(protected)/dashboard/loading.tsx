export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-surface-800 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-24 bg-surface-800 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-surface-800 rounded-lg animate-pulse"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card p-6 h-64 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-surface-800 animate-pulse"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-20 bg-surface-800 rounded-full animate-pulse"></div>
              <div className="h-5 w-5 bg-surface-800 rounded-full animate-pulse"></div>
            </div>

            <div className="h-6 w-3/4 bg-surface-800 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-full bg-surface-800 rounded animate-pulse mb-5"></div>

            <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-surface-700/50">
               <div>
                  <div className="h-3 w-16 bg-surface-800 rounded animate-pulse mb-1"></div>
                  <div className="h-6 w-12 bg-surface-800 rounded animate-pulse"></div>
               </div>
               <div>
                  <div className="h-3 w-20 bg-surface-800 rounded animate-pulse mb-1"></div>
                  <div className="h-6 w-12 bg-surface-800 rounded animate-pulse"></div>
               </div>
            </div>

            <div className="h-1.5 w-full bg-surface-800 rounded-full animate-pulse mt-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
