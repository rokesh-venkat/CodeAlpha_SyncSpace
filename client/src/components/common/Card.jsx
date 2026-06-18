export function Card({ children, className = "", hover = false, onClick, glass = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border border-border p-5
        ${glass
          ? "bg-white/5 backdrop-blur-md"
          : "bg-surface-1"}
        ${hover
          ? "hover:border-violet-500/40 hover:bg-surface-2 transition-all duration-200 cursor-pointer"
          : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, delta, icon, color = "violet" }) {
  const colorMap = {
    violet: "bg-violet-500/10 text-violet-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    sky: "bg-sky-500/10 text-sky-400",
    amber: "bg-amber-500/10 text-amber-400",
  };
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-text-primary tabular-nums">{value}</p>
        <p className="text-xs text-text-muted truncate">{label}</p>
        {delta !== undefined && (
          <p className={`text-xs mt-0.5 ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}% this week
          </p>
        )}
      </div>
    </Card>
  );
}