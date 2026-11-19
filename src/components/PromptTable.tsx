import { useMemo, useState } from 'react';
import type {
  FilterRanges,
  JailbreakMethod,
  LangStrings,
  ModelEntry,
  Prompt,
  PromptBody,
  PromptSide,
  TargetEntry,
} from '../types';
import type { PromptFilterKey, PromptFilterState } from '../lib/filters';
import { rangeOptions, UNKNOWN_TIME } from '../lib/filters';
import { ColumnFilter } from './ColumnFilter';
import { Drawer } from './Drawer';
import { Icon } from './Icon';
import { PromptDetail } from './PromptDetail';
import { QualityScore } from './QualityScore';

type SortKey = 'id' | 'title' | 'model' | 'target' | 'method' | 'length' | 'quality' | 'time';

interface Props {
  prompts: Prompt[];
  /** Fetches one entry's two language sides when its drawer opens. */
  loadPromptBody: (id: string) => Promise<PromptBody>;
  methodMap: Map<string, JailbreakMethod>;
  modelMap: Map<string, ModelEntry>;
  targetMap: Map<string, TargetEntry>;
  strings: LangStrings;
  sideOf: (prompt: Prompt) => PromptSide;
  onSide: (id: string, side: PromptSide) => void;
  /** Row whose detail drawer is open; null when the drawer is closed. */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpenMethod: (id: string) => void;
  /** Column selections; empty arrays mean the column is unfiltered. */
  filters: PromptFilterState;
  onFilter: (key: PromptFilterKey, values: string[]) => void;
  /** Years present in the unfiltered archive, newest first. */
  years: string[];
  /** Adds the "unconfirmed" option to the time filter. */
  hasUnknownTime: boolean;
  /** Numeric buckets for the length / quality filters. */
  ranges: FilterRanges;
}

/** Database-table style listing; clicking a row opens its detail in a drawer. */
export function PromptTable({
  prompts,
  loadPromptBody,
  methodMap,
  modelMap,
  targetMap,
  strings,
  sideOf,
  onSide,
  selectedId,
  onSelect,
  onOpenMethod,
  filters,
  onFilter,
  years,
  hasUnknownTime,
  ranges,
}: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'id',
    dir: 'desc',
  });
  const L = strings.labels;
  const fm = strings.fieldMap;
  const modelNameOf = (p: Prompt) => modelMap.get(p.model_id)?.name ?? p.model_id;
  const targetNameOf = (p: Prompt) => {
    const target = targetMap.get(p.target);
    return target ? target[fm.name] || target[fm.nameAlt] : p.target;
  };
  const selected = prompts.find((p) => p.id === selectedId) ?? null;

  const modelOptions = useMemo(
    () => [...modelMap.values()].map((model) => ({ value: model.id, label: model.name })),
    [modelMap]
  );
  const targetOptions = useMemo(
    () =>
      [...targetMap.values()].map((target) => ({
        value: target.id,
        label: target[fm.name] || target[fm.nameAlt],
      })),
    [targetMap, fm]
  );
  const methodOptions = useMemo(
    () =>
      [...methodMap.values()].map((method) => ({
        value: method.id,
        label: method[fm.name] || method[fm.nameAlt],
      })),
    [methodMap, fm]
  );
  const lengthOptions = useMemo(
    () => rangeOptions(ranges.length, L.filterRangeLabels.length),
    [ranges.length, L.filterRangeLabels.length]
  );
  const qualityOptions = useMemo(
    () => rangeOptions(ranges.quality, L.filterRangeLabels.quality),
    [ranges.quality, L.filterRangeLabels.quality]
  );
  const timeOptions = useMemo(
    () => [
      ...years.map((year) => ({ value: year, label: year })),
      ...(hasUnknownTime ? [{ value: UNKNOWN_TIME, label: L.timeUnknown }] : []),
    ],
    [years, hasUnknownTime, L.timeUnknown]
  );

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const val = (p: Prompt): string => {
      switch (sort.key) {
        case 'model':
          return modelNameOf(p).toLowerCase();
        case 'title':
          return String(p[fm.title] || p[fm.titleAlt] || '').toLowerCase();
        case 'target':
          return targetNameOf(p).toLowerCase();
        case 'method': {
          const method = methodMap.get(p.jailbreak_method);
          return String(method ? method[fm.name] || method[fm.nameAlt] : p.jailbreak_method).toLowerCase();
        }
        case 'length':
          return String(p.length).padStart(8, '0');
        case 'time':
          return p.time;
        case 'quality':
          return String(p.quality_score).padStart(2, '0');
        default:
          return p.id;
      }
    };
    return [...prompts]
      .sort((a, b) => val(a).localeCompare(val(b), undefined, { numeric: true }) * dir)
      // Entries with an unconfirmed date always sink to the bottom.
      .sort((a, b) => Number(Boolean(a.time)) - Number(Boolean(b.time)));
  }, [prompts, sort, fm, methodMap, modelMap, targetMap]);

  const onSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );


  // Plain render helper, not a nested component: a nested component type would
  // remount on every filter change and close the open menu after one click.
  const filterTh = ({
    label,
    sortKey,
    filterKey,
    options,
    className = '',
  }: {
    label: string;
    sortKey: SortKey;
    filterKey?: PromptFilterKey;
    options?: { value: string; label: string }[];
    className?: string;
  }) => {
    const active = sort.key === sortKey;
    return (
      <th scope="col" className={`px-3 py-[10px] font-medium ${className}`}>
        <span className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onSort(sortKey)}
            title={L.sortBy}
            className="inline-flex min-w-0 cursor-pointer items-center gap-1 rounded whitespace-nowrap transition-colors duration-150 hover:text-ink"
          >
            <span className="truncate">{label}</span>
            <Icon
              name={active ? (sort.dir === 'asc' ? 'arrowUp' : 'arrowDown') : 'sort'}
              className={
                'h-3 w-3 flex-none ' + (active ? 'text-accent' : 'text-faint')
              }
            />
          </button>
          {filterKey && options && (
            <ColumnFilter
              strings={strings}
              label={label}
              options={options}
              selected={filters[filterKey]}
              onChange={(values) => onFilter(filterKey, values)}
              sortDir={active ? sort.dir : null}
              onSort={(dir) => setSort({ key: sortKey, dir })}
            />
          )}
        </span>
      </th>
    );
  };

  return (
    <>
      <div className="overflow-clip rounded-card border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="table-scroll overflow-x-auto">
          <table className="data-table w-full min-w-[1040px] table-fixed border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[10.5px] uppercase tracking-[0.07em] text-muted">
                {filterTh({ label: L.id, sortKey: 'id', className: 'w-[124px]' })}
                {filterTh({ label: L.title, sortKey: 'title', className: 'w-[23%]' })}
                {filterTh({
                  label: L.model,
                  sortKey: 'model',
                  filterKey: 'model',
                  options: modelOptions,
                  className: 'w-[11%]',
                })}
                {filterTh({
                  label: L.targetHeader,
                  sortKey: 'target',
                  filterKey: 'target',
                  options: targetOptions,
                  className: 'w-[13%]',
                })}
                {filterTh({
                  label: L.method,
                  sortKey: 'method',
                  filterKey: 'method',
                  options: methodOptions,
                  className: 'w-[17%]',
                })}
                {filterTh({
                  label: L.length,
                  sortKey: 'length',
                  filterKey: 'length',
                  options: lengthOptions,
                  className: 'w-[9%]',
                })}
                {filterTh({
                  label: L.quality,
                  sortKey: 'quality',
                  filterKey: 'quality',
                  options: qualityOptions,
                  className: 'w-[10%]',
                })}
                {filterTh({
                  label: L.time,
                  sortKey: 'time',
                  filterKey: 'time',
                  options: timeOptions,
                  className: 'w-[9%]',
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-[72px] text-center text-muted">
                    {L.empty}
                  </td>
                </tr>
              )}
              {sorted.map((p) => {
                const open = p.id === selectedId;
                const method = methodMap.get(p.jailbreak_method);
                const methodName = method
                  ? method[fm.name] || method[fm.nameAlt]
                  : p.jailbreak_method;
                const title = p[fm.title] || p[fm.titleAlt] || '';
                return (
                  <tr
                    key={p.id}
                    tabIndex={0}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    onClick={() => onSelect(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(p.id);
                      }
                    }}
                    className={
                      'group cursor-pointer border-b border-line outline-none transition-colors ' +
                      (open
                        ? 'row-open bg-accent-soft'
                        : 'hover:bg-hover focus-visible:bg-hover')
                    }
                  >
                    <td className="px-3 py-[11px] align-middle whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-mono text-[12px] text-muted">
                        <Icon
                          name="chevronRight"
                          className={
                            'h-3 w-3 flex-none transition ' +
                            (open
                              ? 'text-accent'
                              : 'text-faint group-hover:text-accent group-focus-visible:text-accent')
                          }
                        />
                        {p.id}
                      </span>
                    </td>
                    <td className="px-3 py-[11px] align-middle">
                      <span className="block w-full truncate font-medium text-ink" title={title}>
                        {title}
                      </span>
                    </td>
                    <td className="truncate px-3 py-[11px] align-middle text-ink" title={modelNameOf(p)}>
                      {modelNameOf(p)}
                    </td>
                    <td className="truncate px-3 py-[11px] align-middle text-muted" title={targetNameOf(p)}>
                      {targetNameOf(p)}
                    </td>
                    <td className="px-3 py-[11px] align-middle whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMethod(p.jailbreak_method);
                        }}
                        className="group/method inline-flex w-full cursor-pointer items-center gap-1 rounded text-muted transition hover:text-accent-ink"
                      >
                        <span className="truncate" title={methodName}>{methodName}</span>
                        <Icon
                          name="chevronRight"
                          className="h-3 w-3 flex-none text-faint opacity-0 transition-opacity group-hover/method:opacity-100"
                        />
                      </button>
                    </td>
                    <td className="px-3 py-[11px] align-middle font-mono text-[12px] whitespace-nowrap text-muted">
                      {p.length ? p.length.toLocaleString('en-US') : '—'}
                    </td>
                    <td className="px-3 py-[11px] align-middle whitespace-nowrap">
                      <QualityScore value={p.quality_score} label={L.quality} />
                    </td>
                    <td className="px-3 py-[11px] align-middle font-mono text-[12px] whitespace-nowrap text-faint">
                      {p.time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={selected !== null}
        onClose={() => onSelect(null)}
        title={selected?.id ?? ''}
        closeLabel={L.close}
      >
        {selected && (
          <PromptDetail
            key={selected.id}
            prompt={selected}
            loadPromptBody={loadPromptBody}
            method={methodMap.get(selected.jailbreak_method)}
            target={targetMap.get(selected.target)}
            strings={strings}
            side={sideOf(selected)}
            onSide={(s) => onSide(selected.id, s)}
            onOpenMethod={() => onOpenMethod(selected.jailbreak_method)}
          />
        )}
      </Drawer>
    </>
  );
}