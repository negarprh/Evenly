const variants = {
  primary: "bg-amber-300 text-amber-950 shadow-sm hover:bg-amber-400",
  secondary: "border border-line bg-white text-ink hover:bg-slate-50",
  ghost: "bg-transparent text-slate-600 hover:bg-white/70",
  danger: "border border-danger-700/15 bg-danger-50 text-danger-700 hover:bg-danger-50/80"
};

export const Button = ({ className = "", variant = "primary", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`.trim()}
    {...props}
  />
);
