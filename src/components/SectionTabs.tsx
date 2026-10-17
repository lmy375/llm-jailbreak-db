import type { LangStrings, Section } from '../types';

interface Props {
  strings: LangStrings;
  section: Section;
  onSection: (section: Section) => void;
  counts: { jailbreak: number; system: number };
  className?: string;
}

/** Top-level switch between the two archives: jailbreak prompts and system prompts. */
export function SectionTabs({ strings, section, onSection, counts, className = '' }: Props) {
  const S = strings.sysPrompts;
  const items: { key: Section; label: string; count: number }[] = [
    { key: 'jailbreak', label: strings.site.name, count: counts.jailbreak },
    { key: 'system', label: S.section, count: counts.system },
  ];

  return (
    <nav
      className={`flex flex-wrap items-center gap-2 ${className}`}
      aria-label={strings.site.name}
    >
      {items.map((it) => {
        const active = section === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onSection(it.key)}
            aria-current={active ? 'page' : undefined}
            className={
              'inline-flex cursor-pointer items-center gap-2 rounded-[9px] border px-3 py-[7px] text-[13px] font-medium tracking-tight transition ' +
              (active
                ? 'border-accent/55 bg-accent/10 text-ink shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
                : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink')
            }
          >
            {active && (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br from-accent to-accent2"
              />
            )}
            {it.label}
            <span
              className={
                'rounded-full px-1.5 text-[11px] ' +
                (active ? 'bg-accent/20 text-accent-ink' : 'bg-hover text-faint')
              }
            >
              {it.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
