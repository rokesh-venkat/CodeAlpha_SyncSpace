export function Loader({ size = "md", label }) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizeMap[size]} rounded-full
          border-violet-500/20 border-t-violet-500
          animate-spin
        `}
      />
      {label && <p className="text-xs text-text-muted animate-pulse">{label}</p>}
    </div>
  );
}

export function PageLoader({ label = "Loading SyncSpace..." }) {
  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center gap-6 z-50">
      {/* Logo mark */}
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M7 8h14M7 14h10M7 20h6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="21" cy="20" r="4" fill="white" fillOpacity="0.9" />
          </svg>
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-violet-500/30 animate-ping" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="font-semibold text-text-primary">SyncSpace</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

export function SkeletonLine({ width = "w-full", height = "h-3" }) {
  return (
    <div className={`${width} ${height} rounded-full bg-surface-2 animate-pulse`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-5 space-y-3">
      <SkeletonLine width="w-1/3" height="h-4" />
      <SkeletonLine width="w-full" />
      <SkeletonLine width="w-5/6" />
    </div>
  );
}