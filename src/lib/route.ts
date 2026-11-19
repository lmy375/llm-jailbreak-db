import type { JailbreakView, Section, SystemView } from '../types';
import {
  emptyPromptFilters,
  emptySystemFilters,
  type PromptFilterState,
  type SystemFilterState,
} from './filters';

/** Everything the URL keeps so a refresh, share or back/forward restores it. */
export interface RouteState {
  section: Section;
  jailbreakView: JailbreakView;
  systemView: SystemView;
  activeMethod: string | null;
  openPrompt: string | null;
  openSys: string | null;
  query: string;
  promptFilters: PromptFilterState;
  systemFilters: SystemFilterState;
}

export const defaultRoute: RouteState = {
  section: 'jailbreak',
  jailbreakView: 'db',
  systemView: 'db',
  activeMethod: null,
  openPrompt: null,
  openSys: null,
  query: '',
  promptFilters: emptyPromptFilters(),
  systemFilters: emptySystemFilters(),
};

const isJailbreakView = (value: string): value is JailbreakView =>
  value === 'db' || value === 'method' || value === 'source';

const isSystemView = (value: string): value is SystemView =>
  value === 'db' || value === 'source';

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Multi-value filters travel as one comma-separated parameter. */
const list = (value: string | null): string[] =>
  value ? value.split(',').filter(Boolean) : [];

/**
 * Parses `#/<section>/<view>[/<id>]?<filters>`.
 *
 *   #/jailbreak/db?model=gemini&target=dan&year=2024,2025
 *   #/jailbreak/db/LJB-2025-0001?method=fake-test
 *   #/jailbreak/method/fake-test
 *   #/jailbreak/source
 *   #/system/db?vender=Microsoft&disclosure=leaked
 *   #/system/source
 *
 * Unknown segments fall back to the default route instead of throwing, so a
 * hand-edited or stale link still opens the site.
 */
export function parseRoute(hash: string): RouteState {
  const state: RouteState = {
    ...defaultRoute,
    promptFilters: emptyPromptFilters(),
    systemFilters: emptySystemFilters(),
  };
  const raw = hash.replace(/^#/, '');
  if (!raw) return state;

  const [pathPart, queryPart = ''] = raw.split('?');
  const parts = pathPart.split('/').filter(Boolean);
  const section = parts[0];

  if (section === 'jailbreak') {
    state.section = 'jailbreak';
    if (isJailbreakView(parts[1] ?? '')) {
      state.jailbreakView = parts[1] as JailbreakView;
      const id = parts[2] ? decode(parts[2]) : '';
      if (state.jailbreakView === 'db' && id) state.openPrompt = id;
      if (state.jailbreakView === 'method' && id) state.activeMethod = id;
    }
  } else if (section === 'system') {
    state.section = 'system';
    if (isSystemView(parts[1] ?? '')) {
      state.systemView = parts[1] as SystemView;
      if (state.systemView === 'db' && parts[2]) state.openSys = decode(parts[2]);
    }
  }

  const params = new URLSearchParams(queryPart);
  state.query = params.get('q') ?? '';
  if (state.section === 'jailbreak' && state.jailbreakView === 'db') {
    state.promptFilters = {
      model: list(params.get('model')),
      target: list(params.get('target')),
      method: list(params.get('method')),
      length: list(params.get('len')),
      quality: list(params.get('quality')),
      time: list(params.get('year')),
    };
  }
  if (state.section === 'system' && state.systemView === 'db') {
    state.systemFilters = {
      product: list(params.get('product')),
      vender: list(params.get('vender')),
      disclosureType: list(params.get('disclosure')),
      surface: list(params.get('surface')),
      length: list(params.get('len')),
      quality: list(params.get('quality')),
      time: list(params.get('year')),
    };
  }
  return state;
}

/** Serialises the state back to a hash, omitting values that are already default. */
export function buildRoute(state: RouteState): string {
  const view = state.section === 'jailbreak' ? state.jailbreakView : state.systemView;
  let path = `#/${state.section}/${view}`;

  if (state.section === 'jailbreak' && state.jailbreakView === 'db' && state.openPrompt) {
    path += `/${encodeURIComponent(state.openPrompt)}`;
  } else if (state.section === 'jailbreak' && state.jailbreakView === 'method' && state.activeMethod) {
    path += `/${encodeURIComponent(state.activeMethod)}`;
  } else if (state.section === 'system' && state.systemView === 'db' && state.openSys) {
    path += `/${encodeURIComponent(state.openSys)}`;
  }

  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  const put = (key: string, values: string[]) => {
    if (values.length) params.set(key, values.join(','));
  };
  if (state.section === 'jailbreak' && state.jailbreakView === 'db') {
    put('model', state.promptFilters.model);
    put('target', state.promptFilters.target);
    put('method', state.promptFilters.method);
    put('len', state.promptFilters.length);
    put('quality', state.promptFilters.quality);
    put('year', state.promptFilters.time);
  }
  if (state.section === 'system' && state.systemView === 'db') {
    put('product', state.systemFilters.product);
    put('vender', state.systemFilters.vender);
    put('disclosure', state.systemFilters.disclosureType);
    put('surface', state.systemFilters.surface);
    put('len', state.systemFilters.length);
    put('quality', state.systemFilters.quality);
    put('year', state.systemFilters.time);
  }

  const queryPart = params.toString();
  return queryPart ? `${path}?${queryPart}` : path;
}