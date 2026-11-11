import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'jailbreak_prompts.yaml');
const SEP = '\n  - id: ';

function readText() {
  return fs.readFileSync(dataPath, 'utf8');
}

function splitEntries(text) {
  const parts = text.split(SEP);
  const head = parts.shift();
  return { head, entries: parts };
}

function entryId(body) {
  return body.match(/^(\S+)/)?.[1];
}

function blockAfter(entry, fieldLine) {
  const rest = entry.slice(entry.indexOf(fieldLine) + fieldLine.length);
  const next = rest.match(/\n( {4}\S|$)/);
  return next ? rest.slice(0, next.index) : rest;
}

function hasPromptZh(entry) {
  const m = entry.match(/^    prompt_zh:.*$/m);
  if (!m) return false;
  return blockAfter(entry, m[0]).trim() !== '';
}

function promptFieldRange(entry) {
  const lines = entry.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^    prompt:/.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) throw new Error('prompt field not found');
  let end = start + 1;
  for (; end < lines.length; end += 1) {
    const line = lines[end];
    if (line.trim() === '') continue;
    if (line.match(/^ */)[0].length <= 4) break;
  }
  return { lines, end };
}

function normalize(value) {
  return value
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : line))
    .join('\n');
}

function renderBlock(value) {
  return normalize(value)
    .split('\n')
    .map((line) => (line === '' ? '' : `      ${line}`))
    .join('\n');
}

function applyOne(entry, translation) {
  if (hasPromptZh(entry)) return { entry, skipped: true };
  if (translation.trim() === '') throw new Error('empty translation');
  const { lines, end } = promptFieldRange(entry);
  lines.splice(end, 0, '    prompt_zh: |-', renderBlock(translation));
  return { entry: lines.join('\n'), skipped: false };
}

function pendingOf(parsed) {
  return parsed.prompts.filter((p) => !p.prompt_zh || String(p.prompt_zh).trim() === '');
}

function status() {
  const parsed = yaml.load(readText());
  const total = parsed.prompts.length;
  const pending = pendingOf(parsed).length;
  console.log(JSON.stringify({ total, translated: total - pending, pending }));
}

function exportPending(count, outFile) {
  const parsed = yaml.load(readText());
  const missing = pendingOf(parsed);
  const batch = missing.slice(0, count).map((p) => ({ id: p.id, title: p.title, prompt: p.prompt }));
  fs.writeFileSync(outFile, JSON.stringify(batch, null, 2));
  console.log(JSON.stringify({ exported: batch.length, remaining: missing.length }));
}

function verify(before, translations) {
  const after = yaml.load(readText());
  if (after.prompts.length !== before.prompts.length) throw new Error('prompt count changed');
  for (let i = 0; i < after.prompts.length; i += 1) {
    if (after.prompts[i].id !== before.prompts[i].id) throw new Error(`order changed at ${i}`);
    if (after.prompts[i].prompt !== before.prompts[i].prompt) throw new Error(`prompt body changed: ${after.prompts[i].id}`);
  }
  for (const [id, value] of Object.entries(translations)) {
    const rec = after.prompts.find((p) => p.id === id);
    if (!rec) throw new Error(`missing after write: ${id}`);
    if (rec.prompt_zh !== normalize(value)) throw new Error(`prompt_zh mismatch after write: ${id}`);
  }
}

function apply(translationFile) {
  const translations = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
  const before = yaml.load(readText());
  const applied = [];
  const skipped = [];

  for (const [id, value] of Object.entries(translations)) {
    const { head, entries } = splitEntries(readText());
    const i = entries.findIndex((e) => entryId(e) === id);
    if (i === -1) throw new Error(`unknown id: ${id}`);
    const next = applyOne(entries[i], value);
    if (next.skipped) {
      skipped.push(id);
      continue;
    }
    entries[i] = next.entry;
    fs.writeFileSync(dataPath, [head, ...entries].join(SEP));
    applied.push(id);
  }

  verify(before, translations);
  console.log(JSON.stringify({ applied: applied.length, skipped: skipped.length, skippedIds: skipped }));
  status();
}

const [, , arg, arg2, arg3] = process.argv;
if (arg === '--status') status();
else if (arg === '--pending') exportPending(Number(arg2 ?? 10), arg3 ?? '/tmp/pending.json');
else if (arg) apply(arg);
else console.error('usage: --status | --pending <n> <out.json> | <translations.json>');