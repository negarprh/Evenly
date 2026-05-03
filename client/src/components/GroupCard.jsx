import { ArrowRight, Clock3, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { AvatarStack } from "./AvatarStack";
import { BalancePill } from "./BalancePill";
import { Button } from "./Button";
import { Card } from "./Card";
import { MoneyAmount } from "./MoneyAmount";
import { timeAgo } from "../utils/format";

export const GroupCard = ({ group, balance, compact = false }) => {
  const lastActivity = group.activities?.[0]?.createdAt;

  return (
    <Card className={`p-5 ${compact ? "" : "h-full"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="display-font text-xl font-semibold text-ink">{group.name}</h3>
          <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-slate-500">
            {group.description || "Shared costs, open balances, and a clean history in one place."}
          </p>
        </div>
        <BalancePill value={balance?.net || 0} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <UsersRound size={14} />
            Members
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <AvatarStack users={group.members} />
            <span className="font-semibold text-ink">{group.members.length}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-warm-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-warm-700">Open expenses</div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <span className="display-font text-2xl font-semibold text-ink">{group.stats?.unsettledExpenseCount || 0}</span>
            <MoneyAmount amount={group.stats?.unsettledTotal || 0} className="text-sm" />
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            <Clock3 size={14} />
            Last activity
          </div>
          <div className="mt-2 font-semibold text-ink">{lastActivity ? timeAgo(lastActivity) : "No activity yet"}</div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          {balance?.net > 0
            ? "This group owes you money."
            : balance?.net < 0
              ? "You still owe money here."
              : "This group is currently balanced."}
        </div>
        <Link to={`/groups/${group._id}`}>
          <Button variant="secondary">
            {compact ? "Open group" : "View group"}
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
