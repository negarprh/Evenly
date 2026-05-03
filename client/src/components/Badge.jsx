const tones = {
  neutral: "bg-slate-100 text-slate-600",
  teal: "bg-amber-100 text-amber-800",
  warm: "bg-warm-100 text-warm-700",
  success: "bg-success-50 text-success-700",
  danger: "bg-danger-50 text-danger-700",
  info: "bg-info-50 text-info-700"
};

export const Badge = ({ className = "", tone = "neutral", children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`.trim()}>
    {children}
  </span>
);
