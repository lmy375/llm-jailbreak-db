import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'jailbreak_prompts.yaml');
const SEP = '\n  - id: ';
const LABEL = '{{PAYLOAD}}';

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

function fieldRange(entry, field) {
  const lines = entry.split('\n');
  const header = new RegExp(`^    ${field}:`);
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (header.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;
  let end = start + 1;
  for (; end < lines.length; end += 1) {
    const line = lines[end];
    if (line.trim() === '') continue;
    if (line.match(/^ */)[0].length <= 4) break;
  }
  return { lines, start, end };
}

function normalize(value) {
  return String(value)
    .replace(/\r\n/g, '\n')
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

function replaceField(entry, field, value) {
  const range = fieldRange(entry, field);
  if (!range) throw new Error(`${field} field not found`);
  const { lines, start, end } = range;
  const header = field === 'prompt' ? '    prompt: |-' : '    prompt_zh: |-';
  lines.splice(start, end - start, header, renderBlock(value));
  return lines.join('\n');
}

function danEntries() {
  return yaml.load(readText()).prompts.filter((p) => p.target === 'dan');
}

function status() {
  const all = danEntries();
  const done = all.filter((p) => String(p.prompt).includes(LABEL));
  const zhDone = done.filter((p) => String(p.prompt_zh ?? '').includes(LABEL));
  console.log(
    JSON.stringify(
      {
        danTotal: all.length,
        templated: done.length,
        pending: all.length - done.length,
        zhWithLabel: zhDone.length,
        duplicateIds: all.length - new Set(all.map((p) => p.id)).size,
      },
      null,
      2
    )
  );
}

function exportBatch(offset, count, outFile, view) {
  const pending = danEntries().filter((p) => !String(p.prompt).includes(LABEL));
  const slice = pending.slice(offset, offset + count);
  const rows = slice.map((p) => ({
    id: p.id,
    title: p.title,
    model_id: p.model_id,
    jailbreak_method: p.jailbreak_method,
    ...(view
      ? {
          head: String(p.prompt).slice(0, 180),
          mid: String(p.prompt).slice(180, -260),
          tail: String(p.prompt).trim().slice(-260),
        }
      : { prompt: p.prompt, prompt_zh: p.prompt_zh }),
  }));
  fs.writeFileSync(outFile, JSON.stringify({ remaining: pending.length, offset, rows }, null, 2));
  console.log(JSON.stringify({ exported: rows.length, remaining: pending.length, offset, out: outFile }));
}

function exportItem(id, outFile) {
  const rec = danEntries().find((p) => p.id === id);
  if (!rec) throw new Error(`unknown id: ${id}`);
  fs.writeFileSync(outFile, JSON.stringify(rec, null, 2));
  console.log(JSON.stringify({ id, out: outFile, length: String(rec.prompt).length }));
}

// A change supports:
//   set: { prompt, prompt_zh }             replace the whole field
//   replace: [[from, to], ...]             applied to both languages
//   replace_zh: [[from, to], ...]          applied to Chinese only
//   append / append_zh: string             appended as a trailing paragraph
function materialize(change, original) {
  const set = change.set ?? {};
  let prompt = set.prompt ?? original.prompt;
  let promptZh = set.prompt_zh ?? original.prompt_zh;
  for (const [field, marker] of [['prompt', change.cutAt], ['prompt_zh', change.cutAt_zh]]) {
    if (!marker) continue;
    const source = field === 'prompt' ? prompt : promptZh;
    const at = String(source).indexOf(marker);
    if (at === -1) throw new Error(`cutAt marker not found in ${field}: ${marker}`);
    if (field === 'prompt') prompt = String(source).slice(0, at).trimEnd() + '\n\n{{PAYLOAD}}';
    else promptZh = String(source).slice(0, at).trimEnd() + '\n\n{{PAYLOAD}}';
  }
  for (const [from, to] of change.replace ?? []) {
    if (!from) throw new Error('empty replace source');
    prompt = String(prompt).split(from).join(to);
    promptZh = String(promptZh).split(from).join(to);
  }
  for (const [from, to] of change.replace_zh ?? []) {
    if (!from) throw new Error('empty replace_zh source');
    promptZh = String(promptZh).split(from).join(to);
  }
  if (change.append) prompt = `${String(prompt).trimEnd()}\n\n${change.append}`;
  if (change.append_zh) promptZh = `${String(promptZh).trimEnd()}\n\n${change.append_zh}`;
  return { prompt: String(prompt), prompt_zh: String(promptZh) };
}

function apply(changesFile) {
  const changes = JSON.parse(fs.readFileSync(changesFile, 'utf8'));
  const before = yaml.load(readText());
  const beforeById = new Map(before.prompts.map((p) => [p.id, p]));
  const expected = new Map();
  const applied = [];

  for (const [id, change] of Object.entries(changes)) {
    const original = beforeById.get(id);
    if (!original) throw new Error(`unknown id: ${id}`);
    if (original.target !== 'dan') throw new Error(`not a dan target entry: ${id}`);
    const next = materialize(change, original);
    if (!next.prompt.includes(LABEL)) throw new Error(`prompt lacks ${LABEL}: ${id}`);
    if (!next.prompt_zh.includes(LABEL)) throw new Error(`prompt_zh lacks ${LABEL}: ${id}`);
    expected.set(id, next);

    const { head, entries } = splitEntries(readText());
    const i = entries.findIndex((e) => entryId(e) === id);
    if (i === -1) throw new Error(`entry not found in text: ${id}`);
    let entry = replaceField(entries[i], 'prompt', next.prompt);
    entry = replaceField(entry, 'prompt_zh', next.prompt_zh);
    entries[i] = entry;
    fs.writeFileSync(dataPath, [head, ...entries].join(SEP));
    applied.push(id);
  }

  const after = yaml.load(readText());
  if (after.prompts.length !== before.prompts.length) throw new Error('prompt count changed');
  for (let i = 0; i < after.prompts.length; i += 1) {
    const a = after.prompts[i];
    const b = before.prompts[i];
    if (a.id !== b.id) throw new Error(`order changed at ${i}: ${b.id} -> ${a.id}`);
    const exp = expected.get(a.id);
    if (exp) {
      if (normalize(a.prompt) !== normalize(exp.prompt)) throw new Error(`prompt mismatch: ${a.id}`);
      if (normalize(a.prompt_zh) !== normalize(exp.prompt_zh)) throw new Error(`prompt_zh mismatch: ${a.id}`);
    } else if (a.prompt !== b.prompt || a.prompt_zh !== b.prompt_zh) {
      throw new Error(`unrelated entry changed: ${a.id}`);
    }
  }
  console.log(JSON.stringify({ applied: applied.length, ids: applied }));
  status();
}

const [, , arg, arg2, arg3, arg4] = process.argv;
if (arg === '--status') status();
else if (arg === '--export') exportBatch(Number(arg2 ?? 0), Number(arg3 ?? 8), arg4 ?? '/tmp/payload-batch.json', false);
else if (arg === '--view') exportBatch(Number(arg2 ?? 0), Number(arg3 ?? 30), arg4 ?? '/tmp/payload-view.json', true);
else if (arg === '--item') exportItem(arg2, arg3 ?? '/tmp/payload-item.json');
else if (arg === '--apply') apply(arg2 ?? '/tmp/payload-changes.json');
else console.error('usage: --status | --export <offset> <n> <out.json> | --view <offset> <n> <out.json> | --item <id> <out.json> | --apply <changes.json>');