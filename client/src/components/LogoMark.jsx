export const LogoMark = ({ compact = false }) => (
  <div className="flex items-center gap-3">
    <div className="relative h-11 w-11 shrink-0">
      <span className="absolute left-0 top-1 h-8 w-8 rounded-full bg-warm-100 ring-1 ring-warm-500/20" />
      <span className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-amber-100 ring-1 ring-amber-300/30" />
      <span className="absolute inset-[10px] rounded-full bg-white ring-1 ring-line" />
    </div>
    {!compact ? (
      <div>
        <div className="display-font text-lg font-semibold text-ink">Evenly</div>
        <div className="text-xs font-medium text-slate-500">Split simply</div>
      </div>
    ) : null}
  </div>
);
