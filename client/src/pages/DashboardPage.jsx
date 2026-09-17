import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BellRing, FolderHeart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { groupsApi } from "../api/endpoints";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { GroupCard } from "../components/GroupCard";
import { SkeletonCard, SkeletonRow } from "../components/Skeleton";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../contexts/AuthContext";
import { money, timeAgo } from "../utils/format";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await groupsApi.list();
        setGroups(data.data);
        const balanceResults = await Promise.all(
          data.data.map((group) => groupsApi.balances(group._id).then((res) => res.data.data))
        );
        setBalances(balanceResults);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const balanceMap = useMemo(
    () =>
      Object.fromEntries(
        balances.map((balance) => [
          balance.groupId,
          balance.summary.find((row) => row.user.id === user?._id) || { net: 0 }
        ])
      ),
    [balances, user]
  );

  const stats = useMemo(() => {
    const mine = balances.flatMap((balance) => balance.summary.filter((row) => row.user.id === user?._id));
    const owe = mine.reduce((sum, row) => sum + Math.max(0, -row.net), 0);
    const owed = mine.reduce((sum, row) => sum + Math.max(0, row.net), 0);

    return {
      totalGroups: groups.length,
      unsettledExpenses: balances.reduce((sum, balance) => sum + balance.unsettledExpenseCount, 0),
      owe,
      owed
    };
  }, [balances, groups, user]);

  const activities = useMemo(
    () =>
      groups
        .flatMap((group) => (group.activities || []).map((activity) => ({ ...activity, groupName: group.name, groupId: group._id })))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    [groups]
  );

  if (loading) {
    return (
      <div className="page-shell">
        <Card glow className="p-6">
          <div className="shimmer h-6 w-40 rounded-full" />
          <div className="mt-4 shimmer h-12 w-80 rounded-3xl" />
          <div className="mt-3 shimmer h-4 w-[28rem] rounded-full" />
        </Card>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
          <div className="space-y-4">
            <SkeletonRow />
            <SkeletonRow />
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="shimmer h-16 rounded-xl" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Card glow className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Welcome back, {user?.name?.split(" ")[0] || "there"}</div>
            <h1 className="mt-2 display-font text-3xl font-semibold text-ink">Overview</h1>
          </div>
          <Link to="/groups/new">
            <Button>
              <Plus size={16} />
              Create group
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Groups" value={stats.totalGroups} tone="groups" />
        <StatCard label="You owe" value={money(stats.owe)} tone="owe" />
        <StatCard label="You're owed" value={money(stats.owed)} tone="owed" />
        <StatCard label="Open expenses" value={stats.unsettledExpenses} tone="expenses" />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Your groups</h2>
            </div>
            <Link to="/groups" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {groups.length === 0 ? (
            <EmptyState
              title="Create your first group"
              action={
                <Link to="/groups/new">
                  <Button>Create group</Button>
                </Link>
              }
              icon={FolderHeart}
            >
              Add a group to start tracking shared expenses.
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {groups.slice(0, 3).map((group) => (
                <GroupCard key={group._id} group={group} balance={balanceMap[group._id]} compact />
              ))}
            </div>
          )}
        </section>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warm-100 text-warm-700">
              <BellRing size={18} />
            </span>
            <div>
              <h2 className="section-title">Recent activity</h2>
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No activity yet">Updates will appear here when expenses are added or settled.</EmptyState>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {activities.map((activity) => (
                <Link
                  key={activity._id}
                  to={`/groups/${activity.groupId}`}
                  className="activity-row"
                >
                  <div className="font-semibold text-ink">{activity.message}</div>
                  <div className="mt-1 text-sm text-slate-500">{activity.groupName}</div>
                  <div className="mt-2 text-xs text-slate-400">{timeAgo(activity.createdAt)}</div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
