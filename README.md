# Jailbreak Prompts · 越狱提示词

一个可搜索的**双语**（中 / 英）静态数据库，分成两个互相独立的板块：

- **越狱提示词** —— 收录已公开的大模型越狱提示词与对抗性攻击方法，并为每一种方法提供配套的原理解释。
- **系统提示词** —— 收录已离开厂商控制流、被外界看到的各家产品系统提示词**全文**。

> **仅限学术研究、红队测试与防御性 AI 对齐使用。** 本仓库只**整理与展示**已公开的研究数据，不创作、不改进任何越狱方法，请勿用于任何有害、违法或不道德的目的。

## 功能

- **两级 Tab**：顶部先选板块（越狱提示词 / 系统提示词），再选该板块下的子页。越狱提示词下为「越狱提示词库 / 越狱方法 / 数据来源」，系统提示词下为「系统提示词库 / 数据来源」。
- **提示词库表格**：以数据库表格呈现，主字段为编号、模型、标题、方法、质量分、时间；点击任意行打开**详情抽屉**（攻击目的、类别、数据来源、附加信息及完整提示词），同一时间仅打开一条。
- **列排序**：点击表头在升序 / 降序间切换。
- **系统提示词全文**：打开任意一行即在详情抽屉中显示该提示词的**完整原文**，中英双语随界面语言切换；元信息含厂商、公开时间、词数、对应越狱提示词、泄露渠道与提取手段。
- **复制正文**：详情抽屉的正文面板可一键复制当前语言侧的全文，复制成功后按钮短暂显示确认状态。
- **可分享的页面状态**：当前板块、子页、筛选条件和打开的详情都写入 URL hash，刷新、分享链接或浏览器前进 / 后退都会还原同一视图。
- **亮暗双主题**：顶栏一键切换，默认跟随系统偏好，选择记入 `localStorage`。
- **全局中英切换**：`title`、攻击目的、方法名、文章、系统提示词全文等字段随界面语言切换。
- **提示词语言独立切换**：越狱提示词每条带单独的中文 / 英文正文切换，与全局界面语言互不影响。
- **搜索**：在当前板块内即时过滤。越狱库检索编号、标题、模型、方法、目标与时间；系统提示词库检索编号、产品、厂商、来源链接与备注。正文按需加载，不参与列表检索。
- **方法介绍**：列出全部越狱方法，每种配中英双语原理文章；点击详情中的「方法」标签跳转到对应方法页，方法页中的相关提示词可直达其详情。

## 目录结构

```
jailbreak_prompts.yaml # 越狱提示词主数据：models + jailbreak_method + target 元数据 + prompts 条目
system_prompts.yaml     # 系统提示词元数据：prompts 条目（索引正文）
content/system_prompts/en/*.md # 系统提示词英文原文
content/system_prompts/zh/*.md # 系统提示词中文译文
i18n.yaml               # 全部 UI 文案与站点配置
content/jailbreak_method/zh/*.md # 越狱方法原理文章（中文），文件名 = 方法 id
content/jailbreak_method/en/*.md # 越狱方法原理文章（英文）
content/jailbreak_source/{zh,en}.md # 越狱提示词板块的数据来源清单
content/system_source/{zh,en}.md # 系统提示词板块的数据来源清单
scripts/
  build-data.mjs        # 汇总 yaml + md → public/ 下的数据与正文文件，并执行数据校验
  detect-duplicates.mjs # 系统提示词正文的重复检测
  report-duplicates.mjs # 重复检测报告
public/data.json        # 构建产物：索引与元数据（gitignore）
public/system-bodies/   # 构建产物：系统提示词正文，按语言一条一个文件（gitignore）
public/prompt-bodies/   # 构建产物：越狱提示词正文，一条一个文件（gitignore）
src/                    # 站点前端（React + Tailwind CSS v4）
index.html
```

## 数据格式（`jailbreak_prompts.yaml`）

顶层五个字段：`source`（数据来源清单）、`models`（模型清单）、`jailbreak_method`（越狱方法清单）、`target`（攻击目的清单）、`prompts`（越狱提示词条目）。

```yaml
source:                               # 数据来源清单；来源页表格由此自动生成
  - id: quincunx33-ai-jailbreak       # 来源 id，prompts[].source_id 引用它
    title: "Quincunx33/Ai-jailbreak"  # 显示名
    url: "https://github.com/..."     # 大库链接
    index_time: "2026-10-17"          # 索引到本库的时间（数据入库 git 提交日期）
    commit: "d40ff98..."              # GitHub 来源索引时使用的 commit；非 GitHub 留空
    description: "..."                # 来源简介（英）
    description_zh: "..."             # 来源简介（中）
                                      # data_count 由构建脚本按 source_id 统计，不手写

models:
  - id: gemma-3-12b              # 模型 slug（小写字母/数字/-）
    name: Gemma-3 12B            # 模型显示名

jailbreak_method:
  - id: fake-test                # 方法 id，prompts[].jailbreak_method 引用它
    name: "Fake Test & Role Confusion"
    name_zh: "伪测试与角色混淆"

target:
  - id: dan                      # 攻击目的 id，prompts[].target 引用它
    name: "Do Anything Now (Universal Jailbreak)"
    name_zh: "通用越狱（什么都能做）"

prompts:
  - id: LJB-2025-0001                        # 唯一编号：LJB-<年份>-<序号>，序号 4 位补前导 0
    title: "Fake Test (Mode Confusion)"       # 英文标题（不含模型名）
    title_zh: "伪测试（模式混淆）"              # 中文标题
    model_id: gemma-3-12b                     # 引用 models[].id
    time: "2025-03-01"                        # 公开/出现时间，yyyy-mm-dd；日未知以 01 占位
    source_id: davidegat-happy-prompts        # 引用 source[].id（数据来源大库）
    source_url: "https://github.com/.../blob/..."  # 具体条目 URL（通常为大库子路径）
    jailbreak_method: fake-test               # 引用 jailbreak_method[].id
    target: dan                               # 引用 target[].id（攻击目的）
    prompt: |-                                # 提示词本体（英文原文，可直接输入 LLM）
      ...
    prompt_zh: |-                             # 提示词中文翻译
      ...
    note: "Proofs: https://..."               # 其他值得注意的信息（英）
    note_zh: "证据：https://…"                 # 其他值得注意的信息（中），无则留空
    quality_score: 7                          # 1-10 整数，人工质检标注
```

构建脚本会校验 `prompts[].id` 的格式与唯一性、`time` 的格式与年份一致性、所有 `source_id` / `model_id` / `jailbreak_method` / `target` 引用，以及 `quality_score` 的取值范围。日期字段必须写成带引号的 `yyyy-mm-dd` 字符串，未加引号的标量会被 YAML 解析成日期对象并导致构建失败。

## 数据格式（`system_prompts.yaml`）

顶层有 `source`（数据来源清单，字段同 `jailbreak_prompts.yaml` 的 `source`）与 `prompts`，后者是系统提示词的**元数据索引**；正文本体存放在 `content/system_prompts/{en,zh}/` 下。

```yaml
prompts:
  - id: LSP-2023-0001             # 唯一编号：LSP-<年份>-<序号>，序号 4 位补前导 0
    product: "Bing Chat (Sydney)" # 产品名
    vender: "Microsoft"           # 厂商
    time: "2023-02-09"            # 公开/泄露时间（非归档日期）；确认不了留空
    disclosureType: leaked        # official-open-source / leaked
    surface: chat                 # chat / api / ide / cli / agent / browser / mobile / desktop
    note: "..."                   # 具体泄露方法及其他直接了解的信息（英）
    note_zh: "..."                # note 的中文对应
    source_id: businessinsider-bing-sydney  # 引用顶层 source[].id（数据来源大库）
    source_url: "https://..."     # 具体条目 URL（通常为大库子路径）
    system_prompt_id: "bing-sydney" # 对应 content/system_prompts/{en,zh}/ 下的文件名
    quality_score: 7              # 1-10 整数，人工质检标注
```

词数不手写，由构建脚本按 `content/system_prompts/en/` 原文计算；重复正文分组也由构建脚本比对英文正文后生成，不在数据文件里标注。

正文文件与 `content/jailbreak_method/{zh,en}/*.md` 同一套按语言分目录的组织方式：`content/system_prompts/en/<system_prompt_id>.md` 为原文，`content/system_prompts/zh/<system_prompt_id>.md` 为译文。缺失译文只打 warning 并回退到英文正文，不阻断构建。每篇**必须是真实完整的提示词正文**，不收介绍文章或节选；**不设硬性词数下限**，真实的产品提示词可能只有几句话。

`quality_score` 衡量正文的完整度、信息量与研究价值：完整但常规的正文为中等分，片段、子章节或重复组中被包含的次要版本为低分，完整、独特且信息量高的真实产品提示词为高分。

## 本地开发

```bash
pnpm install
pnpm run dev      # 生成 data.json 并启动 Vite dev server
pnpm run build    # 生成 data.json、类型检查并构建到 dist/
pnpm run preview  # 预览构建产物
```

`pnpm run build` 会先执行数据校验，任何 id、日期、引用或评分不合法都会直接失败，不会产出半成品。

## 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动安装依赖、构建并发布 `dist/` 到 GitHub Pages。

首次使用需在仓库 **Settings → Pages** 中将 Source 设为 **GitHub Actions**。站点部署在子路径 `/<repo>/` 下，该路径由 `vite.config.ts` 的 `base` 控制。

## 数据来源

两个板块各有独立的数据来源页，随界面语言切换。来源清单以两个 yaml 的顶层 `source` 字段结构化存储（含 id、标题、链接、索引时间、commit 与中英简介），构建脚本按 `source_id` 统计各来源条目数并自动渲染来源页表格（`content/jailbreak_source/{zh,en}.md` 与 `content/system_source/{zh,en}.md` 只保留说明文字，表格替换其中的 `<!-- SOURCES_TABLE -->` 占位符）：

- 越狱提示词：`jailbreak_prompts.yaml` 顶层 `source`，渲染到 `content/jailbreak_source/zh.md` 与 `content/jailbreak_source/en.md`。核心归档来源为 [Quincunx33/Ai-jailbreak](https://github.com/Quincunx33/Ai-jailbreak)。
- 系统提示词：`system_prompts.yaml` 顶层 `source`，渲染到 `content/system_source/zh.md` 与 `content/system_source/en.md`，涵盖厂商官方开源仓库、社区归档库与媒体报道。

表格字段：`title`（来源标题，链接到原始出处）、`description`（来源简介，随界面语言切换）、`index_time`（索引到本库的时间）、`commit`（GitHub 来源在索引时使用的 commit，非 GitHub 来源留空）、`data_count`（该来源在库中的条目数，构建时自动统计）。仅保留实际贡献数据条目的来源，纯参考文献与相关文章不予收录；条目数为零的来源会让构建失败。