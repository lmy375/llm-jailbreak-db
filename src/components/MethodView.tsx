import type { JailbreakMethod, LangStrings, Prompt } from '../types';

interface Props {
  methods: JailbreakMethod[];
  activeId: string;
  strings: LangStrings;
  prompts: Prompt[];
  onSelect: (id: string) => void;
}

export function MethodView({ methods, activeId, strings, prompts, onSelect }: Props) {
  const fm = strings.fieldMap;
  const active = methods.find((t) => t.id === activeId) ?? methods[0];
  if (!active) return null;

  const body = active[fm.body] || active[fm.bodyAlt];
  const name = active[fm.name] || active[fm.nameAlt];
  const nameAlt = active[fm.nameAlt];
  const related = prompts.filter((p) => p.jailbreak_method === active.id);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="flex gap-1 overflow-x-auto pb-1.5 lg:sticky lg:top-[128px] lg:flex-col lg:overflow-visible lg:pb-0">
        {methods.map((t) => {
          const on = t.id === active.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={
                'flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-[9px] border px-3 py-2 text-left text-[13.5px] transition ' +
                (on
                  ? 'border-accent/40 bg-accent/15 text-accent-ink'
                  : 'border-transparent text-muted hover:bg-hover hover:text-ink')
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

      <section className="rounded-[14px] border border-line bg-surface px-6 py-7 sm:px-7">
        <div className="mb-1.5 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{name}</h2>
          <span className="rounded-md border border-accent/35 bg-accent/15 px-2 py-0.5 font-mono text-[11px] text-accent-ink">
            {active.id}
          </span>
          <span className="rounded-md border border-line bg-hover px-2 py-0.5 font-mono text-[11px] text-muted">
            {active.count}
            {strings.labels.promptUnit}
          </span>
        </div>
        {nameAlt && <p className="mb-4 text-xs text-faint">{nameAlt}</p>}

        <div className="md-content" dangerouslySetInnerHTML={{ __html: body }} />

        <div className="mt-6 border-t border-line pt-5 text-xs text-muted">
          <strong className="text-ink">{strings.labels.relatedPrompts}:</strong>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {related.map((p) => (
              <span
                key={p.id}
                className="rounded-md border border-accent/35 bg-accent/15 px-2 py-0.5 font-mono text-[11px] text-accent-ink"
              >
                {p.id}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
