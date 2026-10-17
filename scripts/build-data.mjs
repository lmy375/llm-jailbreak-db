// Aggregates jailbreak_prompts.yaml, i18n.yaml, jailbreak_method/{zh,en}/*.md,
// system_prompts.yaml + system_prompts/{zh,en}/*.md and source/** into a single
// public/data.json that the front-end fetches at runtime.
//
// This build script only reads data files — it hard-codes no content.

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { marked } from 'marked';

const root = path.resolve(import.meta.dirname, '..');
marked.use({ mangle: false, headerIds: false });

const readYaml = (file) => yaml.load(fs.readFileSync(path.join(root, file), 'utf8'));

// ---- prompts + models + jailbreak methods -------------------------------------
const jailbreak = readYaml('jailbreak_prompts.yaml');
const modelList = jailbreak.models ?? [];

// Sort by id: LJB-<year>-<seq>, where an unknown year (XXXX) sorts last.
const idKey = (id) => {
  const m = /^LJB-(\d{4}|XXXX)-(\d+)$/.exec(String(id));
  if (!m) return [1, 0, Number.MAX_SAFE_INTEGER];
  return [m[1] === 'XXXX' ? 1 : 0, Number(m[1]), Number(m[2])];
};
const prompts = (jailbreak.prompts ?? []).sort((a, b) => {
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

// ---- system prompts ---------------------------------------------------------
// system_prompts.yaml indexes full prompt bodies kept under system_prompts/{lang}/
// as one file per record. Bodies stay raw text: they are shown verbatim, never
// parsed as markdown.
const sysPromptFile = path.join(root, 'system_prompts.yaml');
const sysPrompts = fs.existsSync(sysPromptFile)
  ? (readYaml('system_prompts.yaml').prompts ?? []).slice()
  : [];

// Oldest first; entries with an unconfirmed time sort last.
sysPrompts.sort((a, b) => {
  const t = (v) => String(v?.time ?? '') || '9999';
  return t(a).localeCompare(t(b)) || String(a.id).localeCompare(String(b.id));
});

// Body files must exist and be non-empty in every UI language. There is no hard
// word-count floor: brevity is fine as long as the text really is the product's
// system prompt, and some genuine prompts are only a few sentences long.
const WARN_WORDS = 200;
const seenSys = new Set();
const seenBodies = new Set();
const ljbIds = new Set(prompts.map((p) => p.id));
const sysLangs = Object.keys(readYaml('i18n.yaml')).filter((k) => k !== 'site');

for (const s of sysPrompts) {
  if (!/^LSP-(\d{4}|XXXX)-\d+$/.test(String(s.id))) {
    throw new Error(`system_prompts[].id must match LSP-<year|XXXX>-<seq>: ${s.id}`);
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

  // ljb_id is optional, but when present it must resolve to a real prompt.
  if (s.ljb_id && !ljbIds.has(s.ljb_id)) {
    throw new Error(`system_prompts[].ljb_id not found in prompts: ${s.ljb_id} (${s.id})`);
  }

  // Bodies must exist in every UI language, and be real full prompts.
  for (const lang of sysLangs) {
    const bodyFile = path.join(root, 'system_prompts', lang, `${bodyId}.md`);
    if (!fs.existsSync(bodyFile)) {
      throw new Error(`system_prompts/${lang}/${bodyId}.md not found: ${s.id}`);
    }
    const body = fs.readFileSync(bodyFile, 'utf8').trim();
    if (!body) throw new Error(`system_prompts/${lang}/${bodyId}.md is empty: ${s.id}`);
    const words = body.split(/\s+/).filter(Boolean).length;
    const cjk = (body.match(/[一-鿿]/g) ?? []).length;
    if (words < WARN_WORDS && cjk < WARN_WORDS) {
      console.warn(
        `note: system_prompts/${lang}/${bodyId}.md is short ` +
          `(${words} words / ${cjk} CJK chars) — confirm it is a complete prompt: ${s.id}`
      );
    }
  }
}

// Load one body per language; the UI language switches which side is shown.
function loadBodies(lang) {
  const dir = path.join(root, 'system_prompts', lang);
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    out[f.replace(/\.md$/, '')] = fs.readFileSync(path.join(dir, f), 'utf8').trim();
  }
  return out;
}
const sysBodies = Object.fromEntries(sysLangs.map((lang) => [lang, loadBodies(lang)]));

const normalisedSys = sysPrompts.map((s) => ({
  ...s,
  time: String(s.time ?? ''),
  words: Number(s.words) || 0,
  ljb_id: String(s.ljb_id ?? ''),
}));

// ---- UI strings -------------------------------------------------------------
const i18n = readYaml('i18n.yaml');
const site = i18n.site ?? {};
const langs = Object.fromEntries(
  Object.entries(i18n).filter(([k]) => k !== 'site')
);

// ---- jailbreak method articles ----------------------------------------------
function loadArticles(lang) {
  const dir = path.join(root, 'jailbreak_method', lang);
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

// ---- sources (per language) -------------------------------------------------
function loadSource(lang) {
  const file = path.join(root, 'source', `${lang}.md`);
  return fs.existsSync(file)
    ? marked.parse(fs.readFileSync(file, 'utf8'))
    : '';
}
const sources = Object.fromEntries(
  Object.keys(langs).map((lang) => [lang, loadSource(lang)])
);

// The system-prompt archive keeps its own source page, separate from the
// jailbreak one.
function loadSysSource(lang) {
  const file = path.join(root, 'source', 'system', `${lang}.md`);
  return fs.existsSync(file) ? marked.parse(fs.readFileSync(file, 'utf8')) : '';
}
const sysSources = Object.fromEntries(
  Object.keys(langs).map((lang) => [lang, loadSysSource(lang)])
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
  },
  models,
  jailbreakMethods,
  prompts,
  systemPrompts: normalisedSys,
  systemPromptBodies: sysBodies,
  sources,
  sysSources,
};

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public', 'data.json'), JSON.stringify(data));
console.log(
  `data.json -> ${prompts.length} prompts, ${jailbreakMethods.length} methods, ` +
    `${data.counts.models} models, ${normalisedSys.length} system prompts, ` +
    `${Object.keys(langs).length} languages`
);