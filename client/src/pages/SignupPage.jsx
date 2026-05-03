import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { AuthShell } from "./LoginPage";

export const SignupPage = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const nextErrors = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) nextErrors.name = "Enter your name.";
    else if (name.length < 2) nextErrors.name = "Name must be at least 2 characters.";
    else if (name.length > 80) nextErrors.name = "Name is too long.";

    if (!email) nextErrors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    else if (email.length > 120) nextErrors.email = "Email is too long.";

    if (!form.password) nextErrors.password = "Create a password.";
    else if (form.password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    else if (form.password.length > 128) nextErrors.password = "Password is too long.";

    if (!form.confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";

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
    const ok = await signup({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password
    });
    setSubmitting(false);
    if (ok) navigate("/dashboard");
    else setFormError("Sign up failed. Please review your details and try again.");
  };

  return (
    <AuthShell
      title="Create your Evenly account"
      subtitle="Get into your dashboard quickly so other people can add you to shared groups."
      asideTitle="Shared expenses work better when joining is simple."
    >
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label className="label">Name</label>
          <input
            className={`field ${errors.name ? "field-error" : ""}`}
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Jordan Lee"
            autoComplete="name"
          />
          {errors.name ? <p className="helper text-danger-700">{errors.name}</p> : null}
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className={`field ${errors.email ? "field-error" : ""}`}
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="jordan@example.com"
            autoComplete="email"
          />
          {errors.email ? <p className="helper text-danger-700">{errors.email}</p> : null}
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className={`field ${errors.password ? "field-error" : ""}`}
            type="password"
            minLength={6}
            value={form.password}
            onChange={(event) => onChange("password", event.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
          {errors.password ? <p className="helper text-danger-700">{errors.password}</p> : null}
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input
            className={`field ${errors.confirmPassword ? "field-error" : ""}`}
            type="password"
            value={form.confirmPassword}
            onChange={(event) => onChange("confirmPassword", event.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
          />
          {errors.confirmPassword ? <p className="helper text-danger-700">{errors.confirmPassword}</p> : null}
        </div>
        {formError ? <p className="text-sm font-semibold text-danger-700">{formError}</p> : null}
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
          {!submitting ? <ArrowRight size={16} /> : null}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="font-semibold text-amber-700" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};
