import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../contexts/AuthContext";

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    const name = form.name.trim();

    if (!name) nextErrors.name = "Enter your name.";
    else if (name.length < 2) nextErrors.name = "Name must be at least 2 characters.";
    else if (name.length > 80) nextErrors.name = "Name is too long.";

    if (form.password && form.password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (form.password && form.password.length > 128) nextErrors.password = "Password is too long.";

    if (form.password && !form.confirmPassword) nextErrors.confirmPassword = "Confirm your new password.";
    if (form.password && form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!validate()) return;

    const payload = {};
    if (form.name.trim() && form.name.trim() !== user?.name) payload.name = form.name.trim();
    if (form.password) payload.password = form.password;

    if (!payload.name && !payload.password) {
      setError("No changes to save.");
      return;
    }

    setSubmitting(true);
    const ok = await updateProfile(payload);
    setSubmitting(false);

    if (ok) {
      setErrors({});
      setForm((current) => ({
        ...current,
        password: "",
        confirmPassword: "",
        name: payload.name || current.name
      }));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card glow className="p-6">
        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Profile</div>
        <h1 className="mt-2 display-font text-4xl font-semibold text-ink">Your account details</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Update your name or password here. Email is read-only and cannot be changed from this page.
        </p>
      </Card>

      <form className="panel space-y-6 p-6" onSubmit={submit}>
        <div>
          <label className="label">Name</label>
          <input
            className={`field ${errors.name ? "field-error" : ""}`}
            value={form.name}
            onChange={(event) => {
              setForm({ ...form, name: event.target.value });
              setErrors((current) => ({ ...current, name: undefined }));
              setError("");
            }}
            placeholder="Your full name"
          />
          {errors.name ? <p className="helper text-danger-700">{errors.name}</p> : null}
        </div>

        <div>
          <label className="label">Email</label>
          <input className="field bg-slate-50 text-slate-500" value={form.email} disabled readOnly />
          <p className="helper">Email is locked for now.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">New password</label>
            <input
              className={`field ${errors.password ? "field-error" : ""}`}
              type="password"
              value={form.password}
              onChange={(event) => {
                setForm({ ...form, password: event.target.value });
                setErrors((current) => ({ ...current, password: undefined }));
                setError("");
              }}
              placeholder="Leave blank to keep current"
            />
            {errors.password ? <p className="helper text-danger-700">{errors.password}</p> : null}
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              className={`field ${errors.confirmPassword ? "field-error" : ""}`}
              type="password"
              value={form.confirmPassword}
              onChange={(event) => {
                setForm({ ...form, confirmPassword: event.target.value });
                setErrors((current) => ({ ...current, confirmPassword: undefined }));
                setError("");
              }}
              placeholder="Repeat new password"
            />
            {errors.confirmPassword ? <p className="helper text-danger-700">{errors.confirmPassword}</p> : null}
          </div>
        </div>

        {error ? <p className="text-sm font-semibold text-danger-700">{error}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};
