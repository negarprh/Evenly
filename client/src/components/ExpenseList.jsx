import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "./Avatar";
import { AvatarStack } from "./AvatarStack";
import { Button } from "./Button";
import { Card } from "./Card";
import { MoneyAmount } from "./MoneyAmount";
import { SplitTypeBadge } from "./SplitTypeBadge";
import { StatusBadge } from "./StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { calendarDate, userName } from "../utils/format";

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
        <h2 className="section-title">Expenses</h2>
      </div>
      <Link to={`/groups/${groupId}/expenses/new`}>
        <Button>Add expense</Button>
      </Link>
    </div>

    <div className="mt-5 divide-y divide-slate-100">
      {expenses.map((expense) => (
        <article key={expense._id} className="py-6 first:pt-0 last:pb-0">
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
              </div>
              {expense.notes ? <p className="mt-3 text-sm leading-6 text-slate-500">{expense.notes}</p> : null}
            </div>

            <div className="text-left xl:text-right">
              <MoneyAmount amount={expense.amount} className="display-font text-2xl font-semibold" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-center gap-3">
              <AvatarStack users={expense.participants} max={5} size="xs" />
              <span className="text-xs text-slate-500">{expense.participants.length} participants</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {canSettleExpense(expense, user?._id) ? (
                <Button variant="secondary" onClick={() => onSettle(expense)}>
                  <CheckCircle2 size={16} />
                  Mark settled
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
