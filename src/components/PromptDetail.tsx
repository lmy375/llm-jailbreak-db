import { useEffect, useState } from 'react';
import type { LangStrings, Prompt, PromptBody, PromptSide, JailbreakMethod, TargetEntry } from '../types';
import { MetaRow } from './MetaRow';
import { PromptBodyPanel } from './PromptBodyPanel';
import { QualityScore } from './QualityScore';

const pill =
  'inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-hover px-2.5 py-1 text-[12.5px] text-muted transition hover:border-accent/50 hover:text-accent-ink';

interface Props {
  prompt: Prompt;
  /** Fetches the entry's two language sides; the drawer opens before they land. */
  loadPromptBody: (id: string) => Promise<PromptBody>;
  method?: JailbreakMethod;
  target?: TargetEntry;
  strings: LangStrings;
  side: PromptSide;
  onSide: (side: PromptSide) => void;
  onOpenMethod: () => void;
}

function stripUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

/** Side-drawer detail panel for one prompt row. */
export function PromptDetail({
  prompt,
  loadPromptBody,
  method,
  target,
  strings,
  side,
  onSide,
  onOpenMethod,
}: Props) {
  const fm = strings.fieldMap;
  const title = prompt[fm.title] || prompt[fm.titleAlt];
  const titleAlt = prompt[fm.titleAlt];
  const targetName = target
    ? target[fm.name] || target[fm.nameAlt]
    : prompt.target;
  const note = prompt[fm.note] || prompt[fm.noteAlt];
  const methodName = method
    ? method[fm.name] || method[fm.nameAlt]
    : prompt.jailbreak_method;
  const [body, setBody] = useState<PromptBody | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setBody(null);
    loadPromptBody(prompt.id)
      .then((b) => {
        if (!alive) return;
        setBody(b);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setBody({ original: '', translation: '' });
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [prompt.id, loadPromptBody]);

  const originalRaw = body?.original ?? '';
  const translationRaw = body?.translation ?? '';
  // Untranslated entries show the original text on both sides rather than a blank panel.
  const original = originalRaw.trim() ? originalRaw : translationRaw;
  const translation = translationRaw.trim() ? translationRaw : originalRaw;
  // Either side can be absent; name the text that is actually on screen so a
  // fallback does not read as a wrong translation.
  const missingFor = (langLabel: string) => ({
    label: strings.labels.missingBody.replace('{lang}', langLabel),
    hint: strings.labels.missingBodyHint.replace('{lang}', langLabel),
  });

  return (
    <div className="flex min-w-0 flex-col gap-5 p-5">
      {/* ---- meta block ---- */}
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-ink">{title}</h3>
        {titleAlt && titleAlt !== title && (
          <p className="-mt-1.5 text-[12.5px] leading-relaxed text-faint">{titleAlt}</p>
        )}

        <MetaRow label={strings.labels.target}>{targetName}</MetaRow>
        <MetaRow label={strings.labels.quality}>
          <QualityScore
            value={prompt.quality_score}
            showMax
            label={strings.labels.quality}
          />
        </MetaRow>
        {note && <MetaRow label={strings.labels.note}>{note}</MetaRow>}
        <MetaRow label={strings.labels.method}>
          <button type="button" onClick={onOpenMethod} className={pill}>
            <span className="h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br from-accent to-accent2 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            {methodName}
            <span className="text-[11px] text-faint">→</span>
          </button>
        </MetaRow>
        <MetaRow label={strings.labels.source}>
          <a
            href={prompt.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent-ink hover:underline"
          >
            {stripUrl(prompt.source_url)} ↗
          </a>
        </MetaRow>

      </div>

      {/* ---- prompt body ---- */}
      <PromptBodyPanel
        label={strings.labels.prompt}
        value={side}
        onChange={onSide}
        loading={loading}
        sides={[
          {
            key: 'translation',
            label: strings.labels.translation,
            text: translation,
            missing: translationRaw.trim()
              ? undefined
              : missingFor(strings.labels.original),
          },
          {
            key: 'original',
            label: strings.labels.original,
            text: original,
            missing: originalRaw.trim()
              ? undefined
              : missingFor(strings.labels.translation),
          },
        ]}
      />
    </div>
  );
}
