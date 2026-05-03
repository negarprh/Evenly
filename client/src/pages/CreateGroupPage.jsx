import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { groupsApi } from "../api/endpoints";
import { apiErrorMessage, apiFieldErrors } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) nextErrors.name = "Enter a group name.";
    else if (name.length < 2) nextErrors.name = "Group name must be at least 2 characters.";
    else if (name.length > 80) nextErrors.name = "Group name is too long.";

    if (description.length > 300) nextErrors.description = "Description must be 300 characters or less.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const { data } = await groupsApi.create({
        name: form.name.trim(),
        description: form.description.trim()
      });
      toast.success("Group created");
      navigate(`/groups/${data.data._id}`);
    } catch (error) {
      const serverFieldErrors = apiFieldErrors(error);
      if (Object.keys(serverFieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...serverFieldErrors }));
      }
      toast.error(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card glow className="p-6">
        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">New shared group</div>
        <h1 className="mt-2 display-font text-4xl font-semibold text-ink">Start a shared group</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Create a clear space for roommates, a trip, or any ongoing shared cost so everyone sees the same picture.
        </p>
      </Card>

      <form className="panel space-y-6 p-6" onSubmit={submit}>
        <div>
          <label className="label">Group name</label>
          <input
            className={`field ${errors.name ? "field-error" : ""}`}
            value={form.name}
            onChange={(event) => {
              setForm({ ...form, name: event.target.value });
              setErrors((current) => ({ ...current, name: undefined }));
            }}
            placeholder="Apartment 4B"
          />
          <p className={`helper ${errors.name ? "text-danger-700" : ""}`}>{errors.name || "Pick a name people will recognize immediately."}</p>
        </div>

        <div>
          <label className="label">Short description</label>
          <textarea
            className={`field min-h-28 ${errors.description ? "field-error" : ""}`}
            value={form.description}
            onChange={(event) => {
              setForm({ ...form, description: event.target.value });
              setErrors((current) => ({ ...current, description: undefined }));
            }}
            placeholder="Shared rent-adjacent costs, groceries, and household basics."
          />
          {errors.description ? <p className="helper text-danger-700">{errors.description}</p> : null}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate("/groups")}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Start group"}
          </Button>
        </div>
      </form>
    </div>
  );
};
