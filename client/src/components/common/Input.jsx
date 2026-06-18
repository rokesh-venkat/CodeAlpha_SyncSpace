import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { label, error, hint, icon, iconRight, className = "", containerClassName = "", type = "text", ...props },
  ref
) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-3 py-2.5 rounded-xl text-sm
            bg-surface-2 border border-border
            text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${icon ? "pl-9" : ""}
            ${iconRight ? "pr-9" : ""}
            ${error ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20" : ""}
            ${className}
          `}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
});

export default Input;
