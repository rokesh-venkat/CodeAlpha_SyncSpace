const variants = {
  primary:
    "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30",
  secondary:
    "bg-surface-2 hover:bg-surface-3 text-text-primary border border-border",
  danger: "bg-red-600/90 hover:bg-red-500 text-white shadow-lg shadow-red-900/30",
  ghost: "hover:bg-surface-2 text-text-secondary hover:text-text-primary",
  success:
    "bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
  icon: "p-2",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon,
  iconRight,
  onClick,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl
        transition-all duration-200 active:scale-95 select-none
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}