import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ColumnOption } from '../lib/filters';
import type { LangStrings } from '../types';
import { Icon } from './Icon';

interface Props {
  strings: LangStrings;
  /** Column name, used for the trigger's accessible label. */
  label: string;
  options: ColumnOption[];
  /** Selected option values; empty means no filter on this column. */
  selected: string[];
  onChange: (values: string[]) => void;
  /** Current sort direction for this column, null when another column sorts. */
  sortDir: 'asc' | 'desc' | null;
  onSort: (dir: 'asc' | 'desc') => void;
}

/**
 * Header-cell filter control: a funnel button that opens a multi-select menu
 * with the column's values, a search box for long lists, and both sort
 * directions. Living in the header avoids a second filter bar above the table.
 */
export function ColumnFilter({
  strings,
  label,
  options,
  selected,
  onChange,
  sortDir,
  onSort,
}: Props) {
  const L = strings.labels;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  // Rapid successive clicks batch their renders, so each toggle must build on
  // the value emitted by the previous one rather than the stale prop.
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const emit = (values: string[]) => {
    selectedRef.current = values;
    onChange(values);
  };
  const searchable = options.length > 8;

  const visibleOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q)
    );
  }, [options, search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onViewportChange = (event: Event) => {
      if (event.type === 'scroll' && event.target instanceof Node && menuRef.current?.contains(event.target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    };
  }, [open]);

  // The menu is portalled so the table's overflow clipping cannot cut it off;
  // it is measured while hidden and then pinned under (or above) its trigger.
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const rect = trigger.getBoundingClientRect();
    const width = menu.offsetWidth || 288;
    const height = menu.offsetHeight || 360;
    const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));
    const below = rect.bottom + 6;
    const top =
      below + height > window.innerHeight - 8
        ? Math.max(8, rect.top - height - 6)
        : below;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.visibility = 'visible';
  }, [open]);

  const toggle = (value: string) => {
    const next = new Set(selectedRef.current);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    emit(options.filter((option) => next.has(option.value)).map((option) => option.value));
  };

  const sortButton = (dir: 'asc' | 'desc', text: string) => {
    const active = sortDir === dir;
    return (
      <button
        type="button"
        onClick={() => onSort(dir)}
        aria-pressed={active}
        className={
          'inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-[9px] px-2 py-1.5 text-[12px] transition ' +
          (active
            ? 'bg-surface font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
            : 'text-muted hover:text-ink')
        }
      >
        <Icon name={dir === 'asc' ? 'arrowUp' : 'arrowDown'} className="h-3 w-3" />
        {text}
      </button>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${L.filterColumn} · ${label}`}
        title={`${L.filterColumn} · ${label}`}
        onClick={() => setOpen((value) => !value)}
        className={
          'inline-flex flex-none cursor-pointer items-center gap-0.5 rounded-full p-1 transition ' +
          (selected.length > 0
            ? 'text-accent-ink'
            : 'text-faint hover:bg-hover hover:text-ink')
        }
      >
        <Icon name="filter" className="h-3.5 w-3.5" />
        {selected.length > 0 && (
          <span className="rounded-full bg-accent/12 px-1.5 py-px text-[10px] font-medium leading-4 text-accent-ink">
            {selected.length}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="dialog"
            aria-label={`${L.filterColumn} · ${label}`}
            style={{ position: 'fixed', width: 288, visibility: 'hidden' }}
            className="z-[60] max-h-[420px] max-w-[calc(100vw-16px)] overflow-hidden rounded-[16px] border border-line bg-surface p-2 shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center gap-1 rounded-[10px] bg-hover p-0.5">
              {sortButton('asc', L.sortAsc)}
              {sortButton('desc', L.sortDesc)}
            </div>

            {searchable && (
              <label className="mt-2 flex items-center gap-1.5 rounded-[9px] bg-hover px-2.5">
                <Icon name="filter" className="h-3 w-3 flex-none text-faint" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={L.filterSearch}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent py-1.5 text-[12.5px] text-ink outline-none placeholder:text-faint"
                />
              </label>
            )}

            <div className="mt-1.5 max-h-[240px] overflow-y-auto overscroll-contain">
              {visibleOptions.length === 0 && (
                <p className="px-2 py-3 text-center text-[12px] text-faint">{L.filterNoOptions}</p>
              )}
              {visibleOptions.map((option) => {
                const checked = selectedSet.has(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 transition hover:bg-hover"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(option.value)}
                      className="h-3.5 w-3.5 flex-none cursor-pointer accent-[var(--c-accent)]"
                    />
                    <span
                      className={
                        'truncate text-[12.5px] ' + (checked ? 'font-medium text-ink' : 'text-muted')
                      }
                      title={option.label}
                    >
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-line pt-2">
              <button
                type="button"
                onClick={() => emit(options.map((option) => option.value))}
                className="cursor-pointer rounded-full px-2.5 py-1 text-[12px] text-muted transition hover:bg-hover hover:text-ink"
              >
                {L.filterSelectAll}
              </button>
              <button
                type="button"
                onClick={() => emit([])}
                disabled={selected.length === 0}
                className="cursor-pointer rounded-full px-2.5 py-1 text-[12px] text-muted transition hover:bg-hover hover:text-ink disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
              >
                {L.filterClearColumn}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}