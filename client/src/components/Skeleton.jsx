export const SkeletonCard = ({ className = "" }) => (
  <div className={`panel p-5 ${className}`.trim()}>
    <div className="shimmer h-4 w-24 rounded-full" />
    <div className="mt-4 shimmer h-9 w-32 rounded-2xl" />
    <div className="mt-3 shimmer h-3 w-40 rounded-full" />
  </div>
);

export const SkeletonRow = ({ className = "" }) => (
  <div className={`flex items-center gap-4 rounded-[24px] border border-slate-100 bg-white p-4 ${className}`.trim()}>
    <div className="shimmer h-11 w-11 rounded-full" />
    <div className="min-w-0 flex-1 space-y-3">
      <div className="shimmer h-4 w-40 rounded-full" />
      <div className="shimmer h-3 w-56 rounded-full" />
    </div>
    <div className="shimmer h-9 w-24 rounded-2xl" />
  </div>
);
