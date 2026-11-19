import { useEffect, useMemo, useState } from 'react';
import type { DuplicateGroup, FilterRanges, LangStrings, SystemPrompt } from '../types';
import type { SystemFilterKey, SystemFilterState } from '../lib/filters';
import { rangeOptions, UNKNOWN_TIME } from '../lib/filters';
import { ColumnFilter } from './ColumnFilter';
import { Drawer } from './Drawer';
import { Icon } from './Icon';
import { MetaRow } from './MetaRow';
import { PromptBodyPanel } from './PromptBodyPanel';
import { QualityScore } from './QualityScore';

type SortKey =
  | 'id'
  | 'product'
  | 'vender'
  | 'disclosureType'
  | 'surface'
  | 'length'
  | 'quality'
  | 'time';

/** Enum columns and the values present in the unfiltered archive. */
export interface SystemFacets {
  products: string[];
  venders: string[];
  disclosures: string[];
  surfaces: string[];
  years: string[];
}

interface Props {
  prompts: SystemPrompt[];
  /** Fetches one body on demand; rejects when that language has no translation. */
  loadBody: (lang: string, systemPromptId: string) => Promise<string>;
  /** Current UI language key; picks note vs note_zh. */
  lang: string;
  /** UI languages in display order; drives the in-drawer language toggle. */
  languages: { key: string; label: string }[];
  /** Selected body language for a row; defaults to the UI language. */
  sideOf: (prompt: SystemPrompt) => string;
  onSide: (id: string, key: string) => void;
  strings: LangStrings;
  /** Row whose detail drawer is open; null when the drawer is closed. */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Duplicate clusters computed at build time; keyed by group id. */
  duplicateGroups?: DuplicateGroup[];
  /** Entry ids hidden because their body repeats another entry's body. */
  hiddenDuplicateIds?: Set<string>;
  /** Column selections; empty arrays mean the column is unfiltered. */
  filters: SystemFilterState;
  onFilter: (key: SystemFilterKey, values: string[]) => void;
  /** Unfiltered distinct values driving each column's menu. */
  facets: SystemFacets;
  /** Adds the "unconfirmed" option to the time filter. */
  hasUnknownTime: boolean;
  /** Numeric buckets for the length / quality filters. */
  ranges: FilterRanges;
}

function stripUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function SystemPromptDetail({
  prompt,
  loadBody,
  strings,
  lang,
  languages,
  side,
  onSide,
  group,
  onSelectEntry,
}: {
  prompt: SystemPrompt;
  loadBody: (lang: string, systemPromptId: string) => Promise<string>;
  strings: LangStrings;
  lang: string;
  languages: { key: string; label: string }[];
  side: string;
  onSide: (key: string) => void;
  group?: DuplicateGroup;
  onSelectEntry: (id: string) => void;
}) {
  const S = strings.sysPrompts;
  // Bodies arrive per language on demand; until they land the panel shows a
  // skeleton instead of a misleading empty box.
  const [bodies, setBodies] = useState<Record<string, string>>({});
  // Languages whose own body is absent; the panel badges them so a fallback
  // never reads as a bad translation.
  const [missing, setMissing] = useState<
    Record<string, { label: string; hint: string } | undefined>
  >({});
  const [loading, setLoading] = useState(true);
  const bodyId = prompt.system_prompt_id;
  // Languages never change identity while mounted; joining the keys keeps the
  // effect from re-firing on every parent render.
  const langKey = languages.map((l) => l.key).join('|');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setBodies({});
    (async () => {
      // Every language falls back to English, and English itself falls back to
      // any language that did load, so a missing translation never renders blank.
      const loaded = Object.fromEntries(
        await Promise.all(
          languages.map(async (l) => {
            const text = await loadBody(l.key, bodyId).catch(() => null);
            return [l.key, text] as const;
          })
        )
      ) as Record<string, string | null>;
      if (!alive) return;
      const fallbackKey =
        loaded['en'] != null ? 'en' : languages.find((l) => loaded[l.key] != null)?.key;
      const fallback = (fallbackKey ? loaded[fallbackKey] : '') || '';
      const fallbackLabel = languages.find((l) => l.key === fallbackKey)?.label ?? '';
      setBodies(
        Object.fromEntries(languages.map((l) => [l.key, loaded[l.key] || fallback]))
      );
      setMissing(
        Object.fromEntries(
          languages.map((l) => [
            l.key,
            loaded[l.key] != null
              ? undefined
              : {
                  label: strings.labels.missingBody.replace('{lang}', fallbackLabel),
                  hint: strings.labels.missingBodyHint.replace('{lang}', fallbackLabel),
                },
          ])
        )
      );
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyId, langKey, loadBody]);

  // Enum-valued fields carry a fixed set of values; map them to localised labels.
  const enumLabel = (field: string, value: string) =>
    S.enumLabels[field]?.[value] ?? value;
  const dup = prompt.duplicate;
  const others = (group?.members ?? []).filter((m) => m.id !== prompt.id);
  const noteText =
    lang === 'zh' ? prompt.note_zh || prompt.note : prompt.note || prompt.note_zh;

  return (
    <div className="flex min-w-0 flex-col gap-6 p-6 sm:p-7">
      {/* ---- meta block ---- */}
      <div className="flex min-w-0 flex-col gap-3">
        <MetaRow label={S.vender}>{prompt.vender}</MetaRow>
        <MetaRow label={S.time}>
          {prompt.time || <span className="text-faint">{S.timeUnknown}</span>}
        </MetaRow>
        <MetaRow label={S.disclosureType}>{enumLabel('disclosureType', prompt.disclosureType)}</MetaRow>
        <MetaRow label={S.surface}>{enumLabel('surface', prompt.surface)}</MetaRow>

        <MetaRow label={S.length}>
          {prompt.length ? (
            prompt.length.toLocaleString('en-US')
          ) : (
            <span className="text-faint">{S.lengthUnknown}</span>
          )}
        </MetaRow>
        <MetaRow label={S.quality}>
          <QualityScore value={prompt.quality_score} showMax label={S.quality} />
        </MetaRow>
        <MetaRow label={S.source}>
          <a
            href={prompt.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium break-all text-accent-ink hover:underline"
          >
            {stripUrl(prompt.source_url)}
            <Icon name="external" className="h-3 w-3 flex-none" />
          </a>
        </MetaRow>
        {noteText && <MetaRow label={S.note}>{noteText}</MetaRow>}
      </div>

      {/* ---- duplicate notice ---- */}
      {dup && group && (
        <section className="flex min-w-0 flex-col gap-2.5 rounded-[14px] bg-hover px-3 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent-ink">
              {S.duplicate}
            </span>
            <span className="text-[12px] text-muted">
              {dup.kind === 'near-identical' ? S.duplicateNearIdentical : S.duplicateContained}
            </span>
            <span className="font-mono text-[11px] text-faint">{dup.groupId}</span>
          </div>
          <p className="text-[12px] leading-relaxed text-muted">
            {S.duplicateNote
              .replace('{count}', String(others.length))
              .replace('{canonical}', group.canonical)}
          </p>
          {others.length > 0 && (
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.08em] text-faint">
                {S.duplicateMembers}
              </span>
              <ul className="flex flex-col gap-1">
                {others.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => onSelectEntry(m.id)}
                      className="group flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-left transition hover:bg-surface"
                    >
                      <span className="font-mono text-[11.5px] text-muted group-hover:text-accent-ink">
                        {m.id}
                      </span>
                      {m.canonical && (
                        <span className="rounded-full border border-line px-1.5 py-px text-[10px] text-faint">
                          {S.duplicateCanonical}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-faint">
                        {m.relation === 'contained'
                          ? `${S.duplicateContainment} ${Math.round(m.containment * 100)}%`
                          : `${S.duplicateSimilarity} ${Math.round(m.similarity * 100)}%`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ---- prompt body ---- */}
      <PromptBodyPanel
        label={S.body}
        note={
          prompt.length > 0
            ? `${prompt.length.toLocaleString('en-US')} ${S.lengthUnit}`
            : undefined
        }
        value={side}
        onChange={onSide}
        loading={loading}
        copyLabel={strings.labels.copy}
        copiedLabel={strings.labels.copied}
        sides={languages.map((l) => ({
          key: l.key,
          label: l.label,
          text: bodies[l.key] ?? '',
          missing: missing[l.key],
        }))}
      />
    </div>
  );
}

/** System prompt archive; clicking a row opens the full body in a drawer. */
export function SystemPromptView({
  prompts,
  loadBody,
  lang,
  languages,
  sideOf,
  onSide,
  strings,
  selectedId,
  onSelect,
  duplicateGroups = [],
  hiddenDuplicateIds,
  filters,
  onFilter,
  facets,
  hasUnknownTime,
  ranges,
}: Props) {
  // Default order: by id (LSP-<year>-<seq>) descending, i.e. newest first.
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'id',
    dir: 'desc',
  });
  // Repeats stay visible by default; collapsing them keeps one row per prompt.
  const [hideDuplicates, setHideDuplicates] = useState(false);
  const S = strings.sysPrompts;
  const L = strings.labels;
  // Enum-valued fields carry a fixed set of values; map them to localised labels.
  const enumLabel = (field: string, value: string) => S.enumLabels[field]?.[value] ?? value;

  const productOptions = useMemo(
    () => facets.products.map((product) => ({ value: product, label: product })),
    [facets.products]
  );
  const venderOptions = useMemo(
    () => facets.venders.map((vender) => ({ value: vender, label: vender })),
    [facets.venders]
  );
  const disclosureOptions = useMemo(
    () =>
      facets.disclosures.map((value) => ({
        value,
        label: enumLabel('disclosureType', value),
      })),
    [facets.disclosures, S.enumLabels]
  );
  const surfaceOptions = useMemo(
    () =>
      facets.surfaces.map((value) => ({
        value,
        label: enumLabel('surface', value),
      })),
    [facets.surfaces, S.enumLabels]
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
      ...facets.years.map((year) => ({ value: year, label: year })),
      ...(hasUnknownTime ? [{ value: UNKNOWN_TIME, label: L.timeUnknown }] : []),
    ],
    [facets.years, hasUnknownTime, L.timeUnknown]
  );

  const groupOfEntry = useMemo(() => {
    const map = new Map<string, DuplicateGroup>();
    for (const g of duplicateGroups) {
      for (const m of g.members) map.set(m.id, g);
    }
    return map;
  }, [duplicateGroups]);

  const visible = useMemo(() => {
    if (!hideDuplicates) return prompts;
    const ids = hiddenDuplicateIds ?? new Set<string>();
    return prompts.filter((p) => !ids.has(p.id));
  }, [prompts, hideDuplicates, hiddenDuplicateIds]);

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const val = (p: SystemPrompt): string => {
      switch (sort.key) {
        case 'product':
          return p.product.toLowerCase();
        case 'vender':
          return p.vender.toLowerCase();
        case 'disclosureType':
          return enumLabel('disclosureType', p.disclosureType).toLowerCase();
        case 'surface':
          return enumLabel('surface', p.surface).toLowerCase();
        case 'time':
          return p.time;
        case 'length':
          return String(p.length).padStart(8, '0');
        case 'quality':
          return String(p.quality_score).padStart(2, '0');
        default:
          return p.id;
      }
    };
    return [...visible]
      .sort((a, b) => val(a).localeCompare(val(b), undefined, { numeric: true }) * dir)
      // Entries with an unconfirmed date always sink to the bottom.
      .sort((a, b) => Number(Boolean(a.time)) - Number(Boolean(b.time)));
  }, [visible, sort, S.enumLabels]);

  const duplicateCount = useMemo(
    () => prompts.filter((p) => p.duplicate).length,
    [prompts]
  );

  const onSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );

  const selected = prompts.find((p) => p.id === selectedId) ?? null;


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
    filterKey?: SystemFilterKey;
    options?: { value: string; label: string }[];
    className?: string;
  }) => {
    const active = sort.key === sortKey;
    return (
      <th scope="col" className={`px-3 py-3 font-medium ${className}`}>
        <span className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onSort(sortKey)}
            title={L.sortBy}
            className="inline-flex min-w-0 cursor-pointer items-center gap-1 rounded transition hover:text-ink"
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
      <div className="flex flex-col gap-4">

      {duplicateCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-[14px] bg-hover px-4 py-2.5">
          <button
            type="button"
            onClick={() => setHideDuplicates((v) => !v)}
            aria-pressed={hideDuplicates}
            className={
              'cursor-pointer rounded-full px-3 py-1 text-[12px] transition ' +
              (hideDuplicates
                ? 'bg-surface font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                : 'text-muted hover:text-ink')
            }
          >
            {hideDuplicates ? S.duplicateShowAll : S.duplicateHideRepeats}
          </button>
          <span className="text-[12px] text-faint">
            {duplicateGroups.length} {S.duplicateGroupCount} · {duplicateCount} {S.duplicate}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] table-fixed border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-[11px] tracking-[0.02em] text-faint">
                {filterTh({ label: L.id, sortKey: 'id', className: 'w-[140px]' })}
                {filterTh({
                  label: S.product,
                  sortKey: 'product',
                  filterKey: 'product',
                  options: productOptions,
                  className: 'w-[25%]',
                })}
                {filterTh({
                  label: S.vender,
                  sortKey: 'vender',
                  filterKey: 'vender',
                  options: venderOptions,
                  className: 'w-[12%]',
                })}
                {filterTh({
                  label: S.disclosureType,
                  sortKey: 'disclosureType',
                  filterKey: 'disclosureType',
                  options: disclosureOptions,
                  className: 'w-[11%]',
                })}
                {filterTh({
                  label: S.surface,
                  sortKey: 'surface',
                  filterKey: 'surface',
                  options: surfaceOptions,
                  className: 'w-[11%]',
                })}
                {filterTh({
                  label: S.length,
                  sortKey: 'length',
                  filterKey: 'length',
                  options: lengthOptions,
                  className: 'w-[9%]',
                })}
                {filterTh({
                  label: S.quality,
                  sortKey: 'quality',
                  filterKey: 'quality',
                  options: qualityOptions,
                  className: 'w-[10%]',
                })}
                {filterTh({
                  label: S.time,
                  sortKey: 'time',
                  filterKey: 'time',
                  options: timeOptions,
                  className: 'w-[10%]',
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-[72px] text-center text-muted">
                    {S.empty}
                  </td>
                </tr>
              )}
              {sorted.map((p) => {
                const open = p.id === selectedId;
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
                      (open ? 'bg-accent-soft' : 'hover:bg-hover focus-visible:bg-hover')
                    }
                  >
                    <td className="px-3 py-3 align-middle whitespace-nowrap">
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
                    <td className="px-3 py-3 align-middle">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="block min-w-0 truncate font-medium text-ink" title={p.product}>
                          {p.product}
                        </span>
                        {p.duplicate && (
                          <span
                            title={`${S.duplicate} · ${p.duplicate.groupId}`}
                            className="shrink-0 rounded-full border border-line px-1.5 py-px font-mono text-[10px] text-faint"
                          >
                            {p.duplicate.groupId}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="truncate px-3 py-3 align-middle text-muted">{p.vender}</td>
                    <td className="px-3 py-3 align-middle whitespace-nowrap text-muted">
                      {enumLabel('disclosureType', p.disclosureType)}
                    </td>
                    <td className="px-3 py-3 align-middle whitespace-nowrap text-muted">
                      {enumLabel('surface', p.surface)}
                    </td>
                    <td className="px-3 py-3 align-middle font-mono text-[12px] whitespace-nowrap text-muted">
                      {p.length ? p.length.toLocaleString('en-US') : '—'}
                    </td>
                    <td className="px-3 py-3 align-middle whitespace-nowrap">
                      <QualityScore value={p.quality_score} label={S.quality} />
                    </td>
                    <td className="px-3 py-3 align-middle font-mono text-[12px] whitespace-nowrap text-faint">
                      {p.time || <span className="font-sans text-[11.5px]">{S.timeUnknown}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      <Drawer
        open={selected !== null}
        onClose={() => onSelect(null)}
        title={selected?.id ?? ''}
        closeLabel={strings.labels.close}
      >
        {selected && (
          <SystemPromptDetail
            key={selected.id}
            prompt={selected}
            loadBody={loadBody}
            strings={strings}
            lang={lang}
            languages={languages}
            side={sideOf(selected)}
            onSide={(key) => onSide(selected.id, key)}
            group={selected.duplicate ? groupOfEntry.get(selected.id) : undefined}
            onSelectEntry={onSelect}
          />
        )}
      </Drawer>
    </>
  );
}