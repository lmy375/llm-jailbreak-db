import { Fragment, useMemo, useState } from 'react';
import type { LangStrings, SystemPrompt } from '../types';

type SortKey = 'id' | 'product' | 'vender' | 'time' | 'words';

interface Props {
  prompts: SystemPrompt[];
  /** Raw bodies keyed by system_prompt_id, already switched to the UI language. */
  bodies: Record<string, string>;
  strings: LangStrings;
  expandedId: string | null;
  onExpand: (id: string) => void;
}

const COL_COUNT = 5;

function stripUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 text-[13px]">
      <span className="w-[104px] flex-none pt-[3px] text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-faint">
        {label}
      </span>
      <div className="min-w-0 flex-1 leading-[1.7] text-muted">{children}</div>
    </div>
  );
}

function SystemPromptDetail({
  prompt,
  body,
  strings,
}: {
  prompt: SystemPrompt;
  body: string;
  strings: LangStrings;
}) {
  const S = strings.sysPrompts;
  const extraEntries = Object.entries(prompt.extra ?? {});
  const labelFor = (key: string) => S.extraKeys[key] ?? key;
  // Some extra keys carry a fixed enum; map its value to a localised label.
  const valueFor = (key: string, value: string) =>
    S.enumLabels[key]?.[value] ?? value;

  return (
    <div className="flex min-w-0 flex-col gap-4 p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <MetaRow label={S.vender}>{prompt.vender}</MetaRow>
        <MetaRow label={S.time}>
          {prompt.time || <span className="text-faint">{S.timeUnknown}</span>}
        </MetaRow>
        <MetaRow label={S.words}>
          {prompt.words ? (
            prompt.words.toLocaleString('en-US')
          ) : (
            <span className="text-faint">{S.wordsUnknown}</span>
          )}
        </MetaRow>
        <MetaRow label={S.ljb}>
          {prompt.ljb_id ? (
            <span className="font-mono text-accent-ink">{prompt.ljb_id}</span>
          ) : (
            <span className="text-faint">{S.ljbNone}</span>
          )}
        </MetaRow>
      </div>

      {extraEntries.length > 0 && (
        <div className="grid gap-3 border-t border-line pt-3 md:grid-cols-2">
          {extraEntries.map(([key, value]) => (
            <MetaRow key={key} label={labelFor(key)}>
              {Array.isArray(value) ? (
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {value.map((u) => (
                    <a
                      key={u}
                      href={u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] text-accent-ink hover:underline"
                    >
                      {stripUrl(u)} ↗
                    </a>
))}
              </div>
            ) : (
              valueFor(key, value)
            )}
            </MetaRow>
          ))}
        </div>
      )}

      <MetaRow label={S.source}>
        <a
          href={prompt.source}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium break-all text-accent-ink hover:underline"
        >
          {stripUrl(prompt.source)} ↗
        </a>
      </MetaRow>

      <div className="overflow-hidden rounded-[10px] border border-line bg-pre-bg">
        <div className="border-b border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
          {S.body}
          {prompt.words > 0 && (
            <span className="ml-2 normal-case tracking-normal text-faint/80">
              {prompt.words.toLocaleString('en-US')} words
            </span>
          )}
        </div>
        {/* Raw prompt text: whitespace preserved, never parsed as markup. */}
        <pre className="m-0 max-h-[620px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-[1.7] text-pre-ink">
          {body}
        </pre>
      </div>
    </div>
  );
}

/** System prompt archive; rows expand in place to reveal the full body. */
export function SystemPromptView({
  prompts,
  bodies,
  strings,
  expandedId,
  onExpand,
}: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'time',
    dir: 'desc',
  });
  const S = strings.sysPrompts;

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
    return [...prompts]
      .sort((a, b) => val(a).localeCompare(val(b), undefined, { numeric: true }) * dir)
      // Entries with an unconfirmed date always sink to the bottom.
      .sort((a, b) => Number(Boolean(a.time)) - Number(Boolean(b.time)));
  }, [prompts, sort]);

  const onSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );

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
    <div className="flex flex-col gap-4">
      <p className="max-w-[880px] text-[13px] leading-[1.75] text-muted">{S.intro}</p>

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
                const open = p.id === expandedId;
                const body = bodies[p.system_prompt_id] ?? '';
                return (
                  <Fragment key={p.id}>
                    <tr
                      tabIndex={0}
                      aria-expanded={open}
                      onClick={() => onExpand(p.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onExpand(p.id);
                        }
                      }}
                      className={
                        'cursor-pointer border-b border-line outline-none transition-colors ' +
                        (open ? 'bg-accent-soft' : 'hover:bg-hover focus-visible:bg-hover')
                      }
                    >
                      <td className="px-4 py-2.5 align-middle whitespace-nowrap">
                        <span className="flex items-center gap-1.5 font-mono text-[12px] text-muted">
                          <span
                            aria-hidden="true"
                            className={
                              'inline-block text-[9px] transition-transform ' +
                              (open ? 'rotate-90 text-accent' : 'text-faint')
                            }
                          >
                            ▶
                          </span>
                          {p.id}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 align-middle">
                        <span
                          className="block max-w-[20rem] truncate font-medium text-ink"
                          title={p.product}
                        >
                          {p.product}
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
                    {open && (
                      <tr className="border-b border-line">
                        <td colSpan={COL_COUNT} className="bg-sunken p-0">
                          <SystemPromptDetail prompt={p} body={body} strings={strings} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}