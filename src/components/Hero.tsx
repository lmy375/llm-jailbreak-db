import type { LangStrings, Section } from '../types';

interface Props {
  strings: LangStrings;
  section: Section;
  counts: { prompts: number; methods: number; models: number; systemPrompts: number };
  onMethod: () => void;
  onSystemDb: () => void;
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <b className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink">{value}</b>
      <span className="text-[12px] text-faint">{label}</span>
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
    <section className="pt-14 pb-3 sm:pt-16">
      <h1 className="mb-4 max-w-[920px] bg-gradient-to-b from-hero-from to-hero-to bg-clip-text text-[clamp(32px,5vw,52px)] font-semibold leading-[1.06] tracking-[-0.035em] text-transparent">
        {title}
      </h1>
      <p className="max-w-[640px] text-[17px] leading-[1.5] text-muted">{description}</p>

      <div className="mt-9 flex flex-wrap gap-10">
        {system ? (
          <button
            type="button"
            onClick={onSystemDb}
            className="flex cursor-pointer flex-col items-start gap-0.5 text-left"
          >
            <b className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink">
              {counts.systemPrompts}
            </b>
            <span className="text-[12px] text-faint">{strings.sysPrompts.tabs.db}</span>
          </button>
        ) : (
          <>
            <Stat value={counts.prompts} label={strings.stats.prompts} />
            <button
              type="button"
              onClick={onMethod}
              className="flex cursor-pointer flex-col items-start gap-0.5 text-left"
            >
              <b className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink">
                {counts.methods}
              </b>
              <span className="text-[12px] text-faint">{strings.stats.methods}</span>
            </button>
            <Stat value={counts.models} label={strings.stats.models} />
          </>
        )}
      </div>
    </section>
  );
}