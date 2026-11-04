import { useEffect, useMemo, useState } from 'react';
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
import { useTheme } from './lib/theme';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Tabs } from './components/Tabs';
import { FilterBar } from './components/FilterBar';
import { PromptTable } from './components/PromptTable';
import { MethodView } from './components/MethodView';
import { SystemPromptView } from './components/SystemPromptView';
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

  // Two independent archives; each keeps its own sub-view and expanded row.
  const [section, setSection] = useState<Section>('jailbreak');
  const [jailbreakView, setJailbreakView] = useState<JailbreakView>('db');
  const [systemView, setSystemView] = useState<SystemView>('db');
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  // Table header filters (per archive); empty string means "all".
  const [modelFilter, setModelFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [venderFilter, setVenderFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sides, setSides] = useState<Record<string, PromptSide>>({});
  // System-prompt body language per row; falls back to the current UI language.
  const [sysSides, setSysSides] = useState<Record<string, string>>({});
  // Detail drawers: at most one row is open per archive.
  const [openPrompt, setOpenPrompt] = useState<string | null>(null);
  const [openSys, setOpenSys] = useState<string | null>(null);
  const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    loadData()
      .then((d) => {
        setData(d);
        document.title = d.site.htmlTitle;
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'description');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', d.site.description);
        setLang(Object.keys(d.langs)[0] ?? '');
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
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

  const venders = useMemo(
    () =>
      [...new Set((data?.systemPrompts ?? []).map((p) => p.vender).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [data]
  );

  // Distinct years across both archives, newest first.
  const years = useMemo(() => {
    const ys = new Set<string>();
    const add = (t: string) => {
      const y = t.slice(0, 4);
      if (/^\d{4}$/.test(y)) ys.add(y);
    };
    (data?.prompts ?? []).forEach((p) => add(p.time));
    (data?.systemPrompts ?? []).forEach((p) => add(p.time));
    return [...ys].sort((a, b) => b.localeCompare(a));
  }, [data]);


  // Stable across renders: the drawer body loader keys its effect on this.
  const langOptions = useMemo(() => {
    const table = data?.langs ?? {};
    return Object.keys(table).map((k) => ({ key: k, label: table[k].label }));
  }, [data]);

  const visiblePrompts = useMemo(() => {
    const all = data?.prompts ?? [];
    const q = query.trim().toLowerCase();
    return all.filter((p) => {
      if (modelFilter && p.model_id !== modelFilter) return false;
      if (methodFilter && p.jailbreak_method !== methodFilter) return false;
      if (yearFilter && !p.time.startsWith(yearFilter)) return false;
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
  }, [data, query, methodMap, modelMap, targetMap, modelFilter, methodFilter, yearFilter]);

  // Search runs over the indexed metadata only: bodies are fetched per drawer
  // on demand and are not available to filter the list.
  const visibleSysPrompts = useMemo(() => {
    const all = data?.systemPrompts ?? [];
    const q = query.trim().toLowerCase();
    return all.filter((p) => {
      if (venderFilter && p.vender !== venderFilter) return false;
      if (yearFilter && !p.time.startsWith(yearFilter)) return false;
      if (!q) return true;
      return [p.id, p.product, p.vender, p.source_url, p.note, p.note_zh]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [data, query, venderFilter, yearFilter]);

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
  const activeId = activeMethod ?? data.jailbreakMethods[0]?.id ?? '';
  const system = section === 'system';

  const sideOf = (p: Prompt): PromptSide =>
    sides[p.id] ?? (strings.defaultPromptSide === 'original' ? 'original' : 'translation');

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const openMethod = (id: string) => {
    setActiveMethod(id);
    setJailbreakView('method');
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
    setModelFilter('');
    setMethodFilter('');
    setVenderFilter('');
    setYearFilter('');
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
          setSection(s);
          setOpenPrompt(null);
          setOpenSys(null);
          clearFilters();
          scrollTop();
        }}
        sectionCounts={{ jailbreak: data.counts.prompts, system: data.counts.systemPrompts }}
      />
      <div className="mx-auto max-w-[1240px] px-6 pb-24">
        <Hero
          strings={strings}
          section={section}
          counts={data.counts}
          onMethod={() => {
            setJailbreakView('method');
            scrollTop();
          }}
          onSystemDb={() => {
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
            setJailbreakView(v);
            setOpenPrompt(null);
            scrollTop();
          }}
          onSystemView={(v) => {
            setSystemView(v);
            setOpenSys(null);
            scrollTop();
          }}
        />
        {/* Table header filter bar; only the listing views of each archive have one. */}
        {(system ? systemView : jailbreakView) === 'db' && (
          <FilterBar
            strings={strings}
            section={section}
            query={query}
            onQuery={handleSearch}
            models={data.models}
            methods={data.jailbreakMethods}
            venders={venders}
            years={years}
            model={modelFilter}
            method={methodFilter}
            vender={venderFilter}
            year={yearFilter}
            onModel={setModelFilter}
            onMethod={setMethodFilter}
            onVender={setVenderFilter}
            onYear={setYearFilter}
            shown={system ? visibleSysPrompts.length : visiblePrompts.length}
            total={system ? data.counts.systemPrompts : data.counts.prompts}
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
              onSelect={setOpenPrompt}
              onOpenMethod={(id) => {
                setOpenPrompt(null);
                openMethod(id);
              }}
            />
          )}
          {!system && jailbreakView === 'method' && (
            <MethodView
              methods={data.jailbreakMethods}
              activeId={activeId}
              strings={strings}
              prompts={data.prompts}
              onSelect={setActiveMethod}
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
              onSelect={setOpenSys}
              duplicateGroups={data.duplicateGroups}
              hiddenDuplicateIds={hiddenDuplicateIds}
            />
          )}
          {system && systemView === 'source' && (
            <SourceView html={data.sysSources?.[lang] ?? ''} />
          )}
        </main>
        <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-xs text-faint">
          <span>{strings.footer}</span>
          <span>
            {data.site.brandMark} {data.site.htmlTitle.split('·')[0].trim()} · {data.generated}
          </span>
        </footer>
      </div>
    </>
  );
}