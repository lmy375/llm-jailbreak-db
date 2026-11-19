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
      className={`flex flex-wrap items-center gap-1 ${className}`}
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
              'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] tracking-[-0.01em] transition ' +
              (active
                ? 'bg-hover font-semibold text-ink'
                : 'text-muted hover:text-ink')
            }
          >
            {it.label}
            <span className="text-[11px] font-normal tabular-nums text-faint">{it.count}</span>
          </button>
        );
      })}
    </nav>
  );
}