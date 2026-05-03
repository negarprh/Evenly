import { money } from "../utils/format";

const tones = {
  default: "text-ink",
  positive: "text-success-700",
  negative: "text-danger-700",
  warm: "text-warm-700"
};

export const MoneyAmount = ({ amount, tone = "default", className = "" }) => (
  <span className={`money-tabular font-semibold ${tones[tone]} ${className}`.trim()}>{money(amount)}</span>
);
