import { balanceTone, formatBalanceCopy } from "../utils/format";

const classes = {
  positive: "bg-success-50 text-success-700",
  negative: "bg-danger-50 text-danger-700",
  neutral: "bg-slate-100 text-slate-600"
};

export const BalancePill = ({ value, className = "" }) => {
  const tone = balanceTone(value);
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${classes[tone]} ${className}`.trim()}>
      {formatBalanceCopy(value)}
    </span>
  );
};
