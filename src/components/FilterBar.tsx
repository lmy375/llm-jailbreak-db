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
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[12px] border border-line bg-surface p-2">
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
          onChange={(event) => onQuery(event.target.value)}
          placeholder={strings.search.placeholder}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="w-full rounded-[9px] border border-line bg-hover py-2 pl-9 pr-3 text-[13.5px] text-ink outline-none transition placeholder:text-faint focus:border-accent/55 focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.14)]"
        />
      </label>

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