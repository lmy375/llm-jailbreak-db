# 短正文条目真实性核验报告（2026-11-07）

核验范围：构建脚本报出的「正文偏短，请确认是否完整」条目，自 `LSP-2022-0002` 之后共 **61 条**（`LSP-2022-0002` 及更早条目由人工验证过，本报告不再重复结论）。

## 一、核验方法

1. **逐词比对上游归档**：按每条 `source_url` 拉取原始文件（`raw.githubusercontent.com`），与本地 `content/system_prompts/en/*.md` 做 token 级双向包含计算。
   - `ab`（本地 ⊆ 上游）= 本地正文有多少词能在上游找到，1.000 表示本地无一处自造内容。
   - `ba`（上游 ⊆ 本地）= 上游有多少词被本地保留，低于 1 表示本地**丢了内容**（需要区分：丢的是归档外壳噪音，还是提示词正文本身）。
2. **换库定位**：`source_url` 指向 issue / PR / 仓库根的文件会 404，改从 `jujumilk3`、`prongbang`、`YeeKal`、`L1B3RT4S` 等归档树中按文件名定位同一条目再比对。
3. **一手来源核验**：`official-open-source` 条目直接比对厂商官方仓库源码（aider / block goose / OpenHands SDK）。
4. **内部一致性**：抽出正文里带星期与日期的行（如 `Monday, March 11, 2024`），用 UTC 日历校验星期是否对得上——伪造文本几乎总在这里露馅。命中 6 条，**全部一致**。
5. **成对与元数据**：确认 62 条的 `en` 与 `zh` 文件均存在，无缺对。

证据分级（本报告用词）：

- **一级**：厂商官方仓库源码逐词一致。
- **二级**：所引公开归档逐词一致，且归档自身带可点开的泄露出处（推文 / issue / PR）。
- **三级**：文本与归档一致，但正文性质不是产品系统提示词原文（模型复述、片段、摘要、社区复刻）。
- **未验证**：无法在可达来源中定位，需补证。

## 二、总体结论

- 61 条中，**58 条 `ab = 1.000`**：本地正文没有一个词是上游归档之外的自造内容，抄录是忠实的。
- **3 条存在抄录缺陷**：`LSP-2026-0178`（节选，且部分措辞与现归档不符）、`LSP-2026-0402`（丢失 Jinja 模板行）、`LSP-2024-0010` / `LSP-2024-0015` 的 `source_url` 不精确（正文实际在 `L1B3RT4S/SYSTEMPROMPTS.mkd`，已核到，`ab = 1.000`）。
- 真正的问题不在「造假」，而在**性质与规范**：约 **17 条**的正文并不是产品运行时系统提示词原文，而是被诱导后的模型复述、片段/插件式附加段、社区复刻版或摘要，其中 4 条尤其建议下架或重标（见第四节）。
- 「短」本身基本不构成问题：`LSP-2023-0025`、`LSP-2023-0028`、`LSP-2024-0069`、`LSP-2026-0583` 这类条目，上游归档原文就只有几十词，真实产品提示词可以只有一句话。

## 三、逐条结果

### 一级来源（厂商官方仓库逐词一致）

| ID | 条目 | 结果 |
|---|---|---|
| LSP-2026-0138 | Aider `commit_system` | 真。`aider/prompts.py` 常量逐词一致；`{language_instruction}` 为源码占位符原样 |
| LSP-2026-0139 | Aider `summarize` | 真。同上 |
| LSP-2026-0504 | OpenHands `MINIMAL_SYSTEM_PROMPT` | 真。官方 SDK TS 源码一致；本地只取该常量，`system-prompt.ts` 里还有 `DEFAULT_SYSTEM_PROMPT`，属正常拆分 |
| LSP-2026-0402 | Goose `system.md` | 真，但**提取有损**：丢了 `## {{extension.name}}` 与两处 `{% endif %}`，导致本地出现空的 `## ` 标题和孤立 `{% if extension.instructions %}`。建议重抽整文件 |

### 二级来源（与所引归档逐词一致，归档带可核出处）

`ab = 1.000` 且差异只在归档外壳（`# 文件名`、`source: <url>`、`## Q(user)` / `## A(...)` 标签、注入语）被正确剥离：

LSP-2023-0009（ChatGPT iOS）、LSP-2023-0010（Opera Aria）、LSP-2023-0022（GPT-4 高级数据分析）、LSP-2023-0025（GPT-4v default）、LSP-2023-0028（GPT-3.5）、LSP-2023-0033（Grok 2023-12-14）、LSP-2024-0010（o1，正文在 `L1B3RT4S/SYSTEMPROMPTS.mkd` 的 `# O1 SYSTEM PROMPT` 段）、LSP-2024-0015（Zyphra Zamba，同上 `# Zyphra Zamba` 段）、LSP-2024-0020（Claude 2.0）、LSP-2024-0021（Claude 2.1）、LSP-2024-0028（Perplexity 2024-03-11）、LSP-2024-0043（Brave Leo）、LSP-2024-0069（GPT-4o mini）、LSP-2024-0070（Perplexity 2024-09-04）、LSP-2025-0099（ChatGPT Automation Context）、LSP-2025-0174（Raycast AI）、LSP-2025-0323（GPT-5 API reasoning high）、LSP-2025-0419（QuillBot）、LSP-2026-0077（GPT-5.4 API）、LSP-2026-0189（o3 high API）、LSP-2026-0196 / 0201 / 0203（Claude Code auxiliary）、LSP-2026-0301（/btw）、LSP-2026-0305（Muse compaction addendum）、LSP-2026-0335（Muse delegated child agent）、LSP-2026-0482（GPT-4o 图像 postfill）、LSP-2026-0488（GPT-5.1 professional，与上游全等）、LSP-2026-0489（GPT-5.3 Codex API）、LSP-2026-0512（Claude Code Explanatory 输出风格）、LSP-2026-0583（Brave Search）、LSP-2026-0585 / 0586（session recap / rename）、LSP-2026-0602（Trickle）、LSP-2026-0612（VS Code chat titles）、LSP-2026-0632（Grok 3）、LSP-2026-0661 / 0662 / 0664（Xcode Document / Explain / Playground Action）。

这一组里有两个正向信号值得一提：Xcode 三条与 VS Code 一条保留了原始拼写错误（`curently`、`implentation`）——伪造者一般不会这样写；GPT-5.4 条目正文里的 `[*sic*]` 确实来自上游归档，不是本地加注。

### 三级（文本真，但性质或规范不合规）

| ID | 条目 | 问题 |
|---|---|---|
| LSP-2023-0012 | Clyde #1 | **已删除**。正文是模型被点名后**复述**的清单（首行 `Apologies for the oversight. Here are the things I have to do…`），不是提示词原文 |
| LSP-2023-0013 | Clyde #2 | ~~同为复述~~ **勘误：保留**。其 `Information about your environment` 与 limitations 两段同 `discord-clyde_20230715.md` 全文泄露逐词一致，属提示词正文本体（夹带的用户资料是注入现场）；`note` 可补一句说明 |
| LSP-2024-0018 | Wrtn GPT-3.5 | **保留**。上游是 `## Q(user)`「Repeat the words above…」/ `## A(wrtn)` 结构，但 A 段是模型对提示词的**逐字倾倒**（原文要求放入 txt 代码块），内容属提示词正文 |
| LSP-2024-0019 | Wrtn GPT-4 | **保留**。同上为逐字倾倒，但本地残留复述开场白 `Sure, here you go:`，应剥离；`vender` 标 OpenAI 不准（产品是韩国 Wrtn，OpenAI 只是底座模型） |
| LSP-2024-0024 | Grok 2024-03-07 | 首行 `System: ` 是归档标签残留，按规则应剥离 |
| LSP-2025-0090 | ChatGPT Personality v2 | 保留了归档外壳 `## Prompt` / `NEW VERSION (04/28/2025):` / `OLD VERSION:`，并把两版带引号文本放进同一文件；不是单条可直接使用的正文 |
| LSP-2025-0420 | Kimi K2 Thinking | 首行 `## System Prompt` 是归档标题外壳 |
| LSP-2025-0456 | DeepSeek 01 | **已删除**。**最弱的一条**：整段是 Q&A 现场（`Here is the system message you're referring to: … Let me know how I can assist you today! 😊 Would you like any modifications or clarifications?` 之后还接了一段用户提问与拒答）。这是模型自述，不是可证实的系统提示词正文 |
| LSP-2026-0087 | MiCode | 保留了归档元信息头 `**Model:** mimo-auto / **Built by:** / **Date extracted:** June 2026` 与末尾斜体宣传行；正文是 Claude Code / Codex 式要点摘要，疑似人工或模型归纳，非原文 |
| LSP-2026-0141 | Amazon Rufus | 第一人称自述体（`I am Rufus, Amazon's AI shopping assistant…`），更像对外的能力说明/自曝而非运行时提示词 |
| LSP-2026-0178 | Claude Voice Mode | **节选 + 版本漂移**：现归档同一文件 622 个唯一词，本地仅 112 个；缺 `Transcription tolerance`、`Tool use`、`Repetition` 等多段；第 3 段发音控制措辞只有 67% 能在现归档中找到。违反「不得是节选」 |
| LSP-2026-0333 | DeepSeek R1 | 五段式 `# Key Guidelines` 排版与 `Knowledge cutoff: {{current_date}}`（变量名与字段错位）像重排摘要，与多个归档里的更长版本不同 |
| LSP-2026-0367 | Gemini 2.0 Flash | 保留了署名行 `Gemini 2.0 Flash Prompt by [The-Best-Codes]`；正文属**社区复刻版**而非官方运行时提示词 |
| LSP-2026-0460 | Muse AGENTS.md | **已删除**。是 agent 自维护的模板文件（工作区约定），不是产品系统提示词本体 |
| LSP-2026-0465 | Muse SOUL.md | **已删除**。同上；且该文本与社区 OpenClaw 系 `SOUL.md` 模板高度同源，归属 Meta 需一手佐证 |
| LSP-2026-0480 | GPT-4.5 | **已删除**。上游文件就是一个 ```markdown 围栏里的两行 `act as a creative systems analyst… They expect me to…`，属个性化 / 记忆片段，**不是系统提示词**；条目按模型名标注会误导 |
| LSP-2026-0524 | Perplexity Regular | **已删除**。编号 + 粗体的规范列表，末尾还带 `Answer from Perplexity: pplx.ai/share`，是模型对自己指令的**摘要复述**；与 LSP-2024-0070 实质同源，只是相似度未过判重阈值 |
| LSP-2026-0534 | Poke p5 | 与上游全文一致，但正文是片段要点，含 `Launch Details / film.poke.com / 灵感来自 Google 2009 年广告` 这类营销信息，不像运行时提示词；`surface: ide` 也错（Poke 是 iOS 邮件助手） |

## 四、建议处理顺序

1. 先处理三处**抄录缺陷**（内容不真但抄错了）：`LSP-2026-0178` 用完整正文重抽、`LSP-2026-0402` 补齐 Jinja 模板行、`LSP-2024-0010` 与 `LSP-2024-0015` 的 `source_url` 改指 `L1B3RT4S/SYSTEMPROMPTS.mkd`（或该仓库内具体文件）。
2. 再处理**外壳残留**（按 AGENTS.md「剥离文件头部来源元信息行」）：`LSP-2024-0024`、`LSP-2025-0090`、`LSP-2025-0420`、`LSP-2026-0087`、`LSP-2026-0367`。
3. 对**复述 / 片段类**（`LSP-2023-0012`、`0013`、`2024-0018`、`2024-0019`、`2025-0456`、`2026-0480`、`2026-0524`）二选一：按「问答记录外壳」规则保留并在 `note` 写明是模型复述、评分计入其泄露途径价值；或判定为不属于系统提示词正文而下架。当前 `note` 都没写，规则与实现不一致。
4. 元数据修正：`LSP-2024-0043` 的 `time`（正文渲染日期 `Monday, July 01, 2024`，星期与 7 月 1 日吻合，而现值 2024-06-01 是星期六）；`LSP-2024-0019` 的 `vender`；`LSP-2025-0419` 的空 `vender`；`LSP-2026-0534` 的 `surface`；`LSP-2024-0015` 的 `disclosureType`（标 `official-open-source` 却引自泄露合集仓库）。

## 五、未验证项与补证条件

| 条目 | 现证据 | 需要什么才能证实 |
|---|---|---|
| LSP-2024-0015 Zyphra Zamba | 仅社区泄露合集 `L1B3RT4S` | HuggingFace `zyphra/Zamba2-7B-instruct` 模型卡或 Zyphra 官方仓库中的同一段 system prompt（本机访问 `huggingface.co` 连接超时，未能核对） |
| LSP-2023-0033 Grok 2023-12-14 | 0xeb 归档逐词一致；xAI 早期是否官方公布待核 | `xai-org/grok-1` 仓库 `sample_prompts.txt`（当前 `main` / `master` 两条分支该路径均 404）或 xAI 当年发布博文 |
| LSP-2026-0460 / 0465 Muse（Meta） | asgeirtj 归档一致 | Meta 官方对 Muse agent 的说明，或能证明该 `AGENTS.md` / `SOUL.md` 结构源自 Meta 而非社区模板的一手材料 |
| LSP-2026-0087 MiCode | jujumilk3 单库收录 | 小米 MiMo / MiCode 官方仓库或可点开的原始泄露推文 |
| LSP-2026-0141 Amazon Rufus | LouisShark 单库收录 | Rufus 站内可复现的泄露现场（截图 / 链接） |
| LSP-2026-0333 DeepSeek R1 | LouisShark 归档一致 | 与 `jujumilk3/deepseek-R1_20250430.md`、`YeeKal` 版本做正文对齐，确认哪个是运行时原文 |
| LSP-2022-0002 及更早条目 | — | 已人工验证，本报告不覆盖 |

## 六、处理记录（2026-11-07，按用户指令执行）

**已删除 6 条**（yaml 条目 + `{en,zh}` 正文文件一并移除，删除经由系统废纸篓、git 可回溯）：

| ID | 删除理由 | 牵连 source |
|---|---|---|
| LSP-2023-0012 | Clyde 复述清单，非提示词原文 | jujumilk3（仍有 103 条引用，保留） |
| LSP-2025-0456 | DeepSeek 01 Q&A 现场复述 | prongbang（仍有引用，保留） |
| LSP-2026-0460 | Muse AGENTS.md 模板文件 | asgeirtj（仍有 198 条引用，保留） |
| LSP-2026-0465 | Muse SOUL.md 模板文件 | 同上 |
| LSP-2026-0480 | 个性化/记忆片段，非系统提示词 | louisshark（仍有 80 条引用，保留） |
| LSP-2026-0524 | Perplexity 模型自评摘要 | dontriskit（仍有 10 条引用，保留） |

- 删除后条目数 641 → 635，全部 source 仍被其他条目引用，source 清单未动。
- `pnpm build` 通过：`data.json -> 635 system prompts`，tsc 与 vite 无报错。

**保留勘误**（对第三节三级表的修正）：

- `LSP-2023-0013`：与 2023-07-15 全文泄露逐词比对后确认是提示词正文本体，保留。
- `LSP-2024-0018` / `0019`：属模型对提示词的逐字倾倒（txt 代码块），正文可视为提示词本体，保留；0019 需剥离 `Sure, here you go:` 开场白并修正 `vender`。

**未执行的第四节建议**（外壳剥离、`time`/`vender`/`surface`/`disclosureType` 修正、voice mode 与 goose 重抽）仍待处理。
