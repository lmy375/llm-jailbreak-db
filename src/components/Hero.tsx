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
    <div className="flex flex-col">
      <b className="text-[21px] font-semibold tracking-tight text-ink">{value}</b>
      <span className="text-[11.5px] uppercase tracking-[0.08em] text-faint">{label}</span>
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
    <section className="pt-10 pb-2">
      <h1 className="mb-2.5 bg-gradient-to-b from-hero-from to-hero-to bg-clip-text text-[30px] font-semibold leading-tight tracking-[-0.03em] text-transparent">
        {title}
      </h1>
      <p className="max-w-[760px] text-sm text-muted">{description}</p>

      <div className="mt-5 flex flex-wrap gap-6">
        {system ? (
          <button
            type="button"
            onClick={onSystemDb}
            className="flex cursor-pointer flex-col items-start text-left"
          >
            <b className="text-[21px] font-semibold tracking-tight text-ink">
              {counts.systemPrompts}
            </b>
            <span className="text-[11.5px] uppercase tracking-[0.08em] text-faint">
              {strings.sysPrompts.tabs.db}
            </span>
          </button>
        ) : (
          <>
            <Stat value={counts.prompts} label={strings.stats.prompts} />
            <button
              type="button"
              onClick={onMethod}
              className="flex cursor-pointer flex-col items-start text-left"
            >
              <b className="text-[21px] font-semibold tracking-tight text-ink">
                {counts.methods}
              </b>
              <span className="text-[11.5px] uppercase tracking-[0.08em] text-faint">
                {strings.stats.methods}
              </span>
            </button>
            <Stat value={counts.models} label={strings.stats.models} />
          </>
        )}
      </div>
    </section>
  );
}