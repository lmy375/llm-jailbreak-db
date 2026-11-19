import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  Data,
  JailbreakView,
  LangStrings,
  ModelEntry,
  Prompt,
  PromptSide,
  Section,
  SystemView,
  JailbreakMethod,
  TargetEntry,
} from './types';
import { loadBody, loadData, loadPromptBody } from './lib/data';
import {
  collectYears,
  emptyPromptFilters,
  emptySystemFilters,
  hasPromptFilters,
  hasSystemFilters,
  hasUnknownTime,
  matchesRanges,
  matchesTime,
  sortedUnique,
  type PromptFilterState,
  type SystemFilterState,
} from './lib/filters';
import { buildRoute, parseRoute, type RouteState } from './lib/route';
import { useTheme } from './lib/theme';
import { Header } from './components/Header';
import { Icon } from './components/Icon';
import { Hero } from './components/Hero';
import { Tabs } from './components/Tabs';
import { FilterBar } from './components/FilterBar';
import { PromptTable } from './components/PromptTable';
import { MethodView } from './components/MethodView';
import { SystemPromptView, type SystemFacets } from './components/SystemPromptView';
import { SourceView } from './components/SourceView';

function Spinner() {
  return (
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
  );
}

export default function App() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState('');

  // The hash is the only place navigation state lives, so a refresh, a shared
  // link or the back button all land on the same section, tab, filters and
  // open drawer instead of resetting to the landing view.
  const [bootRoute] = useState<RouteState>(() => parseRoute(window.location.hash));
  const [section, setSection] = useState<Section>(bootRoute.section);
  const [jailbreakView, setJailbreakView] = useState<JailbreakView>(bootRoute.jailbreakView);
  const [systemView, setSystemView] = useState<SystemView>(bootRoute.systemView);
  const [activeMethod, setActiveMethod] = useState<string | null>(bootRoute.activeMethod);
  const [query, setQuery] = useState(bootRoute.query);
  // Table header filters (per archive); empty arrays mean "all".
  const [promptFilters, setPromptFilters] = useState<PromptFilterState>(bootRoute.promptFilters);
  const [systemFilters, setSystemFilters] = useState<SystemFilterState>(bootRoute.systemFilters);
  const [sides, setSides] = useState<Record<string, PromptSide>>({});
  // System-prompt body language per row; falls back to the current UI language.
  const [sysSides, setSysSides] = useState<Record<string, string>>({});
  // Detail drawers: at most one row is open per archive.
  const [openPrompt, setOpenPrompt] = useState<string | null>(bootRoute.openPrompt);
  const [openSys, setOpenSys] = useState<string | null>(bootRoute.openSys);
  const [theme, toggleTheme] = useTheme();

  // Navigation actions add a history entry; typing in the search box and
  // changing a filter rewrite the current one so Back does not walk each key.
  const pushRef = useRef(false);
  const markPush = () => {
    pushRef.current = true;
  };

  useEffect(() => {
    loadData()
      .then((d) => {
        setData(d);
        setLang(Object.keys(d.langs)[0] ?? '');
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  // Document metadata follows the UI language, not just the initial page load.
  useEffect(() => {
    if (!data || !lang) return;
    const strings = data.langs[lang];
    if (!strings) return;
    document.documentElement.lang = strings.htmlLang;
    document.title = strings.site.htmlTitle || data.site.htmlTitle;
    const description = strings.site.description || data.site.description;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [data, lang]);

  // Keep the URL in step with the UI. Data loads first so the initial route is
  // applied before the first write.
  useEffect(() => {
    if (!data) return;
    const next = buildRoute({
      section,
      jailbreakView,
      systemView,
      activeMethod,
      openPrompt,
      openSys,
      query,
      promptFilters,
      systemFilters,
    });
    if (window.location.hash === next) return;
    if (pushRef.current) window.history.pushState(null, '', next);
    else window.history.replaceState(null, '', next);
    pushRef.current = false;
  }, [
    data,
    section,
    jailbreakView,
    systemView,
    activeMethod,
    openPrompt,
    openSys,
    query,
    promptFilters,
    systemFilters,
  ]);

  // Back/forward and hand-edited hashes flow back into the component state.
  useEffect(() => {
    const syncFromUrl = () => {
      const route = parseRoute(window.location.hash);
      setSection(route.section);
      setJailbreakView(route.jailbreakView);
      setSystemView(route.systemView);
      setActiveMethod(route.activeMethod);
      setQuery(route.query);
      setPromptFilters(route.promptFilters);
      setSystemFilters(route.systemFilters);
      setOpenPrompt(route.openPrompt);
      setOpenSys(route.openSys);
    };
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, []);

  const methodMap = useMemo(() => {
    const m = new Map<string, JailbreakMethod>();
    data?.jailbreakMethods.forEach((t) => m.set(t.id, t));
    return m;
  }, [data]);

  const modelMap = useMemo(() => {
    const m = new Map<string, ModelEntry>();
    data?.models.forEach((x) => m.set(x.id, x));
    return m;
  }, [data]);

  const targetMap = useMemo(() => {
    const m = new Map<string, TargetEntry>();
    data?.targets.forEach((t) => m.set(t.id, t));
    return m;
  }, [data]);

  // Column menus are built from the unfiltered archive, so options never
  // disappear while another filter is active.
  const promptYears = useMemo(
    () => collectYears((data?.prompts ?? []).map((prompt) => prompt.time)),
    [data]
  );
  const promptHasUnknownTime = useMemo(
    () => hasUnknownTime((data?.prompts ?? []).map((prompt) => prompt.time)),
    [data]
  );
  const systemFacets = useMemo<SystemFacets>(() => {
    const all = data?.systemPrompts ?? [];
    return {
      products: sortedUnique(all.map((prompt) => prompt.product)),
      venders: sortedUnique(all.map((prompt) => prompt.vender)),
      disclosures: sortedUnique(all.map((prompt) => prompt.disclosureType)),
      surfaces: sortedUnique(all.map((prompt) => prompt.surface)),
      years: collectYears(all.map((prompt) => prompt.time)),
    };
  }, [data]);
  const systemHasUnknownTime = useMemo(
    () => hasUnknownTime((data?.systemPrompts ?? []).map((prompt) => prompt.time)),
    [data]
  );


  // Stable across renders: the drawer body loader keys its effect on this.
  const langOptions = useMemo(() => {
    const table = data?.langs ?? {};
    return Object.keys(table).map((k) => ({ key: k, label: table[k].label }));
  }, [data]);

  const visiblePrompts = useMemo(() => {
    const all = data?.prompts ?? [];
    const q = query.trim().toLowerCase();
    const ranges = data?.filterRanges;
    return all.filter((p) => {
      if (promptFilters.model.length && !promptFilters.model.includes(p.model_id)) return false;
      if (promptFilters.target.length && !promptFilters.target.includes(p.target)) return false;
      if (promptFilters.method.length && !promptFilters.method.includes(p.jailbreak_method)) {
        return false;
      }
      if (!matchesRanges(p.length, promptFilters.length, ranges?.length ?? [])) return false;
      if (!matchesRanges(p.quality_score, promptFilters.quality, ranges?.quality ?? [])) return false;
      if (!matchesTime(p.time, promptFilters.time)) return false;
      if (!q) return true;
      const method = methodMap.get(p.jailbreak_method);
      const model = modelMap.get(p.model_id);
      const target = targetMap.get(p.target);
      const hay = [
        p.id,
        p.title,
        p.title_zh,
        p.model_id,
        model?.name ?? '',
        p.target,
        target?.name ?? '',
        target?.name_zh ?? '',
        p.time,
        method?.name ?? '',
        method?.name_zh ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, query, methodMap, modelMap, targetMap, promptFilters]);

  // Search runs over the indexed metadata only: bodies are fetched per drawer
  // on demand and are not available to filter the list.
  const visibleSysPrompts = useMemo(() => {
    const all = data?.systemPrompts ?? [];
    const q = query.trim().toLowerCase();
    const ranges = data?.filterRanges;
    return all.filter((p) => {
      if (systemFilters.product.length && !systemFilters.product.includes(p.product)) {
        return false;
      }
      if (systemFilters.vender.length && !systemFilters.vender.includes(p.vender)) return false;
      if (
        systemFilters.disclosureType.length &&
        !systemFilters.disclosureType.includes(p.disclosureType)
      ) {
        return false;
      }
      if (systemFilters.surface.length && !systemFilters.surface.includes(p.surface)) return false;
      if (!matchesRanges(p.length, systemFilters.length, ranges?.length ?? [])) return false;
      if (!matchesRanges(p.quality_score, systemFilters.quality, ranges?.quality ?? [])) {
        return false;
      }
      if (!matchesTime(p.time, systemFilters.time)) return false;
      if (!q) return true;
      return [p.id, p.product, p.vender, p.source_url, p.note, p.note_zh]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [data, query, systemFilters]);

  // Collapsing repeats keeps one row per prompt: the fullest body of each
  // duplicate group stays, the repeats drop out.
  const hiddenDuplicateIds = useMemo(() => {
    const hidden = new Set<string>();
    for (const g of data?.duplicateGroups ?? []) {
      for (const m of g.members) {
        if (!m.canonical && m.id !== g.canonical) hidden.add(m.id);
      }
    }
    return hidden;
  }, [data]);

  if (error) {
    return <div className="grid min-h-screen place-items-center p-8 text-muted">{error}</div>;
  }
  if (!data || !lang || !data.langs[lang]) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner />
      </div>
    );
  }

  const strings: LangStrings = data.langs[lang];
  // Older cached data.json files predate the range buckets; the columns then
  // render without range options instead of crashing.
  const filterRanges = data.filterRanges ?? { length: [], quality: [] };
  const activeId = activeMethod ?? data.jailbreakMethods[0]?.id ?? '';
  const system = section === 'system';

  const sideOf = (p: Prompt): PromptSide =>
    sides[p.id] ?? (strings.defaultPromptSide === 'original' ? 'original' : 'translation');

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const openMethod = (id: string) => {
    markPush();
    setActiveMethod(id);
    setJailbreakView('method');
    scrollTop();
  };

  // Opening a prompt from a method page returns to the listing with every
  // filter cleared, so the requested row is guaranteed to be present.
  const openPromptDetail = (id: string) => {
    markPush();
    setQuery('');
    setPromptFilters(emptyPromptFilters());
    setJailbreakView('db');
    setOpenPrompt(id);
    scrollTop();
  };

  // Searching stays inside the current archive; only the method/source views fall
  // back to the listing they belong to.
  const handleSearch = (value: string) => {
    setQuery(value);
    if (system) {
      if (systemView !== 'db') setSystemView('db');
    } else if (jailbreakView !== 'db') {
      setJailbreakView('db');
    }
  };

  const clearFilters = () => {
    setQuery('');
    setPromptFilters(emptyPromptFilters());
    setSystemFilters(emptySystemFilters());
  };

  return (
    <>
      <div className="ambient" aria-hidden="true" />
      <Header
        site={data.site}
        strings={strings}
        langOptions={langOptions}
        lang={lang}
        onLang={setLang}
        theme={theme}
        onToggleTheme={toggleTheme}
        section={section}
        onSection={(s) => {
          markPush();
          setSection(s);
          setOpenPrompt(null);
          setOpenSys(null);
          clearFilters();
          scrollTop();
        }}
        sectionCounts={{ jailbreak: data.counts.prompts, system: data.counts.systemPrompts }}
      />
      <div className="w-full px-5 pb-28 sm:px-8">
        <Hero
          strings={strings}
          section={section}
          counts={data.counts}
          onMethod={() => {
            markPush();
            setJailbreakView('method');
            scrollTop();
          }}
          onSystemDb={() => {
            markPush();
            setSystemView('db');
            scrollTop();
          }}
        />
        <Tabs
          strings={strings}
          variant={system ? 'system' : 'jailbreak'}
          counts={{
            db: system ? data.counts.systemPrompts : data.counts.prompts,
            method: data.counts.methods,
            source: system ? data.systemSources.length : data.jailbreakSources.length,
          }}
          jailbreakView={jailbreakView}
          systemView={systemView}
          onJailbreakView={(v) => {
            markPush();
            setJailbreakView(v);
            setOpenPrompt(null);
            scrollTop();
          }}
          onSystemView={(v) => {
            markPush();
            setSystemView(v);
            setOpenSys(null);
            scrollTop();
          }}
        />
        {/* Table header filter bar; only the listing views of each archive have one. */}
        {(system ? systemView : jailbreakView) === 'db' && (
          <FilterBar
            strings={strings}
            query={query}
            onQuery={handleSearch}
            shown={system ? visibleSysPrompts.length : visiblePrompts.length}
            total={system ? data.counts.systemPrompts : data.counts.prompts}
            filtered={
              Boolean(query.trim()) ||
              (system ? hasSystemFilters(systemFilters) : hasPromptFilters(promptFilters))
            }
            onClear={clearFilters}
          />
        )}
        <main>
          {!system && jailbreakView === 'db' && (
            <PromptTable
              prompts={visiblePrompts}
              loadPromptBody={loadPromptBody}
              methodMap={methodMap}
              modelMap={modelMap}
              targetMap={targetMap}
              strings={strings}
              sideOf={sideOf}
              onSide={(id, side) => setSides((s) => ({ ...s, [id]: side }))}
              selectedId={openPrompt}
              onSelect={(id) => {
                markPush();
                setOpenPrompt(id);
              }}
              onOpenMethod={(id) => {
                setOpenPrompt(null);
                openMethod(id);
              }}
              filters={promptFilters}
              onFilter={(key, values) =>
                setPromptFilters((current) => ({ ...current, [key]: values }))
              }
              years={promptYears}
              hasUnknownTime={promptHasUnknownTime}
              ranges={filterRanges}
            />
          )}
          {!system && jailbreakView === 'method' && (
            <MethodView
              methods={data.jailbreakMethods}
              activeId={activeId}
              strings={strings}
              prompts={data.prompts}
              onSelect={(id) => {
                markPush();
                setActiveMethod(id);
              }}
              onOpenPrompt={openPromptDetail}
            />
          )}
          {!system && jailbreakView === 'source' && (
            <SourceView html={data.sources[lang] ?? ''} />
          )}

          {system && systemView === 'db' && (
            <SystemPromptView
              prompts={visibleSysPrompts}
              loadBody={loadBody}
              lang={lang}
              languages={langOptions}
              sideOf={(p) => sysSides[p.id] ?? lang}
              onSide={(id, key) => setSysSides((s) => ({ ...s, [id]: key }))}
              strings={strings}
              selectedId={openSys}
              onSelect={(id) => {
                markPush();
                setOpenSys(id);
              }}
              duplicateGroups={data.duplicateGroups}
              hiddenDuplicateIds={hiddenDuplicateIds}
              filters={systemFilters}
              onFilter={(key, values) =>
                setSystemFilters((current) => ({ ...current, [key]: values }))
              }
              facets={systemFacets}
              hasUnknownTime={systemHasUnknownTime}
              ranges={filterRanges}
            />
          )}
          {system && systemView === 'source' && (
            <SourceView html={data.sysSources?.[lang] ?? ''} />
          )}
        </main>
        <footer className="mt-24 flex flex-wrap justify-between gap-4 border-t border-line pt-8 text-xs text-faint">
          <span>{strings.footer}</span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="diamond" className="h-3 w-3 flex-none text-faint" />
            {data.site.htmlTitle.split('·')[0].trim()} · {data.generated}
          </span>
        </footer>
      </div>
    </>
  );
}