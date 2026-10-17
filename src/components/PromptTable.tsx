import { Fragment, useMemo, useState } from 'react';
import type { LangStrings, ModelEntry, Prompt, PromptSide, JailbreakMethod } from '../types';
import { PromptDetail } from './PromptDetail';

type SortKey = 'id' | 'model' | 'title' | 'method' | 'time';

interface Props {
  prompts: Prompt[];
  methodMap: Map<string, JailbreakMethod>;
  modelMap: Map<string, ModelEntry>;
  strings: LangStrings;
  sideOf: (prompt: Prompt) => PromptSide;
  onSide: (id: string, side: PromptSide) => void;
  /** Accordion: at most one row is expanded at a time. */
  expandedId: string | null;
  onExpand: (id: string) => void;
  onOpenMethod: (id: string) => void;
}

const COL_COUNT = 5;

/** Database-table style listing; rows expand in place to show full details. */
export function PromptTable({
  prompts,
  methodMap,
  modelMap,
  strings,
  sideOf,
  onSide,
  expandedId,
  onExpand,
  onOpenMethod,
}: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'id',
    dir: 'asc',
  });
  // Prompt-body expand state of the currently open row (accordion ⇒ one is enough).
  const [promptOpen, setPromptOpen] = useState(false);
  const fm = strings.fieldMap;
  const modelNameOf = (p: Prompt) => modelMap.get(p.model_id)?.name ?? p.model_id;

  const toggleRow = (id: string) => {
    onExpand(id);
    setPromptOpen(false);
  };

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const val = (p: Prompt): string => {
      switch (sort.key) {
        case 'model':
          return modelNameOf(p).toLowerCase();
        case 'title':
          return String(p[fm.title]).toLowerCase();
        case 'method': {
          const t = methodMap.get(p.jailbreak_method);
          return String(t ? t[fm.name] : p.jailbreak_method).toLowerCase();
        }
        case 'time':
          return p.time;
        default:
          return p.id;
      }
    };
    return [...prompts].sort(
      (a, b) => val(a).localeCompare(val(b), undefined, { numeric: true }) * dir
    );
  }, [prompts, sort, fm, methodMap, modelMap]);

  const onSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );

  if (!prompts.length) {
    return (
      <div className="rounded-[12px] border border-dashed border-line-strong px-5 py-[60px] text-center text-muted">
        {strings.labels.empty}
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
          <span
            aria-hidden="true"
            className={active ? 'text-accent' : 'text-faint'}
          >
            {active ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
          </span>
        </button>
      </th>
    );
  };

  return (
    <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-line bg-hover text-[11px] uppercase tracking-[0.08em] text-faint">
              <SortTh label={strings.labels.id} sortKey="id" className="w-[104px]" />
              <SortTh label={strings.labels.model} sortKey="model" className="w-[150px]" />
              <SortTh label={strings.labels.title} sortKey="title" />
              <SortTh
                label={strings.labels.method}
                sortKey="method"
                className="hidden w-[160px] md:table-cell"
              />
              <SortTh label={strings.labels.time} sortKey="time" className="w-[92px]" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const open = p.id === expandedId;
              const method = methodMap.get(p.jailbreak_method);
              const methodName = method ? method[fm.name] : p.jailbreak_method;
              return (
                <Fragment key={p.id}>
                  <tr
                    tabIndex={0}
                    aria-expanded={open}
                    onClick={() => toggleRow(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleRow(p.id);
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
                    <td className="px-4 py-2.5 align-middle whitespace-nowrap text-ink">
                      {modelNameOf(p)}
                    </td>
                    <td className="px-4 py-2.5 align-middle">
                      <span className="block max-w-[24rem] truncate font-medium text-ink" title={String(p[fm.title])}>
                        {p[fm.title]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-2.5 align-middle whitespace-nowrap text-muted md:table-cell">
                      {methodName}
                    </td>
                    <td className="px-4 py-2.5 align-middle font-mono text-[12px] whitespace-nowrap text-faint">
                      {p.time}
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-line">
                      <td colSpan={COL_COUNT} className="bg-sunken p-0">
                        <PromptDetail
                          prompt={p}
                          method={method}
                          strings={strings}
                          side={sideOf(p)}
                          expanded={promptOpen}
                          onSide={(s) => onSide(p.id, s)}
                          onExpand={() => setPromptOpen((v) => !v)}
                          onOpenMethod={() => onOpenMethod(p.jailbreak_method)}
                        />
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
  );
}
