import { useEffect, useMemo, useState } from "react";
import { Check, Equal, PencilLine, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { expensesApi, groupsApi } from "../api/endpoints";
import { apiErrorMessage, apiFieldErrors } from "../api/client";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { MoneyAmount } from "../components/MoneyAmount";
import { SkeletonCard } from "../components/Skeleton";
import { money } from "../utils/format";

export const ExpenseFormPage = ({ mode = "create" }) => {
  const { id, expenseId } = useParams();
  const groupId = id;
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: "",
    amount: "",
    paidBy: "",
    splitType: "equal",
    participants: [],
    splits: {},
    notes: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        const expensePromise = mode === "edit" ? expensesApi.get(expenseId) : null;
        const groupResponse =
          mode === "edit"
            ? await expensePromise.then(({ data }) =>
                groupsApi.get(data.data.group).then((groupRes) => ({ expense: data.data, group: groupRes.data.data }))
              )
            : await groupsApi.get(groupId).then(({ data }) => ({ group: data.data }));

        const nextGroup = groupResponse.group;
        setGroup(nextGroup);

        if (mode === "edit") {
          const expense = groupResponse.expense;
          setForm({
            title: expense.title,
            amount: String(expense.amount),
            paidBy: expense.paidBy._id,
            splitType: expense.splitType,
            participants: expense.participants.map((user) => user._id),
            splits: Object.fromEntries(expense.splits.map((split) => [split.user._id, String(split.amount)])),
            notes: expense.notes || ""
          });
        } else {
          setForm((current) => ({
            ...current,
            paidBy: nextGroup.members[0]?._id || "",
            participants: nextGroup.members.map((member) => member._id)
          }));
        }

        setLoadError("");
      } catch (error) {
        setLoadError(apiErrorMessage(error));
      }
      setLoading(false);
    };

    load();
  }, [groupId, expenseId, mode]);

  const equalPreview = useMemo(() => {
    const cents = Math.round(Number(form.amount || 0) * 100);
    if (!cents || form.participants.length === 0) return [];
    const base = Math.floor(cents / form.participants.length);
    const remainder = cents % form.participants.length;

    return form.participants.map((participant, index) => ({
      userId: participant,
      amount: (base + (index < remainder ? 1 : 0)) / 100
    }));
  }, [form.amount, form.participants]);

  const customAssigned = useMemo(
    () => form.participants.reduce((sum, userId) => sum + Number(form.splits[userId] || 0), 0),
    [form.participants, form.splits]
  );

  const customMatches = Number(customAssigned.toFixed(2)) === Number(Number(form.amount || 0).toFixed(2));

  const toggleParticipant = (memberId) => {
    setForm((current) => {
      const exists = current.participants.includes(memberId);
      return {
        ...current,
        participants: exists ? current.participants.filter((id) => id !== memberId) : [...current.participants, memberId]
      };
    });
  };

  const validate = () => {
    const nextErrors = {};
    const title = form.title.trim();
    const notes = form.notes.trim();
    const amount = Number(form.amount);

    if (!title) nextErrors.title = "Add a short title so everyone knows what this was for.";
    else if (title.length > 120) nextErrors.title = "Title must be 120 characters or less.";

    if (!Number.isFinite(amount) || amount <= 0) nextErrors.amount = "Enter the total amount paid.";
    else if (amount > 1000000) nextErrors.amount = "Amount is too large.";

    if (!form.paidBy) nextErrors.paidBy = "Choose who paid for this expense.";
    if (form.participants.length === 0) nextErrors.participants = "Select at least one person involved in the expense.";
    if (notes.length > 500) nextErrors.notes = "Notes must be 500 characters or less.";

    if (form.splitType === "custom") {
      for (const participantId of form.participants) {
        const value = Number(form.splits[participantId] || 0);
        if (!Number.isFinite(value) || value < 0) {
          nextErrors.splits = "Every custom share must be a valid positive amount.";
          break;
        }
      }
    }

    if (form.splitType === "custom" && !customMatches) {
      nextErrors.splits = "Custom shares must add up to the full expense amount.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      paidBy: form.paidBy,
      splitType: form.splitType,
      participants: form.participants,
      splits:
        form.splitType === "custom"
          ? form.participants.map((user) => ({ user, amount: Number(form.splits[user] || 0) }))
          : [],
      notes: form.notes.trim()
    };

    try {
      const response = mode === "edit" ? await expensesApi.update(expenseId, payload) : await expensesApi.create(groupId, payload);
      const destinationGroup = mode === "edit" ? response.data.data.group : groupId;
      toast.success(mode === "edit" ? "Expense updated" : "Expense added");
      navigate(`/groups/${destinationGroup}`);
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

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <SkeletonCard className="h-[160px]" />
        <SkeletonCard className="h-[520px]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl">
        <Card className="p-6">
          <h1 className="section-title">Could not load expense details</h1>
          <p className="mt-2 text-sm text-slate-500">{loadError}</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card glow className="p-6">
        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
          {mode === "edit" ? "Update expense" : "New expense"}
        </div>
        <h1 className="mt-2 display-font text-4xl font-semibold text-ink">
          {mode === "edit" ? "Edit this expense" : "Add what you paid"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {group.name} · Keep the details clear so everyone understands the charge, the people involved, and how it should be split.
        </p>
      </Card>

      <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" onSubmit={submit}>
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <PencilLine size={18} />
              </span>
              <div>
                <h2 className="section-title">1. What was paid?</h2>
                <p className="section-copy">Add the title, amount, and who covered it.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Title</label>
                <input
                  className={`field ${errors.title ? "field-error" : ""}`.trim()}
                  value={form.title}
                  onChange={(event) => {
                    setForm({ ...form, title: event.target.value });
                    setErrors((current) => ({ ...current, title: undefined }));
                  }}
                  placeholder="Groceries"
                />
                {errors.title ? <p className="helper text-danger-700">{errors.title}</p> : null}
              </div>
              <div>
                <label className="label">Amount</label>
                <input
                  className={`field ${errors.amount ? "field-error" : ""}`.trim()}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => {
                    setForm({ ...form, amount: event.target.value });
                    setErrors((current) => ({ ...current, amount: undefined, splits: undefined }));
                  }}
                  placeholder="84.00"
                />
                {errors.amount ? <p className="helper text-danger-700">{errors.amount}</p> : null}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Paid by</label>
                <select
                  className={`field ${errors.paidBy ? "field-error" : ""}`.trim()}
                  value={form.paidBy}
                  onChange={(event) => {
                    setForm({ ...form, paidBy: event.target.value });
                    setErrors((current) => ({ ...current, paidBy: undefined }));
                  }}
                >
                  {group.members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {errors.paidBy ? <p className="helper text-danger-700">{errors.paidBy}</p> : null}
              </div>

              <div>
                <label className="label">Notes</label>
                <input
                  className={`field ${errors.notes ? "field-error" : ""}`.trim()}
                  value={form.notes}
                  onChange={(event) => {
                    setForm({ ...form, notes: event.target.value });
                    setErrors((current) => ({ ...current, notes: undefined }));
                  }}
                  placeholder="Optional details or context"
                />
                {errors.notes ? <p className="helper text-danger-700">{errors.notes}</p> : null}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warm-100 text-warm-700">
                <Users size={18} />
              </span>
              <div>
                <h2 className="section-title">2. Who was involved?</h2>
                <p className="section-copy">Select the people who should share this expense.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => setForm({ ...form, participants: group.members.map((member) => member._id) })}>
                Select everyone
              </Button>
              <Button type="button" variant="secondary" onClick={() => setForm({ ...form, participants: [] })}>
                Clear selection
              </Button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {group.members.map((member) => {
                const selected = form.participants.includes(member._id);
                return (
                  <button
                    type="button"
                    key={member._id}
                    onClick={() => toggleParticipant(member._id)}
                    className={`flex items-center justify-between rounded-[22px] border p-4 text-left transition ${
                      selected ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar user={member} size="sm" />
                      <div>
                        <div className="font-semibold text-ink">{member.name}</div>
                        <div className="text-sm text-slate-500">{member.email}</div>
                      </div>
                    </div>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        selected ? "bg-amber-500 text-amber-950" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Check size={16} />
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.participants ? <p className="helper text-danger-700">{errors.participants}</p> : null}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-info-50 text-info-700">
                <Equal size={18} />
              </span>
              <div>
                <h2 className="section-title">3. How should it be split?</h2>
                <p className="section-copy">Choose equal shares or assign custom amounts.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-[24px] bg-slate-100 p-1">
              {[
                { id: "equal", label: "Split equally" },
                { id: "custom", label: "Custom amounts" }
              ].map((type) => (
                <button
                  type="button"
                  key={type.id}
                  className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                    form.splitType === type.id ? "bg-white text-ink shadow-sm" : "text-slate-500"
                  }`}
                  onClick={() => setForm({ ...form, splitType: type.id })}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {form.splitType === "custom" ? (
              <div className="mt-5 space-y-3">
                {form.participants.map((participantId) => {
                  const member = group.members.find((item) => item._id === participantId);
                  return (
                    <div key={participantId} className="grid grid-cols-[1fr_140px] items-center gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={member} size="xs" />
                        <span className="text-sm font-semibold text-ink">{member?.name}</span>
                      </div>
                      <input
                        className={`field ${errors.splits ? "field-error" : ""}`.trim()}
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.splits[participantId] || ""}
                        onChange={(event) =>
                          setForm({ ...form, splits: { ...form.splits, [participantId]: event.target.value } })
                        }
                      />
                    </div>
                  );
                })}
                <div className="rounded-[22px] bg-slate-50 p-4 text-sm">
                  <div className="font-semibold text-ink">
                    Assigned: <MoneyAmount amount={customAssigned} />
                  </div>
                  <div className="mt-1 text-slate-500">Total: {money(form.amount || 0)}</div>
                  {errors.splits ? <div className="mt-2 text-danger-700">{errors.splits}</div> : null}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] bg-amber-50/80 p-4">
                <div className="font-semibold text-ink">
                  {equalPreview.length > 0
                    ? `Each person pays ${money((Number(form.amount || 0) / equalPreview.length) || 0)}`
                    : "Each person pays $0.00"}
                </div>
                <div className="mt-3 grid gap-2">
                  {equalPreview.map((split) => {
                    const member = group.members.find((item) => item._id === split.userId);
                    return (
                      <div key={split.userId} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{member?.name}</span>
                        <MoneyAmount amount={split.amount} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="section-title">Preview</h2>
            <p className="section-copy">A quick check before you save.</p>
            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-slate-500">Expense</div>
                <div className="mt-1 display-font text-2xl font-semibold text-ink">{form.title || "Untitled expense"}</div>
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-slate-500">Total amount</div>
                <div className="mt-1 display-font text-2xl font-semibold text-ink">{money(form.amount || 0)}</div>
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-slate-500">People involved</div>
                <div className="mt-1 font-semibold text-ink">{form.participants.length} selected</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save expense"}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
