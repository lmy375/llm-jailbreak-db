import { useEffect, useState } from 'react';
import { Icon } from './Icon';

/** One selectable language side of a prompt body. */
export interface BodySide<T extends string> {
  key: T;
  label: string;
  text: string;
  /** Set when this language has no body and `text` comes from another language. */
  missing?: { label: string; hint: string };
}

interface Props<T extends string> {
  /** Panel title, e.g. "Prompt" / "Full prompt". */
  label: string;
  /** Small muted note shown next to the title, e.g. a word count. */
  note?: string;
  sides: BodySide<T>[];
  value: T;
  onChange: (key: T) => void;
  /** Body text still on its way; shows placeholder lines instead of an empty box. */
  loading?: boolean;
  /** Copy button label and its success state. */
  copyLabel: string;
  copiedLabel: string;
}

/**
 * Prompt body panel shared by both archive drawers: a header with a copy
 * action and a language toggle, and the raw text below, always fully open
 * (scrolls past its max height).
 */
export function PromptBodyPanel<T extends string>({
  label,
  note,
  sides,
  value,
  onChange,
  loading = false,
  copyLabel,
  copiedLabel,
}: Props<T>) {
  const active = sides.find((s) => s.key === value) ?? sides[0];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    setCopied(false);
  }, [active?.key]);

  const copy = async () => {
    const text = active?.text;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API is unavailable on plain HTTP and in some embedded views;
      // fall back to the selection-based copy so the action never disappears.
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(area);
      }
    }
    setCopied(true);
  };

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-[14px] bg-pre-bg">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-faint">{label}</span>
        {note && <span className="text-[11px] text-faint">{note}</span>}
        {active?.missing && (
          <span
            title={active.missing.hint}
            className="cursor-help whitespace-nowrap rounded-full border border-line px-1.5 py-px text-[10px] text-faint"
          >
            {active.missing.label}
          </span>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={copy}
          disabled={!active?.text}
          aria-label={copied ? copiedLabel : copyLabel}
          title={copied ? copiedLabel : copyLabel}
          className={
            'inline-flex cursor-pointer items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] transition disabled:cursor-default disabled:opacity-40 ' +
            (copied ? 'text-accent-ink' : 'text-muted hover:text-ink')
          }
        >
          <Icon name={copied ? 'check' : 'copy'} className="h-3 w-3 flex-none" />
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
        <span className="inline-flex items-center overflow-hidden rounded-full border border-line bg-surface p-0.5">
          {sides.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onChange(s.key)}
              title={s.missing?.hint}
              className={
                'cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] transition ' +
                (active?.key === s.key
                  ? 'bg-hover font-medium text-ink'
                  : 'text-muted hover:text-ink')
              }
            >
              {s.label}
            </button>
          ))}
        </span>
      </div>
      {/* Raw prompt text: whitespace preserved, never parsed as markup. */}
      {loading && !active?.text ? (
        <div className="flex flex-col gap-2.5 p-4" aria-busy="true">
          {[92, 78, 86, 64, 88, 47].map((w, i) => (
            <span
              key={i}
              className="h-2.5 animate-pulse rounded-full bg-line"
              style={{ width: `${w}%`, animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      ) : (
        <pre className="m-0 max-h-[540px] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[12.5px] leading-[1.7] text-pre-ink">
          {active?.text ?? ''}
        </pre>
      )}
    </div>
  );
}