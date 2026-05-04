import { CheckCircle2, Pencil, ReceiptText, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "./Avatar";
import { AvatarStack } from "./AvatarStack";
import { Button } from "./Button";
import { Card } from "./Card";
import { MoneyAmount } from "./MoneyAmount";
import { SplitTypeBadge } from "./SplitTypeBadge";
import { StatusBadge } from "./StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { calendarDate, timeAgo, userName } from "../utils/format";

const canSettleExpense = (expense, userId) => {
  if (!userId || expense.isSettled) return false;
  const payerId = String(expense.paidBy?._id || expense.paidBy || "");
  if (payerId === String(userId)) return false;
  return (expense.splits || []).some((split) => String(split.user?._id || split.user) === String(userId) && Number(split.amount) > 0);
};

export const ExpenseList = ({ groupId, expenses, onSettle, onDelete }) => {
  const { user } = useAuth();

  return (
    <Card className="p-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="section-title">Expense timeline</h2>
      </div>
      <Link to={`/groups/${groupId}/expenses/new`}>
        <Button>Add what you paid</Button>
      </Link>
    </div>

    <div className="mt-6 space-y-4">
      {expenses.map((expense) => (
        <article key={expense._id} className="rounded-[26px] border border-slate-100 bg-slate-50/65 p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="display-font text-xl font-semibold text-ink">{expense.title}</h3>
                <StatusBadge settled={expense.isSettled} />
                <SplitTypeBadge splitType={expense.splitType} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Avatar user={expense.paidBy} size="xs" />
                  Paid by {userName(expense.paidBy)}
                </span>
                <span>{calendarDate(expense.createdAt)}</span>
                <span>{timeAgo(expense.createdAt)}</span>
              </div>
              {expense.notes ? <p className="mt-3 text-sm leading-6 text-slate-500">{expense.notes}</p> : null}
            </div>

            <div className="text-left xl:text-right">
              <MoneyAmount amount={expense.amount} className="display-font text-3xl font-semibold" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="rounded-2xl bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <Users size={14} />
                  Participants
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <AvatarStack users={expense.participants} max={5} size="xs" />
                  <span className="text-sm font-semibold text-ink">{expense.participants.length} involved</span>
                </div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <ReceiptText size={14} />
                  Split rule
                </div>
                <div className="mt-2 text-sm font-semibold text-ink">
                  {expense.splitType === "custom" ? "Custom shares were assigned." : "Evenly split across everyone selected."}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {canSettleExpense(expense, user?._id) ? (
                <Button variant="secondary" onClick={() => onSettle(expense)}>
                  <CheckCircle2 size={16} />
                  Mark as settled
                </Button>
              ) : null}
              <Link to={`/expenses/${expense._id}/edit`}>
                <Button variant="secondary">
                  <Pencil size={16} />
                  Edit
                </Button>
              </Link>
              <Button variant="danger" onClick={() => onDelete(expense)}>
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
    </Card>
  );
};
