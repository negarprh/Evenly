import { useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { LogoMark } from "../components/LogoMark";
import { useAuth } from "../contexts/AuthContext";

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const nextErrors = {};
    const email = form.email.trim();

    if (!email) nextErrors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    else if (email.length > 120) nextErrors.email = "Email is too long.";

    if (!form.password) nextErrors.password = "Enter your password.";
    else if (form.password.length > 128) nextErrors.password = "Password is too long.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    const ok = await login({ email: form.email.trim(), password: form.password });
    setSubmitting(false);
    if (ok) navigate("/dashboard");
    else setFormError("Sign in failed. Check your credentials and try again.");
  };

  return (
    <AuthShell
      title="Get back into your shared groups"
      subtitle="Sign in quickly and pick up where the balances left off."
      asideTitle="Money conversations feel easier when everyone sees the same numbers."
    >
      <form className="space-y-3.5" onSubmit={submit}>
        <div>
          <label className="label">Email</label>
          <input
            className={`field ${errors.email ? "field-error" : ""}`}
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email ? <p className="helper text-danger-700">{errors.email}</p> : null}
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className={`field ${errors.password ? "field-error" : ""}`}
            type="password"
            value={form.password}
            onChange={(event) => onChange("password", event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {errors.password ? <p className="helper text-danger-700">{errors.password}</p> : null}
        </div>
        {formError ? <p className="text-sm font-semibold text-danger-700">{formError}</p> : null}
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
          {!submitting ? <ArrowRight size={16} /> : null}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        New to Evenly?{" "}
        <Link className="font-semibold text-amber-700" to="/signup">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
};

const AuthShell = ({ title, subtitle, asideTitle, children }) => (
  <div className="auth-backdrop grid min-h-screen overflow-hidden lg:grid-cols-[minmax(0,1fr)_480px]">
    <section className="hidden border-r border-white/70 px-8 py-8 lg:flex lg:items-center">
      <div className="mx-auto w-full max-w-2xl">
        <LogoMark />
        <h1 className="mt-7 max-w-xl display-font text-4xl font-semibold leading-tight text-ink">{asideTitle}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Evenly helps roommates, couples, and travel groups keep shared spending calm, clear, and easy to settle.
        </p>

        <div className="mt-7 grid gap-3">
          {[
            "Apartment 4B keeps groceries, internet, and supplies in one place.",
            "Trip groups show who paid, who joined, and what still needs settling.",
            "Live updates keep every balance card current without a refresh."
          ].map((item) => (
            <div key={item} className="rounded-[22px] border border-white/70 bg-white/85 p-4 shadow-card">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <CheckCircle2 size={14} />
                </span>
                <p className="text-sm leading-5 text-slate-600">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        <div className="mb-4 lg:hidden">
          <LogoMark />
        </div>
        <div className="panel p-5 md:p-6">
          <div className="flex items-center gap-3 text-amber-700">
            <Sparkles size={18} />
            <span className="text-sm font-semibold uppercase tracking-[0.16em]">Split simply</span>
          </div>
          <h2 className="mt-3 display-font text-2xl font-semibold text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </section>
  </div>
);

export { AuthShell };
