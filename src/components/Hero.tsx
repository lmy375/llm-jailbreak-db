import type { LangStrings, Section } from '../types';

interface Props {
  strings: LangStrings;
  section: Section;
  counts: { prompts: number; methods: number; models: number; systemPrompts: number };
  onMethod: () => void;
  onSystemDb: () => void;
}

const valueClass =
  'text-[32px] font-semibold leading-none tracking-[-0.035em] tabular-nums text-ink';

const labelClass = 'mt-2 text-[11px] uppercase tracking-[0.07em] text-faint';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <b className={valueClass}>{value}</b>
      <span className={labelClass}>{label}</span>
    </div>
  );
}

/** Header block; copy and stats differ per archive. */
export function Hero({ strings, section, counts, onMethod, onSystemDb }: Props) {
  const system = section === 'system';
  const title = system ? strings.sysPrompts.heroTitle : strings.hero.title;
  const description = system
    ? strings.sysPrompts.heroDescription
    : strings.hero.description;

  return (
    <section className="pt-16 pb-4 sm:pt-20">
      <h1 className="mb-5 max-w-[960px] bg-gradient-to-b from-hero-from to-hero-to bg-clip-text text-[clamp(34px,5.2vw,58px)] font-semibold leading-[1.04] tracking-[-0.04em] text-transparent">
        {title}
      </h1>
      <p className="max-w-[660px] text-[17px] leading-[1.55] text-muted sm:text-[18px]">
        {description}
      </p>

      <div className="mt-9 flex flex-wrap gap-10 sm:mt-11 sm:gap-12">
        {system ? (
          <button
            type="button"
            onClick={onSystemDb}
            className="group flex cursor-pointer flex-col items-start text-left"
          >
            <b className={valueClass + ' transition-colors duration-200 group-hover:text-accent-ink'}>
              {counts.systemPrompts}
            </b>
            <span className={labelClass}>{strings.sysPrompts.tabs.db}</span>
          </button>
        ) : (
          <>
            <Stat value={counts.prompts} label={strings.stats.prompts} />
            <button
              type="button"
              onClick={onMethod}
              className="group flex cursor-pointer flex-col items-start text-left"
            >
              <b className={valueClass + ' transition-colors duration-200 group-hover:text-accent-ink'}>
                {counts.methods}
              </b>
              <span className={labelClass}>{strings.stats.methods}</span>
            </button>
            <Stat value={counts.models} label={strings.stats.models} />
          </>
        )}
      </div>
    </section>
  );
}