import type { LangStrings } from '../types';

interface Props {
  strings: LangStrings;
  query: string;
  onQuery: (query: string) => void;
  shown: number;
  total: number;
  /** True when the search box or any column filter narrows the listing. */
  filtered: boolean;
  onClear: () => void;
}

/**
 * Listing toolbar. Only the text search lives here; every field filter sits in
 * its own table header, so no filter is offered twice.
 */
export function FilterBar({ strings, query, onQuery, shown, total, filtered, onClear }: Props) {
  const L = strings.labels;
  const matchText = L.filterMatch.replace('{n}', String(shown)).replace('{total}', String(total));

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <label className="relative flex min-w-[240px] max-w-[640px] flex-1 items-center">
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="pointer-events-none absolute left-3.5 h-[15px] w-[15px] text-faint"
        >
          <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={strings.search.placeholder}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="w-full rounded-[12px] border border-transparent bg-hover py-[11px] pl-10 pr-3.5 text-[14px] text-ink outline-none transition-colors duration-200 placeholder:text-faint focus:border-accent/40 focus:bg-surface focus:ring-4 focus:ring-accent/10"
        />
      </label>

      {filtered && (
        <div className="ml-auto flex items-center gap-3">
          <span className="whitespace-nowrap text-[12px] text-faint">{matchText}</span>
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer whitespace-nowrap rounded-full bg-hover px-3 py-1.5 text-[12px] text-muted transition-colors duration-200 hover:bg-line hover:text-ink"
          >
            {L.filterClear}
          </button>
        </div>
      )}
    </div>
  );
}