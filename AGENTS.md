# AGENTS.md

本文件只记录仓库的重要约束规则。不写实现细节、实现思路、TODO、目录清单或示例代码——这些内容会随代码演进过时，规则不会。新增内容前先删掉已失效的规则，不要叠加。

## 工程约束

- 包管理只用 pnpm，禁止 npm / yarn。
- 技术栈固定 React + Tailwind CSS，不引入其他 UI 库或样式方案。
- 全静态站点：无后端、无 API、无数据库，所有内容构建期就绪，产物部署到 GitHub Pages。
- 本仓库只归档与解释已公开的越狱提示词，不创作、不改进任何攻击技术。
- 前端按生产级水准要求（以 Apple 的 UI 设计为参照）：优先考虑用户使用体验；不在页面上写解释型文案（解释实现方式或教用户如何操作），用符合直觉的 UI 组件让用户自然领会产品意图。
- 译文未补齐不阻断构建：缺失语言只打 warning 并回退到英文正文，`pnpm dev` 与 Pages 构建都必须能正常跑通。

## 数据约束

- 所有数据与界面文案必须来自数据文件，禁止在代码中硬编码任何数据内容。
- `data.json` 只放索引与元数据；提示词正文由构建脚本按条产出独立文件，前端在详情打开时按需取用，不回灌进索引以免首屏被拖死。
- 不确定的字段留空，禁止伪造或填写不恰当的值。

## jailbreak_prompts.yaml 约束

顶层五个字段：`source`（数据来源清单）、`models`（模型清单）、`jailbreak_method`（越狱方法清单）、`target`（攻击目的清单）、`prompts`（越狱提示词条目，核心）。

- `models` 每行只有 `id` 与 `name`；`id` 为小写加连字符格式。
- `jailbreak_method` 每行只有 `id`、`name`、`name_zh`；展示顺序即声明顺序。方法指 LLM 越狱的具体做法（如伪造测试），不能是「提取系统提示词」「对齐绕过」这类泛泛的说法。方法原理文章在 `content/jailbreak_method/{zh,en}/` 下，文件名 = 方法 id。
- `target` 每行只有 `id`、`name`、`name_zh`；展示顺序即声明顺序。target 表示这段提示词的目的——要达成什么（如 `dan` 通用越狱、`system-prompt-extraction` 提取系统提示词、`malicious-code` 生成恶意代码），而不是解释工作原理；原理归 `jailbreak_method`。
- `prompts[].model_id` 必须能在 `models` 中找到，`prompts[].jailbreak_method` 必须能在 `jailbreak_method` 中找到，`prompts[].target` 必须能在 `target` 中找到，`prompts[].source_id` 必须能在顶层 `source` 中找到。

`prompts` 中每条记录的每个字段都必须仔细填写。

- `id` 必须为 `LJB-<年份>-<序号>` 格式，序号为 4 位数字，不足补前导 0（如 `LJB-2025-0001`）。年份取 `time` 的年份；`time` 未知时，以可得的线索时间（如来源仓库的 commit 时间、来源网页或其元数据的时间等）作为年份，不写 `LJB-XXXX`。
- `title` 中不应重复 model 名。
- `time` 是提示词公开 / 出现的时间，统一 `yyyy-mm-dd` 格式；来源只精确到月时日以 `01` 占位：来源明确标明的按来源所标填写；未标明的取来源链接的时间或来源 git 仓库的 commit 提交时间；仍无法确认才留空。它不是本仓库的归档 / commit 日期或文件名版本号，禁止拿这些顶替。
- `source_id` 引用顶层 `source` 的 id，指向数据来源大库；`source_url` 为该条目自身的详细 URL，通常为 source 大库下的子路径。
- `prompt` 必须是可直接输入 LLM 的可用 prompt 样本，不能是方法介绍或操作过程。若来源中没有 prompt 样本、只有方法说明，则不入库。
- `note` / `note_zh` 为条目其他值得注意的信息（英文 / 中文对照），如证据链接、来源背景；无则留空。

## system_prompts.yaml 约束

顶层两个字段：`source`（数据来源清单，字段同 jailbreak_prompts.yaml 的 `source`）与 `prompts`（系统提示词条目），后者收录已离开厂商控制流、被外界看到的系统提示词正文。

- `id` 必须为 `LSP-<年份>-<序号>` 格式，序号为 4 位数字，不足补前导 0（如 `LSP-2023-0001`）。年份取 `time` 的年份；`time` 未知时，以可得的线索时间（如来源仓库的 commit 时间、来源网页或其元数据的时间等）作为年份，不写 `LSP-XXXX`。
- `time` 是该提示词公开 / 泄露的时间，统一 `yyyy-mm-dd` 格式；来源只精确到月时日以 `01` 占位：来源明确标明的按来源所标填写；未标明的取来源链接的时间或来源 git 仓库的 commit 提交时间；仍无法确认才留空。它不是本仓库的归档 / commit 日期或文件名版本号，禁止拿这些顶替。
- `disclosureType` 披露类型，只有 `official-open-source`（官方开源）与 `leaked`（泄露）两种值，构建脚本强校验。
- `surface` 产品载体，取值 `chat` / `api` / `ide` / `cli` / `agent` / `browser` / `mobile` / `desktop`；确需更具体时可用自由文本，界面回退显示原值。
- `note` 具体泄露方法及其他直接了解的信息（英文）；`note_zh` 为其中文对应。
- `source_id` 引用顶层 `source` 的 id，指向数据来源大库；`source_url` 为该条目自身的详细 URL，通常为 source 大库下的子路径。
- `system_prompt_id` 必须能在 `content/system_prompts/en/` 与 `content/system_prompts/zh/` 下找到同名 `.md` 文件。
- 词数不手写，由构建脚本按 `content/system_prompts/en/` 原文实数计算。
- 重复正文不手写标记，由构建脚本从英文正文算出重复组并下发到界面；数据文件里不写重复字段。

## 重复正文约束

同一份厂商提示词常被多个公开来源重复收录，文件名各不相同。这些重复必须被标记出来，而不是当成不同条目各自呈现。

- 重复检测只比对 `content/system_prompts/en/` 的英文正文。中文文件是同一条目的译文，比对中文只会重复报告同样的分组。
- 判定「大量重复」用两条线：Jaccard 相似度 ≥ 0.85（近乎相同），或包含度 ≥ 0.95（一方内容几乎完全包含另一方）。阈值写在 `scripts/detect-duplicates.mjs` 里，不散落到别处。
- 重复组、词数这类派生数据一律由构建脚本算出并下发，禁止在 yaml 或前端硬编码。
- 同一提示词的不同抓取版本只保留最完整的一条（`content/system_prompts/en/` 英文正文词数最多者），其余条目连同 `{en,zh}` 正文文件一并从库中移除；保留哪条按词数判定，不手工指定。
- 未被 `system_prompts.yaml` 收录的英文正文文件不进界面，但仍参与重复检测，以免漏判某一组的最完整版本。

## content/system_prompts/ 原文约束

存放系统提示词正文，与 `content/jailbreak_method/{zh,en}/*.md`、`content/jailbreak_source/{zh,en}.md` 同一套按语言分目录的组织方式。

- 每篇必须是**真实完整的产品系统提示词正文本体**，不得是介绍文章、能力概述或节选或摘要。
- 不设硬性词数下限。真实的产品提示词可能只有几句话，短不等于残缺；判断标准是内容是否确为该产品的系统提示词正文。
- 泄露内容中的粗俗措辞、冒犯性表述与脏话一律**原样保留，不做删改或降级**。这类内容本身就是观察厂商对齐策略失效边界的研究材料，删改会破坏归档的准确性。
- `en/` 与 `zh/` 必须成对存在，文件名相同（不含扩展名）。
- 从源码文件（`.ts` / `.py` / `.j2` 等）提取时，剥离 import、函数定义、变量赋值等代码外壳，只保留提示词字符串本身。
- 从抓取页面提取时，剥离去导航栏、广告、评论区、问答记录外壳与文件头部的来源元信息行。
- 译文忠实直译，不意译、不润色、不压缩；保持原文的标题层级、列表项与标签结构；代码块、JSON schema、特殊 token 模板保持英文原样。

## source 数据来源约束

数据来源的本体是两个 yaml 的顶层 `source` 清单；`content/jailbreak_source/{zh,en}.md` 与 `content/system_source/{zh,en}.md` 只保留说明文字，表格由构建脚本从 `source` 数据渲染并替换其中的 `<!-- SOURCES_TABLE -->` 占位符，禁止在 md 中手写表格。

`source` 每行的字段：`id`、`title`（显示名，构建时以 markdown 链接指向 `url`）、`url`（大库链接）、`index_time`、`commit`、`description`、`description_zh`、`data_count`（构建脚本按 `source_id` 统计，禁止手写）。

- `index_time` 为该来源数据被索引到本库的时间，取数据入库的 git 提交日期；不是文件名版本号或归档日期。
- `commit` 为该来源是 GitHub 仓库时索引所用的 commit；非 GitHub 来源留空。
- 表格五列依次为 `title`、`description`（随界面语言切换）、`index_time`、`commit`、`data_count`，表头文案在 `i18n.yaml` 的 `sourceTable` 中声明；`zh` 与 `en` 来源条目一一对应。
- 只收录实际贡献了数据条目的来源；纯参考文献或相关文章（研究综述、标准条目、媒体转述等未被任一 `source_id` 引用者）不得收录。
