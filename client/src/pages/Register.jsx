import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Wifi, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading, error, clearError } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (error) clearError();
  }, [form.name, form.email, form.password]);

  // ── Password strength indicator ─────────────────────────────────────
  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 6) return { level: 1, label: "Too short", color: "bg-red-500" };
    if (password.length < 8) return { level: 2, label: "Weak", color: "bg-orange-500" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 4, label: "Strong", color: "bg-emerald-500" };
    }
    return { level: 3, label: "Fair", color: "bg-amber-500" };
  };

  const strength = getPasswordStrength(form.password);

  // ── Validation ──────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    else if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email address";
    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  // ── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    setSubmitting(false);

    if (result.success) {
      navigate("/", { replace: true });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const inputClass = (field) => `
    w-full px-3.5 py-2.5 rounded-xl text-sm bg-surface-1 border
    text-text-primary placeholder:text-text-muted
    focus:outline-none transition-colors
    ${fieldErrors[field]
      ? "border-red-500/60 focus:border-red-500"
      : "border-border focus:border-violet-500/60"}
  `;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600 mb-4">
            <Wifi size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
          <p className="text-text-muted text-sm mt-1">Join SyncSpace — it's free</p>
        </div>

        {/* Global error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Full name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Rokesh Venkat"
              autoComplete="name"
              className={inputClass("name")}
            />
            {fieldErrors.name && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

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
              className={inputClass("email")}
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className={inputClass("password") + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {/* Password strength bar */}
            {strength && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strength.level ? strength.color : "bg-surface-3"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-muted">{strength.label}</p>
              </div>
            )}
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={inputClass("confirmPassword") + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              {/* Match indicator */}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <CheckCircle size={15} className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-400" />
              )}
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms note */}
          <p className="text-xs text-text-muted">
            By creating an account you agree to our{" "}
            <span className="text-violet-400 cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-violet-400 cursor-pointer">Privacy Policy</span>.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="
              w-full flex items-center justify-center gap-2
              py-2.5 rounded-xl font-medium text-sm text-white
              bg-violet-600 hover:bg-violet-500 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
              transition-all
            "
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}