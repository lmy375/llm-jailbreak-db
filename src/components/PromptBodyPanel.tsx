/** One selectable language side of a prompt body. */
export interface BodySide<T extends string> {
  key: T;
  label: string;
  text: string;
}

interface Props<T extends string> {
  /** Panel title, e.g. "Prompt" / "Full prompt". */
  label: string;
  /** Small muted note shown next to the title, e.g. a word count. */
  note?: string;
  sides: BodySide<T>[];
  value: T;
  onChange: (key: T) => void;
}

/**
 * Prompt body panel shared by both archive drawers: a header with a language
 * toggle and the raw text below, always fully open (scrolls past its max height).
 */
export function PromptBodyPanel<T extends string>({
  label,
  note,
  sides,
  value,
  onChange,
}: Props<T>) {
  const active = sides.find((s) => s.key === value) ?? sides[0];

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-[10px] border border-line bg-pre-bg">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">{label}</span>
        {note && <span className="text-[11px] text-faint/80">{note}</span>}
        <span className="flex-1" />
        <span className="inline-flex overflow-hidden rounded-[7px] border border-line">
          {sides.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onChange(s.key)}
              className={
                'cursor-pointer px-2.5 py-1 text-[11px] transition ' +
                (active?.key === s.key ? 'bg-accent/15 text-accent-ink' : 'text-muted hover:text-ink')
              }
            >
              {s.label}
            </button>
          ))}
        </span>
      </div>
      {/* Raw prompt text: whitespace preserved, never parsed as markup. */}
      <pre className="m-0 max-h-[520px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-relaxed text-pre-ink">
        {active?.text ?? ''}
      </pre>
    </div>
  );
}