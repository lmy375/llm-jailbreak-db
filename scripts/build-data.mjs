// Aggregates jailbreak_prompts.yaml, i18n.yaml, content/jailbreak_method/{zh,en}/*.md,
// system_prompts.yaml + content/system_prompts/{zh,en}/*.md and content/{jailbreak_,system_}source/** into a single
// public/data.json that the front-end fetches at runtime.
//
// This build script only reads data files — it hard-codes no content.

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { marked } from 'marked';
import { detectDuplicateGroups } from './detect-duplicates.mjs';

const root = path.resolve(import.meta.dirname, '..');
marked.use({ mangle: false, headerIds: false });

const readYaml = (file) => yaml.load(fs.readFileSync(path.join(root, file), 'utf8'));

// js-yaml parses unquoted yyyy-mm-dd scalars into Date objects; normalise every
// date-like field to the yyyy-mm-dd string the UI expects (day granularity).
const normDate = (v) => {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  return /^\d{4}-\d{2}-\d{2}T/.test(s) ? s.slice(0, 10) : s;
};

// ---- prompts + models + jailbreak methods -------------------------------------
const jailbreak = readYaml('jailbreak_prompts.yaml');
const modelList = jailbreak.models ?? [];

// Sort by id: LJB-<year>-<seq>. The year is always a real 4-digit year — the
// entry time, or a clue timestamp (e.g. the source repo commit date) when the
// time is unknown; LJB-XXXX is no longer used.
// The sequence is exactly 4 zero-padded digits.
const idKey = (id) => {
  const m = /^LJB-(\d{4})-(\d{4})$/.exec(String(id));
  if (!m) return [1, 0, Number.MAX_SAFE_INTEGER];
  return [0, Number(m[1]), Number(m[2])];
};
const prompts = (jailbreak.prompts ?? [])
  .map((p) => ({ ...p, time: normDate(p.time) }))
  .sort((a, b) => {
    const [ax, ay, an] = idKey(a.id);
    const [bx, by, bn] = idKey(b.id);
    return ax - bx || ay - by || an - bn;
  });

// Referenced models, in declaration order; drop ones no prompt uses.
const usedModelIds = new Set(prompts.map((p) => p.model_id));
const models = modelList
  .filter((m) => usedModelIds.has(m.id))
  .map((m) => ({ id: m.id, name: m.name }));

// Fail loudly on dangling references rather than rendering blanks.
const missingModel = [...usedModelIds].filter((id) => !models.some((m) => m.id === id));
if (missingModel.length) {
  throw new Error(`prompts[].model_id not found in models: ${missingModel.join(', ')}`);
}

const methodRefs = new Set(prompts.map((p) => p.jailbreak_method));
const missingMethod = [...methodRefs].filter(
  (id) => !(jailbreak.jailbreak_method ?? []).some((t) => t.id === id)
);
if (missingMethod.length) {
  throw new Error(
    `prompts[].jailbreak_method not found in jailbreak_method: ${missingMethod.join(', ')}`
  );
}

const targetRefs = new Set(prompts.map((p) => p.target));
const missingTarget = [...targetRefs].filter(
  (id) => !(jailbreak.target ?? []).some((t) => t.id === id)
);
if (missingTarget.length) {
  throw new Error(`prompts[].target not found in target: ${missingTarget.join(', ')}`);
}

// ---- system prompts ---------------------------------------------------------
// system_prompts.yaml indexes full prompt bodies kept under content/system_prompts/{lang}/
// as one file per record. Bodies stay raw text: they are shown verbatim, never
// parsed as markdown.
const sysPromptFile = path.join(root, 'system_prompts.yaml');
const sysYaml = fs.existsSync(sysPromptFile) ? readYaml('system_prompts.yaml') : {};
const sysPrompts = (sysYaml.prompts ?? []).slice();

// Oldest first; entries with an unconfirmed time sort last.
sysPrompts.sort((a, b) => {
  const t = (v) => normDate(v?.time) || '9999';
  return t(a).localeCompare(t(b)) || String(a.id).localeCompare(String(b.id));
});

// Body files must exist and be non-empty in every UI language. There is no hard
// word-count floor: brevity is fine as long as the text really is the product's
// system prompt, and some genuine prompts are only a few sentences long.
const WARN_WORDS = 200;
const seenSys = new Set();
const seenBodies = new Set();
// Word counts come from the English body itself, never from hand-written fields.
const enWordCounts = new Map();
const sysLangs = Object.keys(readYaml('i18n.yaml')).filter((k) => k !== 'site');

// Bodies must exist in every UI language, and be real full prompts.
//
// A missing translation is only a warning: the record still renders, falling
// back to the English body, so a translation backlog never blocks `pnpm dev`
// or the Pages build. The backlog is tracked in untranslated_system_prompts.yaml.
const missingTranslationWarnings = [];

for (const s of sysPrompts) {
  if (!/^LSP-(\d{4})-\d{4}$/.test(String(s.id))) {
    throw new Error(`system_prompts[].id must match LSP-<year>-<4-digit seq>: ${s.id}`);
  }
  if (seenSys.has(s.id)) throw new Error(`duplicate system_prompts[].id: ${s.id}`);
  seenSys.add(s.id);

  // Each record must own a distinct body file.
  const bodyId = String(s.system_prompt_id ?? '');
  if (!bodyId) throw new Error(`system_prompts[].system_prompt_id missing: ${s.id}`);
  if (seenBodies.has(bodyId)) {
    throw new Error(`duplicate system_prompt_id (${bodyId}): ${s.id}`);
  }
  seenBodies.add(bodyId);

  // disclosureType admits exactly two values.
  if (!['official-open-source', 'leaked'].includes(String(s.disclosureType))) {
    throw new Error(
      `system_prompts[].disclosureType must be official-open-source or leaked: ${s.disclosureType} (${s.id})`
    );
  }

  // Bodies must exist in every UI language, and be real full prompts.
  for (const lang of sysLangs) {
    const bodyFile = path.join(root, 'content', 'system_prompts', lang, `${bodyId}.md`);
    if (!fs.existsSync(bodyFile)) {
      if (lang !== 'en') {
        missingTranslationWarnings.push(`content/system_prompts/${lang}/${bodyId}.md (${s.id})`);
      }
      continue;
    }
    const body = fs.readFileSync(bodyFile, 'utf8').trim();
    if (!body) throw new Error(`content/system_prompts/${lang}/${bodyId}.md is empty: ${s.id}`);
    const words = body.split(/\s+/).filter(Boolean).length;
    const cjk = (body.match(/[一-鿿]/g) ?? []).length;
    if (lang === 'en') enWordCounts.set(bodyId, words);
    if (words < WARN_WORDS && cjk < WARN_WORDS) {
      console.warn(
        `note: content/system_prompts/${lang}/${bodyId}.md is short ` +
          `(${words} words / ${cjk} CJK chars) — confirm it is a complete prompt: ${s.id}`
      );
    }
  }
}

if (missingTranslationWarnings.length) {
  console.warn(
    `note: ${missingTranslationWarnings.length} translation(s) missing — ` +
      `falling back to the English body (build continues):`
  );
  for (const w of missingTranslationWarnings) console.warn(`  ${w}`);
}

// Load one body per language; the UI language switches which side is shown.
// A language whose file is missing falls back to the English body so the
// record stays readable while its translation is still outstanding.
function loadBodies(lang) {
  const dir = path.join(root, 'content', 'system_prompts', lang);
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    out[f.replace(/\.md$/, '')] = fs.readFileSync(path.join(dir, f), 'utf8').trim();
  }
  return out;
}
const enBodies = loadBodies('en');
const sysBodies = Object.fromEntries(
  sysLangs.map((lang) => {
    const bodies = loadBodies(lang);
    if (lang === 'en') return [lang, bodies];
    // Fill gaps from the English body.
    for (const [id, text] of Object.entries(enBodies)) {
      if (!bodies[id]) bodies[id] = text;
    }
    return [lang, bodies];
  })
);

const normalisedSys = sysPrompts.map((s) => ({
  ...s,
  time: normDate(s.time),
  words: enWordCounts.get(String(s.system_prompt_id)) ?? 0,
}));

// ---- near-duplicate detection -------------------------------------------------
// The archive collects the same vendor prompt from several public sources, so
// one capture often appears more than once under different file names. The
// groups are computed from the English bodies here (never hand-written): the
// Chinese files are translations of the same entries, so comparing them would
// only re-report the same grouping. Entries carry `duplicate` metadata so the
// UI can flag the repetition.
const duplicateResult = detectDuplicateGroups(sysBodies.en ?? {});
const entryIdOfBody = new Map(
  sysPrompts.map((s) => [String(s.system_prompt_id), String(s.id)])
);
const duplicateGroupOf = new Map();
for (const g of duplicateResult.groups) {
  // The detection's canonical body may not be indexed (a body file with no
  // entry); fall back to the fullest indexed member so every group has one.
  const indexed = g.members.map((m) => m.id).filter((id) => entryIdOfBody.has(id));
  const canonicalBody =
    g.members.find((m) => m.canonical && entryIdOfBody.has(m.id))?.id ??
    g.members.find((m) => entryIdOfBody.has(m.id))?.id;
  for (const m of g.members) {
    duplicateGroupOf.set(m.id, {
      groupId: g.id,
      kind: g.kind,
      canonical: canonicalBody,
      canonicalId: entryIdOfBody.get(canonicalBody) ?? canonicalBody,
      canonicalBodyId: canonicalBody,
      similarity: m.similarity,
      containment: m.containment,
      relation: m.relation,
      groupSize: g.members.length,
      indexedCount: indexed.length,
    });
  }
}
const sysWithDuplicates = normalisedSys.map((s) => {
  const dup = duplicateGroupOf.get(String(s.system_prompt_id));
  return dup ? { ...s, duplicate: dup } : s;
});

// Duplicate groups keyed by the archive's own entry ids, so the UI can list
// every member of a group without re-deriving it from file names.
const duplicateGroups = duplicateResult.groups
  .map((g) => {
    const members = g.members
      .map((m) => entryIdOfBody.get(m.id))
      .filter(Boolean)
      .map((entryId) => {
        const prompt = sysWithDuplicates.find((s) => s.id === entryId);
        return {
          id: entryId,
          system_prompt_id: prompt?.system_prompt_id ?? '',
          words: prompt?.words ?? 0,
          similarity: prompt?.duplicate?.similarity ?? 0,
          containment: prompt?.duplicate?.containment ?? 0,
          relation: prompt?.duplicate?.relation ?? g.kind,
          canonical: prompt?.duplicate?.canonicalBodyId === prompt?.system_prompt_id,
        };
      })
      .sort((a, b) => b.words - a.words || a.id.localeCompare(b.id));
    if (!members.length) return null;
    // The detection's canonical body may not be indexed (a body file with no
    // entry). Fall back to the fullest indexed member so every group has one.
    const canonicalEntry = members.find((m) => m.canonical)?.id ?? members[0].id;
    return {
      id: g.id,
      kind: g.kind,
      canonical: canonicalEntry,
      members: members.map((m) => ({ ...m, canonical: m.id === canonicalEntry })),
    };
  })
  .filter((g) => g && g.members.length > 1);

// ---- UI strings -------------------------------------------------------------
const i18n = readYaml('i18n.yaml');
const site = i18n.site ?? {};
const langs = Object.fromEntries(
  Object.entries(i18n).filter(([k]) => k !== 'site')
);

// ---- jailbreak method articles ----------------------------------------------
function loadArticles(lang) {
  const dir = path.join(root, 'content', 'jailbreak_method', lang);
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    out[f.replace(/\.md$/, '')] = marked.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}
const zh = loadArticles('zh');
const en = loadArticles('en');

// Methods keep declaration order; `index` drives the 01/02/… labels.
const jailbreakMethods = (jailbreak.jailbreak_method ?? []).map((t, index) => ({
  ...t,
  index,
  body_zh: zh[t.id] || '',
  body_en: en[t.id] || '',
  count: prompts.filter((p) => p.jailbreak_method === t.id).length,
}));

// Attack-target taxonomy; declaration order, with per-target prompt counts.
const targets = (jailbreak.target ?? []).map((t) => ({
  ...t,
  count: prompts.filter((p) => p.target === t.id).length,
}));

// ---- source registry ---------------------------------------------------------
// Both data files keep a top-level `source` list; every prompt references one
// entry via source_id. data_count is computed here (never hand-written) and a
// dangling reference fails the build.
function withSourceCounts(sourceList, promptList, label) {
  const byId = new Map((sourceList ?? []).map((s) => [s.id, s]));
  const counts = new Map();
  for (const p of promptList) {
    const sid = String(p.source_id ?? '');
    if (!sid || !byId.has(sid)) {
      throw new Error(`${label}[].source_id not found in source: ${sid || '(empty)'} (${p.id})`);
    }
    counts.set(sid, (counts.get(sid) ?? 0) + 1);
  }
  return (sourceList ?? []).map((s) => ({ ...s, index_time: normDate(s.index_time), data_count: counts.get(s.id) ?? 0 }));
}

const jailbreakSources = withSourceCounts(jailbreak.source, prompts, 'prompts');
const systemSources = withSourceCounts(sysYaml.source, sysPrompts, 'system_prompts');

// ---- sources (per language) -------------------------------------------------
// The source pages keep hand-written intro / disclaimer text; the data table
// itself is rendered from the structured `source` registry above and replaces
// the <!-- SOURCES_TABLE --> placeholder at build time.
function sourceTableMarkdown(meta, lang, strings) {
  const t = strings.sourceTable ?? {};
  const desc = (s) =>
    (lang === 'zh' ? s.description_zh || s.description : s.description) ?? '';
  const head = `| ${t.title} | ${t.description} | ${t.indexTime} | ${t.commit} | ${t.dataCount} |`;
  const sep = '| --- | --- | --- | --- | --- |';
  const rows = meta.map(
    (s) =>
      `| [${s.title}](${s.url}) | ${desc(s)} | ${s.index_time ?? ''} | ${
        s.commit ? '`' + s.commit + '`' : '—'
      } | ${s.data_count} |`
  );
  return [head, sep, ...rows].join('\n');
}

function renderSourcePage(relFile, meta, lang, strings) {
  const file = path.join(root, relFile);
  if (!fs.existsSync(file)) return '';
  const raw = fs.readFileSync(file, 'utf8');
  return marked.parse(raw.replace('<!-- SOURCES_TABLE -->', sourceTableMarkdown(meta, lang, strings)));
}

const sources = Object.fromEntries(
  Object.keys(langs).map((lang) => [
    lang,
    renderSourcePage(path.join('content', 'jailbreak_source', `${lang}.md`), jailbreakSources, lang, langs[lang]),
  ])
);

// The system-prompt archive keeps its own source page, separate from the
// jailbreak one.
const sysSources = Object.fromEntries(
  Object.keys(langs).map((lang) => [
    lang,
    renderSourcePage(path.join('content', 'system_source', `${lang}.md`), systemSources, lang, langs[lang]),
  ])
);

const data = {
  generated: new Date().toISOString().slice(0, 10),
  site,
  langs,
  counts: {
    prompts: prompts.length,
    methods: jailbreakMethods.length,
    models: models.length,
    systemPrompts: normalisedSys.length,
    duplicateGroups: duplicateGroups.length,
  },
  models,
  jailbreakMethods,
  targets,
  prompts,
  systemPrompts: sysWithDuplicates,
  duplicateGroups,
  systemPromptBodies: sysBodies,
  jailbreakSources,
  systemSources,
  sources,
  sysSources,
};

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public', 'data.json'), JSON.stringify(data));
console.log(
  `data.json -> ${prompts.length} prompts, ${jailbreakMethods.length} methods, ` +
    `${targets.length} targets, ${data.counts.models} models, ${normalisedSys.length} system prompts, ` +
    `${jailbreakSources.length} + ${systemSources.length} sources, ` +
    `${Object.keys(langs).length} languages`
);