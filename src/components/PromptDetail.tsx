import type { LangStrings, Prompt, PromptSide, JailbreakMethod } from '../types';

const pill =
  'inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-hover px-2.5 py-1 text-[12.5px] text-muted transition hover:border-accent/50 hover:text-accent-ink';

interface Props {
  prompt: Prompt;
  method?: JailbreakMethod;
  strings: LangStrings;
  side: PromptSide;
  expanded: boolean;
  onSide: (side: PromptSide) => void;
  onExpand: () => void;
  onOpenMethod: () => void;
}

function stripUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 text-[13px]">
      <span className="w-24 flex-none pt-[3px] text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-faint">
        {label}
      </span>
      <div className="min-w-0 flex-1 leading-[1.7] text-muted">{children}</div>
    </div>
  );
}

/** Expanded in-place detail panel for one table row. */
export function PromptDetail({
  prompt,
  method,
  strings,
  side,
  expanded,
  onSide,
  onExpand,
  onOpenMethod,
}: Props) {
  const fm = strings.fieldMap;
  const title = prompt[fm.title];
  const titleAlt = prompt[fm.titleAlt];
  const target = prompt[fm.target];
  const methodName = method ? method[fm.name] : prompt.jailbreak_method;
  const body = side === 'translation' ? prompt.prompt_zh : prompt.prompt;

  // `extra` is free-form: any key is rendered as a labelled row. Array values
  // (e.g. proofs) render as a list of links; scalars render as plain text.
  const extraEntries = Object.entries(prompt.extra ?? {});
  const labelFor = (key: string) => strings.labels.extraKeys[key] ?? key;

  return (
    <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {/* ---- meta column ---- */}
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-ink">{title}</h3>
        {titleAlt && titleAlt !== title && (
          <p className="-mt-1.5 text-[12.5px] leading-relaxed text-faint">{titleAlt}</p>
        )}

        <MetaRow label={strings.labels.target}>{target}</MetaRow>
        {prompt.category && <MetaRow label={strings.labels.category}>{prompt.category}</MetaRow>}
        <MetaRow label={strings.labels.method}>
          <button type="button" onClick={onOpenMethod} className={pill}>
            <span className="h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br from-accent to-accent2 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            {methodName}
            <span className="text-[11px] text-faint">→</span>
          </button>
        </MetaRow>
        <MetaRow label={strings.labels.source}>
          <a
            href={prompt.source}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent-ink hover:underline"
          >
            {stripUrl(prompt.source)} ↗
          </a>
        </MetaRow>
        {extraEntries.map(([key, value]) => (
          <MetaRow key={key} label={labelFor(key)}>
            {Array.isArray(value) ? (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {value.map((u) => (
                  <a
                    key={u}
                    href={u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-accent-ink hover:underline"
                  >
                    {stripUrl(u)} ↗
                  </a>
                ))}
              </div>
            ) : (
              value
            )}
          </MetaRow>
        ))}
      </div>

      {/* ---- prompt column ---- */}
      <div className="flex min-w-0 flex-col overflow-hidden rounded-[10px] border border-line bg-pre-bg">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-3 py-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
            {strings.labels.prompt}
          </span>
          <span className="flex-1" />
          <span className="inline-flex overflow-hidden rounded-[7px] border border-line">
            {(['translation', 'original'] as PromptSide[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSide(s)}
                className={
                  'cursor-pointer px-2.5 py-1 text-[11px] transition ' +
                  (side === s
                    ? 'bg-accent/15 text-accent-ink'
                    : 'text-muted hover:text-ink')
                }
              >
                {s === 'translation' ? strings.labels.translation : strings.labels.original}
              </button>
            ))}
          </span>
          <button
            type="button"
            onClick={onExpand}
            className="cursor-pointer rounded-[7px] border border-line px-2.5 py-1 text-[11px] text-muted transition hover:border-line-strong hover:text-ink"
          >
            {expanded ? strings.labels.collapse : strings.labels.expand}
          </button>
        </div>
        <pre
          className={
            'm-0 whitespace-pre-wrap break-words p-3 font-mono text-xs leading-relaxed text-pre-ink ' +
            (expanded
              ? 'max-h-[520px] overflow-auto'
              : 'prompt-fade relative max-h-[132px] overflow-hidden')
          }
        >
          {body}
        </pre>
      </div>
    </div>
  );
}
