// Writes the duplicate-group report to docs/system-prompt-duplicates.md.
//
// The groups themselves are computed by scripts/detect-duplicates.mjs, which
// the build script also uses — this script only renders the human-readable
// summary.
//
// Usage: node scripts/report-duplicates.mjs

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { detectDuplicateGroups } from './detect-duplicates.mjs';

const root = path.resolve(import.meta.dirname, '..');
const bodyDir = path.join(root, 'content', 'system_prompts', 'en');

const bodies = {};
for (const f of fs.readdirSync(bodyDir).filter((x) => x.endsWith('.md'))) {
  bodies[f.replace(/\.md$/, '')] = fs.readFileSync(path.join(bodyDir, f), 'utf8');
}

const { groups, flagged, compared } = detectDuplicateGroups(bodies);

// Map body ids to archive entry ids so the report speaks the same ids the UI does.
const sysYaml = yaml.load(fs.readFileSync(path.join(root, 'system_prompts.yaml'), 'utf8'));
const entryOfBody = new Map(
  (sysYaml.prompts ?? []).map((p) => [String(p.system_prompt_id), String(p.id)])
);
const metaOfEntry = new Map((sysYaml.prompts ?? []).map((p) => [String(p.id), p]));

const pct = (n) => `${Math.round(n * 100)}%`;
const lines = [];

lines.push('# 英文系统提示词重复检测报告');
lines.push('');
lines.push(
  `对 \`content/system_prompts/en/\` 下全部 ${compared} 个英文正文做近重复检测，` +
    `得到 ${groups.length} 个重复组，涉及 ${flagged.size} 个正文文件。`
);
lines.push('');
lines.push('## 判定方法');
lines.push('');
lines.push('- 分词：词级 3-gram shingle（保留标点无关的词序列）');
lines.push('- 候选召回：MinHash(64 排列) + LSH 分桶');
lines.push('- 精确比对：对候选对计算 Jaccard 相似度与包含度');
lines.push('- 判定阈值：Jaccard ≥ 0.85 记为「近乎相同」；包含度 ≥ 0.95 记为「一方内容几乎完全包含另一方」');
lines.push('- 最小重叠量：50 个 shingle，滤掉短文本的偶然重合');
lines.push('');
lines.push('只比较英文正文：中文文件是同一条目的译文，比对中文只会重复报告同样的分组。');
lines.push('');
lines.push('## 使用说明');
lines.push('');
lines.push('站点在构建期自动计算重复组，无需手工维护：');
lines.push('');
lines.push('- 每条重复正文在列表里带 `DUP-xxxx` 标记；');
lines.push('- 打开详情抽屉可看到同组条目、相似度 / 包含度，并可直接跳转到同组其他条目；');
lines.push('- 列表上方的「隐藏重复条目」开关只保留每个重复组中最完整的一条。');
lines.push('');
lines.push('## 重复组明细');
lines.push('');

for (const g of groups) {
  const indexed = g.members.filter((m) => entryOfBody.has(m.id));
  const kindLabel = g.kind === 'near-identical' ? '近乎相同' : '内容包含';
  lines.push(`### ${g.id} · ${kindLabel} · ${g.members.length} 个正文（${indexed.length} 条已收录）`);
  lines.push('');
  lines.push('| 正文文件 | 收录编号 | 词数 | Jaccard | 包含度 | 关系 |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const m of g.members) {
    const entry = entryOfBody.get(m.id);
    const label = entry ? `\`${entry}\`` : '—';
    const rel = m.relation === 'near-identical' ? '近乎相同' : '内容包含';
    lines.push(
      `| \`${m.id}\` | ${label} | ${m.words} | ${pct(m.similarity)} | ${pct(m.containment)} | ${rel} |`
    );
  }
  lines.push('');
}

// Body files with no entry in the index — they never reach the UI, so a group
// whose fullest body sits among them still shows its repeats.
const orphans = Object.keys(bodies).filter((id) => !entryOfBody.has(id));
lines.push('## 附：未被索引收录的英文正文文件');
lines.push('');
lines.push('以下正文文件存在于 `content/system_prompts/en/`，但 `system_prompts.yaml` 中没有对应条目，因此不会出现在站点上：');
lines.push('');
for (const id of orphans) lines.push(`- \`${id}\``);
lines.push('');

fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'docs', 'system-prompt-duplicates.md'),
  lines.join('\n')
);

console.log(
  `report -> docs/system-prompt-duplicates.md (${groups.length} groups, ${flagged.size}/${compared} bodies flagged)`
);
