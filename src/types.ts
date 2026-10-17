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

export interface Prompt {
  id: string;
  title: string;
  title_zh: string;
  model_id: string;
  time: string;
  source: string;
  jailbreak_method: string;
  category: string;
  target: string;
  target_zh: string;
  prompt: string;
  prompt_zh: string;
  /** Free-form: any keys are allowed and rendered generically. */
  extra?: Record<string, string | string[]>;
}

/** A system prompt that has left vendor control. Body text lives in systemPromptBodies. */
export interface SystemPrompt {
  id: string;
  product: string;
  vender: string;
  /** YYYY-MM / YYYY-MM-DD; empty string when the disclosure date is unconfirmed. */
  time: string;
  /** Word count of the body; 0 for CJK originals or when unknown. */
  words: number;
  /** LJB id of the jailbreak prompt used to extract this one; empty when none matches. */
  ljb_id: string;
  source: string;
  system_prompt_id: string;
  extra?: Record<string, string | string[]>;
}

export interface LangStrings {
  label: string;
  defaultPromptSide: PromptSide;
  fieldMap: {
    title: 'title' | 'title_zh';
    titleAlt: 'title' | 'title_zh';
    target: 'target' | 'target_zh';
    name: 'name' | 'name_zh';
    nameAlt: 'name' | 'name_zh';
    body: 'body_zh' | 'body_en';
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
    expand: string;
    collapse: string;
    translation: string;
    original: string;
    relatedPrompts: string;
    promptUnit: string;
    empty: string;
    methodIntro: string;
    // 数据库表格列名 / data-table column headers
    id: string;
    model: string;
    title: string;
    method: string;
    time: string;
    category: string;
    // 详情区 / expanded detail row
    // extra 键 -> 显示名；缺失的键回退到原键名 / label per `extra` key
    extraKeys: Record<string, string>;
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
    ljb: string;
    source: string;
    body: string;
    timeUnknown: string;
    wordsUnknown: string;
    ljbNone: string;
    empty: string;
    jumpToAttack: string;
    intro: string;
    extraKeys: Record<string, string>;
    /** extra 中枚举值 -> 显示名 / enum value labels, keyed by the extra key. */
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
  counts: { prompts: number; methods: number; models: number; systemPrompts: number };
  models: ModelEntry[];
  jailbreakMethods: JailbreakMethod[];
  prompts: Prompt[];
  systemPrompts: SystemPrompt[];
  /** Full prompt bodies as raw text, keyed by language then by system_prompt_id. */
  systemPromptBodies: Record<string, Record<string, string>>;
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