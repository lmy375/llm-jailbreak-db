import type { JailbreakMethod, LangStrings, Prompt } from '../types';
import { Icon } from './Icon';

interface Props {
  methods: JailbreakMethod[];
  activeId: string;
  strings: LangStrings;
  prompts: Prompt[];
  onSelect: (id: string) => void;
  onOpenPrompt: (id: string) => void;
}

export function MethodView({ methods, activeId, strings, prompts, onSelect, onOpenPrompt }: Props) {
  const fm = strings.fieldMap;
  const active = methods.find((t) => t.id === activeId) ?? methods[0];
  if (!active) return null;

  const body = active[fm.body] || active[fm.bodyAlt];
  const name = active[fm.name] || active[fm.nameAlt];
  const nameAlt = active[fm.nameAlt];
  const related = prompts.filter((p) => p.jailbreak_method === active.id);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[264px_1fr]">
      <aside className="flex gap-1 overflow-x-auto pb-1.5 lg:sticky lg:top-[128px] lg:flex-col lg:overflow-visible lg:pb-0">
        {methods.map((t) => {
          const on = t.id === active.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={
                'flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-[12px] px-3 py-2 text-left text-[13.5px] transition ' +
                (on
                  ? 'bg-surface font-medium text-ink shadow-[var(--shadow-card)]'
                  : 'text-muted hover:bg-hover hover:text-ink')
              }
            >
              <span className="min-w-[18px] font-mono text-[11px] text-faint">
                {String(t.index + 1).padStart(2, '0')}
              </span>
              <span>{t[fm.name] || t[fm.nameAlt]}</span>
              <span className="ml-auto pl-2 font-mono text-[11px] text-faint lg:ml-0">
                {t.count}
              </span>
            </button>
          );
        })}
      </aside>

      <section className="rounded-[22px] border border-line bg-surface px-7 py-8 shadow-[var(--shadow-card)] sm:px-9">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h2 className="text-[24px] font-semibold tracking-[-0.025em] text-ink">{name}</h2>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] text-accent-ink">
            {active.id}
          </span>
          <span className="rounded-full bg-hover px-2.5 py-0.5 font-mono text-[11px] text-muted">
            {active.count}
            {strings.labels.promptUnit}
          </span>
        </div>
        {nameAlt && <p className="mb-5 text-[13px] text-faint">{nameAlt}</p>}

        <div className="md-content" dangerouslySetInnerHTML={{ __html: body }} />

        <div className="mt-8 border-t border-line pt-6 text-xs text-muted">
          <strong className="text-[11px] font-medium uppercase tracking-[0.08em] text-faint">
            {strings.labels.relatedPrompts}
          </strong>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {related.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpenPrompt(p.id)}
                className="group inline-flex cursor-pointer items-center gap-1 rounded-full border border-line bg-hover px-2.5 py-1 font-mono text-[11px] text-muted transition hover:border-accent/40 hover:text-accent-ink"
              >
                {p.id}
                <Icon
                  name="chevronRight"
                  className="h-2.5 w-2.5 text-faint transition group-hover:text-accent-ink"
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}