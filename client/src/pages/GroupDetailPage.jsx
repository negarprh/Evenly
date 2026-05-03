import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MailPlus, Plus, UsersRound } from "lucide-react";
import toast from "react-hot-toast";
import { expensesApi, groupsApi } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import { Avatar } from "../components/Avatar";
import { AvatarStack } from "../components/AvatarStack";
import { BalanceBoard } from "../components/BalanceBoard";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ConfirmModal } from "../components/ConfirmModal";
import { EmptyState } from "../components/EmptyState";
import { ExpenseList } from "../components/ExpenseList";
import { SkeletonCard, SkeletonRow } from "../components/Skeleton";
import { useSocket } from "../hooks/useSocket";
import { calendarDate, sumBy, timeAgo } from "../utils/format";

const socketMessage = (action, expenseTitle, groupName) => {
  if (action === "created") return expenseTitle ? `${expenseTitle} was added in ${groupName}` : `New expense added in ${groupName}`;
  if (action === "updated") return expenseTitle ? `${expenseTitle} was updated in ${groupName}` : `Expense updated in ${groupName}`;
  if (action === "settled") return expenseTitle ? `${expenseTitle} was marked as settled` : "Balances updated";
  if (action === "deleted") return expenseTitle ? `${expenseTitle} was removed from ${groupName}` : `Expense removed from ${groupName}`;
  return "Balances updated";
};

export const GroupDetailPage = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [modalState, setModalState] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [memberError, setMemberError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        groupsApi.get(id),
        expensesApi.list(id),
        groupsApi.balances(id)
      ]);
      setGroup(groupRes.data.data);
      setExpenses(expenseRes.data.data);
      setBalances(balanceRes.data.data);
      setPageError("");
    } catch (error) {
      setPageError(apiErrorMessage(error));
      throw error;
    }
  }, [id]);

  useEffect(() => {
    refresh()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [refresh]);

  const onExpenseUpdated = useCallback(
    (payload) => {
      refresh().catch(() => undefined);
      toast.success(socketMessage(payload?.action, payload?.expense?.title, group?.name || "this group"));
    },
    [group?.name, refresh]
  );

  const onBalancesUpdated = useCallback((payload) => {
    if (payload?.balances) setBalances(payload.balances);
  }, []);

  useSocket(id, { onExpenseUpdated, onBalancesUpdated });

  const totalSpent = useMemo(() => sumBy(expenses, (expense) => expense.amount), [expenses]);

  const addMember = async (event) => {
    event.preventDefault();
    const email = memberEmail.trim().toLowerCase();

    if (!email) {
      setMemberError("Enter an email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMemberError("Enter a valid email address.");
      return;
    }

    try {
      const { data } = await groupsApi.updateMembers(id, { email });
      setGroup(data.data);
      setMemberEmail("");
      setMemberError("");
      toast.success("Member added");
    } catch (error) {
      setMemberError(apiErrorMessage(error));
      toast.error(apiErrorMessage(error));
    }
  };

  const requestSettle = (expense) => {
    setModalState({
      type: "settle",
      expense,
      title: "Mark this expense as settled?",
      description: "This keeps the expense in history, but removes it from open balances.",
      confirmLabel: "Yes, mark settled"
    });
  };

  const requestDelete = (expense) => {
    setModalState({
      type: "delete",
      expense,
      title: "Delete this expense?",
      description: "This removes it from the group history and recalculates balances right away.",
      confirmLabel: "Delete expense"
    });
  };

  const confirmAction = async () => {
    if (!modalState?.expense) return;

    setActionBusy(true);

    try {
      if (modalState.type === "settle") {
        await expensesApi.settle(modalState.expense._id);
        toast.success("Marked as settled");
      }

      if (modalState.type === "delete") {
        await expensesApi.remove(modalState.expense._id);
        toast.success("Expense deleted");
      }

      await refresh();
      setModalState(null);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Card glow className="p-6">
          <div className="shimmer h-12 w-72 rounded-3xl" />
          <div className="mt-3 shimmer h-4 w-[32rem] rounded-full" />
          <div className="mt-5 shimmer h-10 w-40 rounded-2xl" />
        </Card>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <SkeletonCard className="h-[320px]" />
          <SkeletonCard className="h-[320px]" />
        </div>
        <SkeletonRow className="h-[220px] items-start" />
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="shimmer h-16 rounded-[22px]" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="page-shell">
        <Card className="p-6">
          <h1 className="section-title">Could not load this group</h1>
          <p className="mt-2 text-sm text-slate-500">{pageError}</p>
          <Button className="mt-4" onClick={() => refresh().catch(() => undefined)}>
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Card glow className="p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Group detail</div>
            <h1 className="mt-2 display-font text-4xl font-semibold text-ink">{group.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {group.description || "Track what happened in this group, who paid, and how the balance should settle out."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2">
                <UsersRound size={16} />
                Shared with {group.members.length} people
              </span>
              <AvatarStack users={group.members} max={6} size="sm" />
            </div>
          </div>

          <Link to={`/groups/${id}/expenses/new`}>
            <Button>
              <Plus size={16} />
              Add what you paid
            </Button>
          </Link>
        </div>
      </Card>

      <BalanceBoard balances={balances} totalSpent={totalSpent} />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="section-title">People in this group</h2>
              <p className="section-copy">Everyone involved in this shared space.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
              {group.members.length} total
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {group.members.map((member) => (
              <div key={member._id} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-ink">
                <div className="flex items-center gap-3">
                  <Avatar user={member} size="sm" />
                  <span>{member.name}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <form className="panel p-6" onSubmit={addMember}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <MailPlus size={18} />
            </span>
            <div>
              <h2 className="section-title">Add someone by email</h2>
              <p className="section-copy">Invite an existing Evenly user into this shared group.</p>
            </div>
          </div>

          <div className="mt-5">
            <label className="label">Email address</label>
            <input
              className={`field ${memberError ? "field-error" : ""}`}
              value={memberEmail}
              onChange={(event) => {
                setMemberEmail(event.target.value);
                setMemberError("");
              }}
              placeholder="priya@evenly.dev"
            />
            <p className="helper">Try the seeded demo accounts like `ali@evenly.dev`, `priya@evenly.dev`, or `sarah@evenly.dev`.</p>
            {memberError ? <p className="helper text-danger-700">{memberError}</p> : null}
          </div>

          <Button className="mt-5" type="submit">
            Add to group
          </Button>
        </form>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          action={
            <Link to={`/groups/${id}/expenses/new`}>
              <Button>Add what you paid</Button>
            </Link>
          }
        >
          When someone pays for something, add it here and Evenly will calculate who owes what.
        </EmptyState>
      ) : (
        <ExpenseList groupId={id} expenses={expenses} onSettle={requestSettle} onDelete={requestDelete} />
      )}

      <Card className="p-6">
        <h2 className="section-title">Activity feed</h2>
        <p className="section-copy">Human-readable updates so the group always feels current.</p>

        {(group.activities || []).length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No activity yet">Updates will appear here when expenses are added or settled.</EmptyState>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {group.activities.map((activity) => (
              <div key={activity._id} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-ink">{activity.message}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {activity.amount ? `${activity.expenseTitle || "Expense"} · $${activity.amount.toFixed(2)}` : "Group update"}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    <div>{calendarDate(activity.createdAt)}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{timeAgo(activity.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmModal
        open={Boolean(modalState)}
        title={modalState?.title}
        description={modalState?.description}
        confirmLabel={modalState?.confirmLabel}
        onCancel={() => setModalState(null)}
        onConfirm={confirmAction}
        busy={actionBusy}
      />
    </div>
  );
};
