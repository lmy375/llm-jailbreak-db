import type { JailbreakMethod, LangStrings, ModelEntry, Section } from '../types';

interface Option {
  value: string;
  label: string;
}

interface Props {
  strings: LangStrings;
  section: Section;
  query: string;
  onQuery: (query: string) => void;
  models: ModelEntry[];
  methods: JailbreakMethod[];
  venders: string[];
  years: string[];
  model: string;
  method: string;
  vender: string;
  year: string;
  onModel: (value: string) => void;
  onMethod: (value: string) => void;
  onVender: (value: string) => void;
  onYear: (value: string) => void;
  shown: number;
  total: number;
  onClear: () => void;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  allLabel: string;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="whitespace-nowrap text-[12px] text-faint">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-[170px] cursor-pointer appearance-none rounded-[9px] border border-line bg-hover py-2 pl-3 pr-8 text-[13px] text-ink outline-none transition hover:border-line-strong focus:border-accent/55"
        >
          <option value="">{allLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-faint"
        >
          <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z" />
        </svg>
      </span>
    </label>
  );
}

/** Table header filter bar: full-text search plus per-column filters. */
export function FilterBar({
  strings,
  section,
  query,
  onQuery,
  models,
  methods,
  venders,
  years,
  model,
  method,
  vender,
  year,
  onModel,
  onMethod,
  onVender,
  onYear,
  shown,
  total,
  onClear,
}: Props) {
  const L = strings.labels;
  const system = section === 'system';
  const filtered = Boolean(query.trim() || model || method || vender || year);
  const matchText = L.filterMatch
    .replace('{n}', String(shown))
    .replace('{total}', String(total));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[12px] border border-line bg-surface p-2">
      <label className="relative flex min-w-[230px] flex-1 items-center">
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="pointer-events-none absolute left-3 h-[15px] w-[15px] text-faint"
        >
          <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={strings.search.placeholder}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="w-full rounded-[9px] border border-line bg-hover py-2 pl-9 pr-3 text-[13.5px] text-ink outline-none transition placeholder:text-faint focus:border-accent/55 focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.14)]"
        />
      </label>

      {system ? (
        <FilterSelect
          label={strings.sysPrompts.vender}
          value={vender}
          onChange={onVender}
          options={venders.map((v) => ({ value: v, label: v }))}
          allLabel={L.filterAll}
        />
      ) : (
        <>
          <FilterSelect
            label={L.model}
            value={model}
            onChange={onModel}
            options={models.map((m) => ({ value: m.id, label: m.name }))}
            allLabel={L.filterAll}
          />
          <FilterSelect
            label={L.method}
            value={method}
            onChange={onMethod}
            options={methods.map((m) => ({ value: m.id, label: m[strings.fieldMap.name] }))}
            allLabel={L.filterAll}
          />
        </>
      )}

      <FilterSelect
        label={L.filterYear}
        value={year}
        onChange={onYear}
        options={years.map((y) => ({ value: y, label: y }))}
        allLabel={L.filterAll}
      />

      {filtered && (
        <div className="ml-auto flex items-center gap-2.5">
          <span className="whitespace-nowrap text-[12px] text-faint">{matchText}</span>
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer whitespace-nowrap rounded-[8px] border border-line bg-hover px-2.5 py-1.5 text-[12px] text-muted transition hover:border-line-strong hover:text-ink"
          >
            {L.filterClear}
          </button>
        </div>
      )}
    </div>
  );
}
