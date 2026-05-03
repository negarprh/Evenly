import { Receipt, Scale, Wallet } from "lucide-react";
import { Avatar } from "./Avatar";
import { BalancePill } from "./BalancePill";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { MoneyAmount } from "./MoneyAmount";
import { money } from "../utils/format";

export const BalanceBoard = ({ balances, totalSpent = 0 }) => {
  if (!balances) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="surface-glow p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-500">Who owes what</div>
            <h2 className="mt-2 display-font text-3xl font-semibold text-ink">Shared balances at a glance</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Keep the conversation simple. Open balances stay visible here until someone marks an expense as settled.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:max-w-[440px]">
            <MetricTile icon={Receipt} label="Total spending" value={money(totalSpent)} tone="slate" />
            <MetricTile icon={Wallet} label="Still open" value={money(balances.unsettledTotal)} tone="warm" />
            <MetricTile icon={Scale} label="Open expenses" value={balances.unsettledExpenseCount} tone="teal" />
          </div>
        </div>

        <div className="mt-6 rounded-[24px] bg-white/80 p-5">
          <div className="text-sm font-semibold text-slate-500">Suggested settlements</div>
          {balances.settlements.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Everyone is settled up">No one owes anything in this group right now.</EmptyState>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {balances.settlements.map((settlement, index) => (
                <div
                  key={`${settlement.from.id}-${settlement.to.id}-${index}`}
                  className="flex flex-col gap-4 rounded-[22px] border border-amber-200 bg-amber-50/80 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar user={settlement.from} size="sm" />
                    <div>
                      <div className="font-semibold text-ink">{settlement.from.name}</div>
                      <div className="text-sm text-slate-500">owes {settlement.to.name}</div>
                    </div>
                  </div>
                  <div className="hidden h-px flex-1 bg-amber-200 md:block" />
                  <div className="text-left md:text-right">
                    <MoneyAmount amount={settlement.amount} tone="default" className="display-font text-2xl font-semibold" />
                    <div className="mt-1 text-sm text-slate-500">{settlement.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="section-title">Member snapshot</h3>
            <p className="section-copy">See who paid more, who still owes, and who’s balanced.</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {balances.summary.map((row) => (
            <div key={row.user.id} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar user={row.user} size="sm" />
                  <div>
                    <div className="font-semibold text-ink">{row.user.name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Paid {money(row.paid)} · share {money(row.owesShare)}
                    </div>
                  </div>
                </div>
                <BalancePill value={row.net} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const MetricTile = ({ icon: Icon, label, value, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    warm: "bg-warm-100 text-warm-700",
    teal: "bg-amber-100 text-amber-700"
  };

  return (
    <div className="rounded-2xl bg-white/90 px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
        <span className={`flex h-5 w-5 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={12} />
        </span>
        {label}
      </div>
      <div className="mt-1 display-font text-base font-semibold text-ink">{value}</div>
    </div>
  );
};
