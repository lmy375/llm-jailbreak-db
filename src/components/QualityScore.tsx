interface Props {
  /** Quality score, 1–10. */
  value: number;
  /** Upper bound of the scale; defaults to 10. */
  max?: number;
  /** Show the bound after the value, as in `8/10`. */
  showMax?: boolean;
  /** Localised field label, used for the accessible name. */
  label?: string;
}

/** Compact quality-score meter shared by both archive views. */
export function QualityScore({ value, max = 10, showMax = false, label }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const text = label ? `${label}: ${value}/${max}` : `${value}/${max}`;
  return (
    <span className="inline-flex items-center gap-1.5" title={text} aria-label={text}>
      <span aria-hidden="true" className="relative h-[3px] w-8 overflow-hidden rounded-full bg-line">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent2 to-accent"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="font-mono text-[12px] tabular-nums text-muted">
        {value}
        {showMax && <span className="text-faint">/{max}</span>}
      </span>
    </span>
  );
}