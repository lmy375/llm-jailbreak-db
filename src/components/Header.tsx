import { useEffect, useRef } from 'react';
import type { LangStrings, Section, SiteConfig } from '../types';
import type { Theme } from '../lib/theme';
import { SectionTabs } from './SectionTabs';
import { Icon } from './Icon';

export interface LangOption {
  key: string;
  label: string;
}

interface Props {
  site: SiteConfig;
  strings: LangStrings;
  langOptions: LangOption[];
  lang: string;
  onLang: (lang: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  /** Which archive is active; the section switch lives in the header. */
  section: Section;
  onSection: (section: Section) => void;
  sectionCounts: { jailbreak: number; system: number };
}

export function Header({
  site,
  strings,
  langOptions,
  lang,
  onLang,
  theme,
  onToggleTheme,
  section,
  onSection,
  sectionCounts,
}: Props) {
  const themeLabel =
    theme === 'dark' ? strings.labels.themeToLight : strings.labels.themeToDark;

  // Publish the rendered header height as --header-h so the sticky sub-tabs can
  // offset by it no matter how the header wraps on narrow screens.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const publish = () =>
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 border-b border-line bg-canvas/75 backdrop-blur-2xl backdrop-saturate-150"
    >
      <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-2.5 sm:px-8">
        <SectionTabs
          strings={strings}
          section={section}
          counts={sectionCounts}
          onSection={onSection}
        />

        <div className="ml-auto flex items-center gap-1">
          <div
            className="inline-flex items-center rounded-full bg-hover p-[3px]"
            role="group"
            aria-label="language"
          >
            {langOptions.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => onLang(o.key)}
                className={
                  'cursor-pointer rounded-full px-3 py-1 text-[12.5px] transition-colors duration-200 ' +
                  (o.key === lang
                    ? 'bg-surface font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                    : 'text-muted hover:text-ink')
                }
              >
                {o.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-hover hover:text-ink"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-[15px] w-[15px]">
                <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8 0a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 8 0Zm0 13.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75ZM2.343 2.343a.75.75 0 0 1 1.061 0l.707.707a.75.75 0 0 1-1.06 1.061l-.708-.708a.75.75 0 0 1 0-1.06ZM11.889 11.89a.75.75 0 0 1 1.061 0l.707.707a.75.75 0 0 1-1.06 1.061l-.708-.708a.75.75 0 0 1 0-1.06ZM0 8a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1A.75.75 0 0 1 0 8Zm13.25 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75ZM2.343 11.889a.75.75 0 0 1 0-1.06l.707-.708a.75.75 0 1 1 1.061 1.061l-.708.708a.75.75 0 0 1-1.06 0ZM11.889 2.343a.75.75 0 0 1 0 1.061l-.707.708a.75.75 0 1 1 1.06-1.061l.708.708a.75.75 0 0 1 0 1.06Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-[15px] w-[15px]">
                <path d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.499 5.499 0 1 0 7.678-7.678Z" />
              </svg>
            )}
          </button>

          <a
            href={site.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[12.5px] text-muted transition-colors duration-200 hover:bg-hover hover:text-ink"
          >
            {site.repoLabel}
            <Icon name="external" className="h-3 w-3 flex-none" />
          </a>
        </div>
      </div>
    </header>
  );
}