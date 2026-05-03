import { Sparkles } from "lucide-react";
import { Card } from "./Card";

export const EmptyState = ({ title, children, action, icon: Icon = Sparkles }) => (
  <Card className="p-8 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
      <Icon size={22} />
    </div>
    <h3 className="mt-5 display-font text-xl font-semibold text-ink">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{children}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </Card>
);
