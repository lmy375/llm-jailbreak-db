import type { JailbreakView, LangStrings, SystemView } from '../types';

interface Props {
  strings: LangStrings;
  /** Which archive's sub-tabs to render. */
  variant: 'jailbreak' | 'system';
  counts: { db: number; method?: number; source?: number };
  jailbreakView: JailbreakView;
  systemView: SystemView;
  onJailbreakView: (view: JailbreakView) => void;
  onSystemView: (view: SystemView) => void;
}

/** Sub-tabs inside one archive. Jailbreak has three, system prompts has two. */
export function Tabs({
  strings,
  variant,
  counts,
  jailbreakView,
  systemView,
  onJailbreakView,
  onSystemView,
}: Props) {
  const jailbreak = variant === 'jailbreak';
  const active = jailbreak ? jailbreakView : systemView;

  return (
    <nav className="sticky top-[var(--header-h,49px)] z-30 mb-6 flex gap-7 border-b border-line bg-canvas/85 backdrop-blur-xl">
      {jailbreak ? (
        <>
          <SubTab
            label={strings.tabs.db}
            count={counts.db}
            active={active === 'db'}
            onClick={() => onJailbreakView('db')}
          />
          <SubTab
            label={strings.tabs.method}
            count={counts.method}
            active={active === 'method'}
            onClick={() => onJailbreakView('method')}
          />
          <SubTab
            label={strings.tabs.source}
            count={counts.source}
            active={active === 'source'}
            onClick={() => onJailbreakView('source')}
          />
        </>
      ) : (
        <>
          <SubTab
            label={strings.sysPrompts.tabs.db}
            count={counts.db}
            active={active === 'db'}
            onClick={() => onSystemView('db')}
          />
          <SubTab
            label={strings.sysPrompts.tabs.source}
            count={counts.source}
            active={active === 'source'}
            onClick={() => onSystemView('source')}
          />
        </>
      )}
    </nav>
  );
}

function SubTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={
        '-mb-px inline-flex cursor-pointer items-center gap-1.5 border-b-[2px] px-0 py-3 text-[13.5px] transition ' +
        (active
          ? 'border-ink font-semibold text-ink'
          : 'border-transparent text-muted hover:text-ink')
      }
    >
      {label}
      {count !== undefined && (
        <span className="text-[11px] font-normal tabular-nums text-faint">{count}</span>
      )}
    </button>
  );
}