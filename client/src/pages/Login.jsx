import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Wifi, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error, clearError } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Where to go after login — defaults to dashboard
  const from = location.state?.from?.pathname || "/";

  // If somehow already authenticated, redirect immediately
  useEffect(() => {
    if (!loading && isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, loading, navigate, from]);

  // Clear global auth error when user starts typing
  useEffect(() => {
    if (error) clearError();
  }, [form.email, form.password]);

  // ── Client-side validation ──────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email address";
    if (!form.password) errors.password = "Password is required";
    return errors;
  };

  // ── Form submission ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    const result = await login({
      email: form.email.trim(),
      password: form.password,
    });

    setSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600 mb-4">
            <Wifi size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to your SyncSpace account</p>
        </div>

        {/* Global error alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              className={`
                w-full px-3.5 py-2.5 rounded-xl text-sm bg-surface-1 border
                text-text-primary placeholder:text-text-muted
                focus:outline-none transition-colors
                ${fieldErrors.email
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-border focus:border-violet-500/60"}
              `}
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`
                  w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-surface-1 border
                  text-text-primary placeholder:text-text-muted
                  focus:outline-none transition-colors
                  ${fieldErrors.password
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-border focus:border-violet-500/60"}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="
              w-full flex items-center justify-center gap-2
              py-2.5 rounded-xl font-medium text-sm text-white
              bg-violet-600 hover:bg-violet-500 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
              transition-all mt-2
            "
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-text-muted mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}