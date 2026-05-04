import { useEffect, useMemo, useState } from "react";
import { FolderHeart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { groupsApi } from "../api/endpoints";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { GroupCard } from "../components/GroupCard";
import { SkeletonRow } from "../components/Skeleton";
import { useAuth } from "../contexts/AuthContext";

export const GroupsPage = () => {
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

  return (
    <div className="page-shell">
      <Card glow className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Shared spaces</div>
            <h1 className="mt-2 display-font text-4xl font-semibold text-ink">Which groups are you part of?</h1>
          </div>
          <Link to="/groups/new">
            <Button>
              <Plus size={16} />
              Start a shared group
            </Button>
          </Link>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonRow key={index} className="h-[184px] items-start" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          title="Start your first shared group"
          action={
            <Link to="/groups/new">
              <Button>Start a group</Button>
            </Link>
          }
          icon={FolderHeart}
        >
          Create a group for roommates, a trip, or any shared cost you want to keep clear.
        </EmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} balance={balanceMap[group._id]} />
          ))}
        </div>
      )}
    </div>
  );
};
