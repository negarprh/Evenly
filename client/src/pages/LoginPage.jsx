import { useState } from "react";
import { ArrowRight, Check, Receipt, ArrowUpRight } from "lucide-react";
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
      title="Sign in"
      subtitle="Welcome back to Evenly."
      asideTitle="Shared expenses. Clear balances."
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
  <div className="auth-page">
    <div className="auth-frame">
      <section className="auth-story">
        <LogoMark />
        <div className="auth-intro">
          <span className="eyebrow">A little more in balance</span>
          <h1>{asideTitle}</h1>
          <p>Track group spending and see who owes whom.</p>
        </div>
        <div className="auth-demo" aria-label="Example of a shared expense split">
          <div className="demo-heading"><span className="demo-icon"><Receipt size={21} /></span><div><strong>Weekend away</strong><span>Shared with 3 people</span></div><span className="demo-example">Example</span></div>
          <div className="demo-total"><span>Dinner together</span><strong>$126<span>.00</span></strong></div>
          <div className="demo-people">
            {[{ initials: "SC", name: "Sarah", color: "#315b68" }, { initials: "AK", name: "Ali", color: "#856146" }, { initials: "PS", name: "Priya", color: "#6b657f" }].map(person => (
              <div key={person.name}><span className="demo-avatar" style={{ background: person.color }}>{person.initials}</span><span>{person.name}</span><strong>$42.00</strong></div>
            ))}
          </div>
          <div className="demo-footer"><span><Check size={15} /> Split equally</span><span>3 of 3 included</span></div>
        </div>
        <div className="auth-note"><span className="note-icon"><ArrowUpRight size={18} /></span><span>Less math.<br /><strong>More time together.</strong></span></div>
        <div className="auth-story-footer"><span>Roommates · Trips · Everyday life</span><span>Evenly</span></div>
      </section>
      <section className="auth-form-side">
        <div className="auth-mobile-logo"><LogoMark /></div>
        <div className="auth-form-content">
          <span className="eyebrow">YOUR SHARED EXPENSES, SORTED</span>
          <h2>{title}</h2>
          <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <p className="auth-footnote">Evenly / Shared expense tracker</p>
      </section>
    </div>
  </div>
);

export { AuthShell };
