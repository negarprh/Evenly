import { ArrowDownLeft, ArrowUpRight, Layers3, ReceiptText } from "lucide-react";
import { Card } from "./Card";

const tones = {
  groups: {
    icon: Layers3,
    badge: "bg-slate-100 text-slate-600"
  },
  expenses: {
    icon: ReceiptText,
    badge: "bg-warm-100 text-warm-700"
  },
  owe: {
    icon: ArrowUpRight,
    badge: "bg-danger-50 text-danger-700"
  },
  owed: {
    icon: ArrowDownLeft,
    badge: "bg-success-50 text-success-700"
  }
};

export const StatCard = ({ label, value, tone = "groups", description }) => {
  const config = tones[tone] || tones.groups;
  const Icon = config.icon;
  const text = description;

  return (
    <Card className={`stat-card stat-${tone} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-500">{label}</div>
          <div className="mt-3 display-font text-2xl sm:text-3xl font-semibold text-ink">{value}</div>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${config.badge}`}>
          <Icon size={18} />
        </span>
      </div>
      {text ? <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p> : null}
    </Card>
  );
};
