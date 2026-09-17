import { ArrowUpRight, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { AvatarStack } from "./AvatarStack";
import { BalancePill } from "./BalancePill";
import { Card } from "./Card";
import { MoneyAmount } from "./MoneyAmount";
import { timeAgo } from "../utils/format";

export const GroupCard = ({ group, balance, compact = false }) => (
  <Card className={`group-card ${compact ? "group-card-compact" : ""}`}>
    <div className="group-card-top">
      <span className="group-symbol"><UsersRound size={21} /></span>
      <BalancePill value={balance?.net || 0} />
    </div>
    <Link to={`/groups/${group._id}`} className="group-title-link">
      <h3>{group.name}</h3><ArrowUpRight size={18} />
    </Link>
    {group.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{group.description}</p> : null}
    {!compact ? (
      <div className="group-card-metrics">
        <div><span>Open expenses</span><strong>{group.stats?.unsettledExpenseCount || 0}</strong></div>
        <div><span>Outstanding</span><MoneyAmount amount={group.stats?.unsettledTotal || 0} /></div>
      </div>
    ) : null}
    <div className="group-card-footer">
      <div className="flex items-center gap-2"><AvatarStack users={group.members} size="xs" /><span>{group.members.length} members</span></div>
      <span>{group.activities?.[0]?.createdAt ? timeAgo(group.activities[0].createdAt) : "No activity"}</span>
    </div>
  </Card>
);
