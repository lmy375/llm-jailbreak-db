import { useEffect, useMemo, useState } from 'react';
import type { DuplicateGroup, LangStrings, SystemPrompt } from '../types';
import { Drawer } from './Drawer';
import { MetaRow } from './MetaRow';
import { PromptBodyPanel } from './PromptBodyPanel';

type SortKey = 'id' | 'product' | 'vender' | 'time' | 'words';

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
      // English is the fallback for any language that has not been translated.
      const en = await loadBody('en', bodyId).catch(() => '');
      if (!alive) return;
      setBodies({ en });
      const others = await Promise.all(
        languages
          .filter((l) => l.key !== 'en')
          .map(async (l) => {
            const text = await loadBody(l.key, bodyId).catch(() => null);
            return [l.key, text ?? en] as const;
          })
      );
      if (!alive) return;
      setBodies({ en, ...Object.fromEntries(others) });
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

  return (
    <div className="flex min-w-0 flex-col gap-5 p-5">
      {/* ---- meta block ---- */}
      <div className="flex min-w-0 flex-col gap-3">
        <MetaRow label={S.vender}>{prompt.vender}</MetaRow>
        <MetaRow label={S.time}>
          {prompt.time || <span className="text-faint">{S.timeUnknown}</span>}
        </MetaRow>
        <MetaRow label={S.disclosureType}>{enumLabel('disclosureType', prompt.disclosureType)}</MetaRow>
        <MetaRow label={S.surface}>{enumLabel('surface', prompt.surface)}</MetaRow>
        {prompt.note && <MetaRow label={S.note}>{lang === 'zh' ? prompt.note_zh : prompt.note}</MetaRow>}
        <MetaRow label={S.words}>
          {prompt.words ? (
            prompt.words.toLocaleString('en-US')
          ) : (
            <span className="text-faint">{S.wordsUnknown}</span>
          )}
        </MetaRow>
        <MetaRow label={S.source}>
          <a
            href={prompt.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium break-all text-accent-ink hover:underline"
          >
            {stripUrl(prompt.source_url)} ↗
          </a>
        </MetaRow>
      </div>

      {/* ---- duplicate notice ---- */}
      {dup && group && (
        <section className="flex min-w-0 flex-col gap-2.5 rounded-[10px] border border-line bg-hover px-3.5 py-3">
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
        note={prompt.words > 0 ? `${prompt.words.toLocaleString('en-US')} words` : undefined}
        value={side}
        onChange={onSide}
        loading={loading}
        sides={languages.map((l) => ({
          key: l.key,
          label: l.label,
          text: bodies[l.key] ?? '',
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
}: Props) {
  // Default order: by id (LSP-<year>-<seq>) descending, i.e. newest first.
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'id',
    dir: 'desc',
  });
  // Repeats stay visible by default; collapsing them keeps one row per prompt.
  const [hideDuplicates, setHideDuplicates] = useState(false);
  const S = strings.sysPrompts;

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
        case 'time':
          return p.time;
        case 'words':
          return String(p.words).padStart(8, '0');
        default:
          return p.id;
      }
    };
    return [...visible]
      .sort((a, b) => val(a).localeCompare(val(b), undefined, { numeric: true }) * dir)
      // Entries with an unconfirmed date always sink to the bottom.
      .sort((a, b) => Number(Boolean(a.time)) - Number(Boolean(b.time)));
  }, [visible, sort]);

  const duplicateCount = useMemo(
    () => prompts.filter((p) => p.duplicate).length,
    [prompts]
  );

  const onSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );

  const selected = prompts.find((p) => p.id === selectedId) ?? null;
  if (!prompts.length) {
    return (
      <div className="rounded-[12px] border border-dashed border-line-strong px-5 py-[60px] text-center text-muted">
        {S.empty}
      </div>
    );
  }

  const SortTh = ({
    label,
    sortKey,
    className = '',
  }: {
    label: string;
    sortKey: SortKey;
    className?: string;
  }) => {
    const active = sort.key === sortKey;
    return (
      <th scope="col" className={`px-4 py-2.5 font-medium ${className}`}>
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          title={strings.labels.sortBy}
          className="inline-flex cursor-pointer items-center gap-1 rounded transition hover:text-ink"
        >
          {label}
          <span aria-hidden="true" className={active ? 'text-accent' : 'text-faint'}>
            {active ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
          </span>
        </button>
      </th>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4">

      {duplicateCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-line bg-surface px-4 py-2.5">
          <button
            type="button"
            onClick={() => setHideDuplicates((v) => !v)}
            aria-pressed={hideDuplicates}
            className={
              'cursor-pointer rounded-full border px-3 py-1 text-[12px] transition ' +
              (hideDuplicates
                ? 'border-accent/40 bg-accent/15 text-accent-ink'
                : 'border-line text-muted hover:text-ink')
            }
          >
            {hideDuplicates ? S.duplicateShowAll : S.duplicateHideRepeats}
          </button>
          <span className="text-[12px] text-faint">
            {duplicateGroups.length} {S.duplicateGroupCount} · {duplicateCount} {S.duplicate}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[660px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-hover text-[11px] uppercase tracking-[0.08em] text-faint">
                <SortTh label={strings.labels.id} sortKey="id" className="w-[104px]" />
                <SortTh label={S.product} sortKey="product" className="w-[210px]" />
                <SortTh label={S.vender} sortKey="vender" className="hidden w-[150px] md:table-cell" />
                <SortTh label={S.words} sortKey="words" className="hidden w-[84px] md:table-cell" />
                <SortTh label={S.time} sortKey="time" className="w-[112px]" />
              </tr>
            </thead>
            <tbody>
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
                    <td className="px-4 py-2.5 align-middle whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-mono text-[12px] text-muted">
                        <span
                          aria-hidden="true"
                          className={
                            'inline-block transition ' +
                            (open
                              ? 'text-accent'
                              : 'text-faint group-hover:text-accent group-focus-visible:text-accent')
                          }
                        >
                          ›
                        </span>
                        {p.id}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 align-middle">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="block max-w-[18rem] truncate font-medium text-ink" title={p.product}>
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
                    <td className="hidden max-w-[150px] truncate px-4 py-2.5 align-middle text-muted md:table-cell">
                      {p.vender}
                    </td>
                    <td className="hidden px-4 py-2.5 align-middle font-mono text-[12px] whitespace-nowrap text-muted md:table-cell">
                      {p.words ? p.words.toLocaleString('en-US') : '—'}
                    </td>
                    <td className="px-4 py-2.5 align-middle font-mono text-[12px] whitespace-nowrap text-faint">
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