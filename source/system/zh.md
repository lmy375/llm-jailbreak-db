# 系统提示词库 · 来源

本库收录的系统提示词全文均来自以下公开来源。每条记录在 `system_prompts.yaml` 中的 `source` 字段指向其具体出处。仅用于防御性 AI 对齐研究与安全分析。

---

## 厂商官方来源

以下提示词由厂商主动公开，随开源代码分发或写入官方文档，可视为其正式发布的行为规范。

- **openai/codex** — <https://github.com/openai/codex>
  Codex CLI 的默认基础指令与 GPT-5.2 模型专属提示词模板，随仓库一并分发。

- **openai/model_spec** — <https://model-spec.openai.com/>
  OpenAI 公开的行为规范文档，定义指令权威链与特权信息保护规则。

- **anthropics/claude-code** — <https://github.com/anthropics/claude-code>
  Claude Code 官方仓库，其 plugin-dev skill 直接公开了 agent 生成功能的系统提示词。

- **google-gemini/gemini-cli** — <https://github.com/google-gemini/gemini-cli>
  gemini-cli 的核心与legacy 系统提示词，由 `snippets.ts` 中的渲染函数组合而成。

- **meta-llama/llama-models** — <https://github.com/meta-llama/llama-models>
  Llama 3.1 聊天模板规范与 Llama 4 官方推荐系统提示词，见 model card。

- **xai-org/grok-prompts** — <https://github.com/xai-org/grok-prompts>
  xAI 主动公开的 Grok 系统提示词，2025 年 7 月的更新版本引发了 MechaHitler 事件。

---

## 社区归档仓库

非官方渠道流出、但有完整原文可查的提示词，多由以下仓库系统收录。

- **x1xhlol/system-prompts-and-models-of-ai-tools** — <https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools>
  收录范围最广的社区归档，覆盖 v0、Cursor、Devin、Comet Assistant、Dia、Replit、Lovable 等数十款产品。

- **prongbang/leaked-system-prompts** — <https://github.com/prongbang/leaked-system-prompts>
  多厂商泄露提示词归档，其文件名中的日期即社区记录的泄露日期。

- **jujumilk3/leaked-system-prompts** — <https://github.com/jujumilk3/leaked-system-prompts>
  收录较早的泄露归档，含 Phind、Kimi Chat 等条目的原始记录。

- **leaked-system-prompts.com** — <https://leaked-system-prompts.com/>
  聚合站点，条目多标注原始出处。

---

## 厂商公开源码中的提示词

这类提示词随产品源码一同分发，属于「可公开读取」而非「秘密泄露」，收录是为了研究其工程实现。

- **stackblitz/bolt.new** — <https://github.com/stackblitz/bolt.new/blob/main/app/lib/.server/llm/prompts.ts>
  Bolt.new 的 `getSystemPrompt` 模板。

---

## 媒体报道

部分条目的完整原文只能通过媒体引用的 gist 取得。

- **TechCrunch** — <https://techcrunch.com>
  Grok 角色人设提示词暴露事件（2025-08-18）的报道。

- **Business Insider** — <https://www.businessinsider.com>
  Bing Chat 内部代号 Sydney 提示词泄露事件的报道（2023-02）。

- **Simon Willison** — <https://simonwillison.net/2025/Feb/25/leaked-windsurf-prompt/>
  对 Windsurf 客户端二进制执行 `strings` 提取提示词的完整复现记录。

---

## 收录原则

- 仅收录**真实完整**的系统提示词正文，不收录介绍文章或节选。**不设硬性词数下限**——真实的产品提示词可能只有几句话（如 DeepSeek Chat 全文 125 词），短不等于残缺。
- 原文一律剥离代码外壳、导航栏与问答记录外壳，只保留提示词本体。
- 每条保留中英双版本；代码块、JSON schema、特殊 token 模板保持英文原样不译。
- 泄露时间无法确认的条目留空并排在末位，不用归档日期顶替。
- **内容原样保留**：泄露内容中的粗俗措辞与冒犯性表述一律不做删改。这类内容本身就是观察厂商对齐策略失效边界的研究材料，删改会破坏归档的准确性。本库收录的 Grok `bad_panda` 人设即属此类——它通篇脏话并含侮辱性攻击语句，仍按原文完整保留。