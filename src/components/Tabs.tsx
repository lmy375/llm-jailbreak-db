import { useEffect, useRef } from 'react';
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

  // Publish the rendered height as --subnav-h: the table headers pin themselves
  // right below this bar, and the method sidebar offsets its own sticky top.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const publish = () =>
      document.documentElement.style.setProperty('--subnav-h', `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <nav
      ref={ref}
      className="sticky top-[var(--header-h,49px)] z-30 mb-7 flex gap-5 border-b border-line bg-canvas/80 backdrop-blur-xl sm:gap-7"
    >
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
        '-mb-px inline-flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-[2px] py-3.5 text-[13.5px] tracking-[-0.005em] transition-colors duration-200 ' +
        (active
          ? 'border-ink font-semibold text-ink'
          : 'border-transparent text-muted hover:text-ink')
      }
    >
      {label}
      {count !== undefined && (
        <span
          className={
            'rounded-full px-1.5 py-px text-[10.5px] font-normal tabular-nums transition-colors duration-200 ' +
            (active ? 'bg-accent-soft text-accent-ink' : 'bg-hover text-faint')
          }
        >
          {count}
        </span>
      )}
    </button>
  );
}