// Types mirror the shape of public/data.json produced by scripts/build-data.mjs.

export interface ModelEntry {
  id: string;
  name: string;
}

export interface JailbreakMethod {
  id: string;
  name: string;
  name_zh: string;
  /** Position in jailbreak_prompts.yaml declaration order (0-based); drives the 01/02/… label. */
  index: number;
  body_zh: string;
  body_en: string;
  count: number;
}

/** Attack-target taxonomy entry; `count` is computed by the build script. */
export interface TargetEntry {
  id: string;
  name: string;
  name_zh: string;
  count: number;
}

export interface Prompt {
  id: string;
  title: string;
  title_zh: string;
  model_id: string;
  time: string;
  /** Reference into Data.jailbreakSources — the parent archive this entry came from. */
  source_id: string;
  /** Exact URL of this entry, usually a sub-path of the source archive. */
  source_url: string;
  jailbreak_method: string;
  /** Reference into Data.targets — what this prompt aims to achieve. */
  target: string;
  /** Other noteworthy facts (English); empty when none. */
  note?: string;
  /** Chinese counterpart of note. */
  note_zh?: string;
  /** Human-reviewed quality score, 1–10. */
  quality_score: number;
}

/** Both language sides of one jailbreak prompt; fetched when its drawer opens. */
export interface PromptBody {
  /** The prompt as published (usually English). */
  original: string;
  /** Chinese translation of the same prompt. */
  translation: string;
}

/** A data-source archive; data_count is computed by the build script. */
export interface SourceEntry {
  id: string;
  title: string;
  url: string;
  /** Date the source's data was indexed into this database. */
  index_time: string;
  /** Commit used at indexing time; empty for non-GitHub sources. */
  commit: string;
  description: string;
  description_zh: string;
  data_count: number;
}

/** How heavily one body repeats another; computed by the build script. */
export interface DuplicateInfo {
  /** Duplicate group id, e.g. DUP-0007. */
  groupId: string;
  /** 'near-identical' — the bodies match; 'contained' — one sits inside the other. */
  kind: 'near-identical' | 'contained';
  /** Entry id of the fullest body in the group. */
  canonicalId: string;
  /** body id of the fullest body in the group. */
  canonicalBodyId: string;
  /** Jaccard similarity against the matched body (0–1). */
  similarity: number;
  /** Share of this body that also appears in the other (0–1). */
  containment: number;
  /** Relation to the matched body. */
  relation: 'near-identical' | 'contained';
  /** Number of bodies in the group. */
  groupSize: number;
  /** Number of bodies in the group that have an entry in the index. */
  indexedCount: number;
}

/** A system prompt that has left vendor control. Body text is fetched on demand. */
export interface SystemPrompt {
  id: string;
  product: string;
  vender: string;
  /** YYYY-MM-DD (day '01' is a placeholder when only the month is known); empty string when the disclosure date is unconfirmed. */
  time: string;
  /** Disclosure type; exactly 'official-open-source' or 'leaked'. */
  disclosureType: string;
  /** Product surface (chat / api / ide / cli / agent / browser / mobile / desktop …). */
  surface: string;
  /** How the prompt escaped vendor control, plus other directly-known facts (English). */
  note: string;
  /** Chinese counterpart of note. */
  note_zh: string;
  /** Reference into Data.systemSources — the parent archive this entry came from. */
  source_id: string;
  /** Exact URL of this entry, usually a sub-path of the source archive. */
  source_url: string;
  system_prompt_id: string;
  /** Word count of the English body; computed by the build script. */
  words: number;
  /** Human-reviewed quality score, 1–10. */
  quality_score: number;
  /** Present when this body heavily repeats another body in the archive. */
  duplicate?: DuplicateInfo;
}

/** A cluster of bodies that heavily repeat one another. */
export interface DuplicateGroup {
  id: string;
  kind: 'near-identical' | 'contained';
  /** Entry id of the fullest body in the group. */
  canonical: string;
  members: {
    id: string;
    system_prompt_id: string;
    words: number;
    similarity: number;
    containment: number;
    relation: 'near-identical' | 'contained';
    canonical: boolean;
  }[];
}

export interface LangStrings {
  label: string;
  defaultPromptSide: PromptSide;
  fieldMap: {
    title: 'title' | 'title_zh';
    titleAlt: 'title' | 'title_zh';

    name: 'name' | 'name_zh';
    nameAlt: 'name' | 'name_zh';
    body: 'body_zh' | 'body_en';
    bodyAlt: 'body_zh' | 'body_en';
    note: 'note' | 'note_zh';
    noteAlt: 'note' | 'note_zh';
  };
  site: { name: string };
  search: { placeholder: string };
  tabs: { db: string; method: string; source: string };
  hero: { title: string; description: string };
  stats: { prompts: string; methods: string; models: string };
  labels: {
    target: string;
    prompt: string;
    source: string;

    translation: string;
    original: string;
    /** "{lang}原文" — badge for a side showing another language's body. */
    missingBody: string;
    /** Longer hover text explaining the same state. */
    missingBodyHint: string;
    relatedPrompts: string;
    promptUnit: string;
    empty: string;
    methodIntro: string;
    // 数据库表格列名 / data-table column headers
    id: string;
    model: string;
    title: string;
    method: string;
    quality: string;
    time: string;
    // 详情抽屉 / detail drawer
    close: string;
    note: string;
    viewTech: string;
    // 主题与排序 / theme toggle & sorting
    themeToLight: string;
    themeToDark: string;
    sortBy: string;
    // 表头过滤器 / table header filter bar
    filterYear: string;
    filterAll: string;
    filterClear: string;
    filterMatch: string;
  };
  /** 数据来源表格表头（构建期渲染来源页用）/ source-page table headers */
  sourceTable: {
    title: string;
    description: string;
    indexTime: string;
    commit: string;
    dataCount: string;
  };
  /** 系统提示词库专用文案 / strings for the system prompt archive. */
  sysPrompts: {
    section: string;
    tabs: { db: string; source: string };
    heroTitle: string;
    heroDescription: string;
    vender: string;
    product: string;
    time: string;
    words: string;
    quality: string;
    disclosureType: string;
    surface: string;
    note: string;
    source: string;
    body: string;
    timeUnknown: string;
    wordsUnknown: string;
    empty: string;
    /** Badge on rows whose body heavily repeats another entry. */
    duplicate: string;
    duplicateGroup: string;
    duplicateNote: string;
    duplicateMembers: string;
    duplicateNearIdentical: string;
    duplicateContained: string;
    duplicateCanonical: string;
    duplicateSimilarity: string;
    duplicateContainment: string;
    duplicateGroupCount: string;
    duplicateHideRepeats: string;
    duplicateShowAll: string;

    /** Enum value -> localised label, keyed by the field name. */
    enumLabels: Record<string, Record<string, string>>;
  };
  footer: string;

}

export interface SiteConfig {
  htmlTitle: string;
  description: string;
  repo: string;
  brandMark: string;
  repoLabel: string;
}

export interface Data {
  generated: string;
  site: SiteConfig;
  langs: Record<string, LangStrings>;
  counts: { prompts: number; methods: number; models: number; systemPrompts: number; duplicateGroups: number };
  models: ModelEntry[];
  jailbreakMethods: JailbreakMethod[];
  targets: TargetEntry[];
  prompts: Prompt[];
  systemPrompts: SystemPrompt[];
  /** Clusters of bodies that heavily repeat one another; computed by the build script. */
  duplicateGroups: DuplicateGroup[];
  /** Structured source registry for the jailbreak archive. */
  jailbreakSources: SourceEntry[];
  /** Structured source registry for the system-prompt archive. */
  systemSources: SourceEntry[];
  /** Rendered source page HTML, keyed by UI language code. */
  sources: Record<string, string>;
  /** Source page for the system-prompt archive. */
  sysSources?: Record<string, string>;
}

/** Top-level section of the site; each carries its own sub-tabs. */
export type Section = 'jailbreak' | 'system';
export type JailbreakView = 'db' | 'method' | 'source';
export type SystemView = 'db' | 'source';
export type PromptSide = 'original' | 'translation';