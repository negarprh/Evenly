import { ArrowDownLeft, ArrowUpRight, Layers3, ReceiptText } from "lucide-react";
import { Card } from "./Card";

const tones = {
  groups: {
    icon: Layers3,
    badge: "bg-slate-100 text-slate-600",
    description: "Shared spaces you’re part of."
  },
  expenses: {
    icon: ReceiptText,
    badge: "bg-warm-100 text-warm-700",
    description: "Expenses that still affect balances."
  },
  owe: {
    icon: ArrowUpRight,
    badge: "bg-danger-50 text-danger-700",
    description: "What you still need to settle."
  },
  owed: {
    icon: ArrowDownLeft,
    badge: "bg-success-50 text-success-700",
    description: "What others owe back to you."
  }
};

export const StatCard = ({ label, value, tone = "groups", description }) => {
  const config = tones[tone] || tones.groups;
  const Icon = config.icon;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-500">{label}</div>
          <div className="mt-3 display-font text-3xl font-semibold text-ink">{value}</div>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.badge}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description || config.description}</p>
    </Card>
  );
};
