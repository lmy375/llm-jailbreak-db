import type { JailbreakView, Section, SystemView } from '../types';

/** Everything the URL keeps so a refresh, share or back/forward restores it. */
export interface RouteState {
  section: Section;
  jailbreakView: JailbreakView;
  systemView: SystemView;
  activeMethod: string | null;
  openPrompt: string | null;
  openSys: string | null;
  query: string;
  modelFilter: string;
  methodFilter: string;
  venderFilter: string;
  yearFilter: string;
}

export const defaultRoute: RouteState = {
  section: 'jailbreak',
  jailbreakView: 'db',
  systemView: 'db',
  activeMethod: null,
  openPrompt: null,
  openSys: null,
  query: '',
  modelFilter: '',
  methodFilter: '',
  venderFilter: '',
  yearFilter: '',
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

/**
 * Parses `#/<section>/<view>[/<id>]?<filters>`.
 *
 *   #/jailbreak/db/LJB-2025-0001?model=gemini&method=dan&year=2025
 *   #/jailbreak/method/fake-test
 *   #/jailbreak/source
 *   #/system/db/LSP-2023-0001?vender=Microsoft
 *   #/system/source
 *
 * Unknown segments fall back to the default route instead of throwing, so a
 * hand-edited or stale link still opens the site.
 */
export function parseRoute(hash: string): RouteState {
  const state: RouteState = { ...defaultRoute };
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
    state.modelFilter = params.get('model') ?? '';
    state.methodFilter = params.get('method') ?? '';
  }
  if (state.section === 'system' && state.systemView === 'db') {
    state.venderFilter = params.get('vender') ?? '';
  }
  state.yearFilter = params.get('year') ?? '';
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
  if (state.section === 'jailbreak' && state.jailbreakView === 'db') {
    if (state.modelFilter) params.set('model', state.modelFilter);
    if (state.methodFilter) params.set('method', state.methodFilter);
  }
  if (state.section === 'system' && state.systemView === 'db' && state.venderFilter) {
    params.set('vender', state.venderFilter);
  }
  if (state.yearFilter) params.set('year', state.yearFilter);

  const queryPart = params.toString();
  return queryPart ? `${path}?${queryPart}` : path;
}