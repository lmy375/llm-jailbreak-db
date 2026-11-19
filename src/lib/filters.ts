import type { RangeBucket } from '../types';

/** Every enum / range selection for the jailbreak listing; empty array = all. */
export interface PromptFilterState {
  model: string[];
  target: string[];
  method: string[];
  length: string[];
  quality: string[];
  time: string[];
}

export type PromptFilterKey = keyof PromptFilterState;

/** Every enum / range selection for the system-prompt listing. */
export interface SystemFilterState {
  product: string[];
  vender: string[];
  disclosureType: string[];
  surface: string[];
  length: string[];
  quality: string[];
  time: string[];
}

export type SystemFilterKey = keyof SystemFilterState;

/** Selected value standing for entries whose date is still unconfirmed. */
export const UNKNOWN_TIME = 'unknown';

export const emptyPromptFilters = (): PromptFilterState => ({
  model: [],
  target: [],
  method: [],
  length: [],
  quality: [],
  time: [],
});

export const emptySystemFilters = (): SystemFilterState => ({
  product: [],
  vender: [],
  disclosureType: [],
  surface: [],
  length: [],
  quality: [],
  time: [],
});

export const hasPromptFilters = (f: PromptFilterState): boolean =>
  Object.values(f).some((values) => values.length > 0);

export const hasSystemFilters = (f: SystemFilterState): boolean =>
  Object.values(f).some((values) => values.length > 0);

/** Distinct 4-digit years, newest first; unconfirmed dates are skipped. */
export function collectYears(times: string[]): string[] {
  const years = new Set<string>();
  for (const time of times) {
    const year = time.slice(0, 4);
    if (/^\d{4}$/.test(year)) years.add(year);
  }
  return [...years].sort((a, b) => b.localeCompare(a));
}

export const hasUnknownTime = (times: string[]): boolean => times.some((time) => !time);

export function sortedUnique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

/** Value matches when it sits in any selected bucket; no selection matches all. */
export function matchesRanges(
  value: number,
  selected: string[],
  ranges: RangeBucket[]
): boolean {
  if (!selected.length || !ranges.length) return true;
  // Unknown bucket ids (e.g. a link shared before the buckets changed) are
  // ignored rather than filtering everything out.
  const known = selected
    .map((id) => ranges.find((candidate) => candidate.id === id))
    .filter((range): range is RangeBucket => Boolean(range));
  if (!known.length) return true;
  return known.some((range) => value >= range.min && value <= range.max);
}

export function matchesTime(time: string, selected: string[]): boolean {
  if (!selected.length) return true;
  return selected.some((id) => (id === UNKNOWN_TIME ? !time : time.startsWith(id)));
}

export interface ColumnOption {
  value: string;
  label: string;
}

/** Joins the language-neutral thresholds with the current language's labels. */
export function rangeOptions(
  ranges: RangeBucket[],
  labels: Record<string, string> | undefined
): ColumnOption[] {
  return ranges.map((range) => ({ value: range.id, label: labels?.[range.id] ?? range.id }));
}