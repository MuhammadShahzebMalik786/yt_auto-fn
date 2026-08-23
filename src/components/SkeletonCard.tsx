export default function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="h-48 skeleton-shimmer w-full border-b border-white/5"></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="h-6 w-3/4 skeleton-shimmer rounded-md"></div>
          <div className="h-6 w-16 skeleton-shimmer rounded-full"></div>
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full skeleton-shimmer rounded-md"></div>
          <div className="h-4 w-5/6 skeleton-shimmer rounded-md"></div>
          <div className="h-4 w-4/6 skeleton-shimmer rounded-md"></div>
        </div>
        <div className="h-2 w-full skeleton-shimmer rounded-full"></div>
      </div>
    </div>
  );
}
