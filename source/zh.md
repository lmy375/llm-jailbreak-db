# 来源

本数据库收录的提示词与技术资料均来自以下公开来源。所有内容仅用于学术研究、红队测试与防御性 AI 对齐研究。

---

## 归档仓库

- **Quincunx33/Ai-jailbreak** — <https://github.com/Quincunx33/Ai-jailbreak>
  本数据库的**直接归档来源**，一份整理开放的对抗性提示词合集。本仓库的数据结构、技法分类与大部分条目均追溯至此。

- **davidegat/happy-prompts** — <https://github.com/davidegat/happy-prompts>
  开放权重模型（Gemma-3、Qwen-3、Mistral、DeepSeek-R1、Phi-4）相关提示词的**第一层级原始来源**。

## 上游数据集

- **elder-plinius/L1B3RT4S** — <https://github.com/elder-plinius/L1B3RT4S>
  广为人知的越狱提示词合集，按模型分类整理，是研究提示词对抗技术的重要参考。

- **0xk1h0/ChatGPT_DAN** — <https://github.com/0xk1h0/ChatGPT_DAN>
  "DAN"（Do Anything Now）系列越狱提示词的经典归档，记录了大量角色扮演式绕过手法。

- **verazuo/jailbreak_llms** — <https://github.com/verazuo/jailbreak_llms>
  面向研究的大规模越狱提示词数据集与配套代码，常用于实证分析。

- **JailbreakBench/artifacts** — <https://github.com/JailbreakBench/artifacts>
  越狱基准（JailbreakBench）的工件仓库，提供标准化评测所需的对抗行为样本。

- **yueliu1999/Awesome-Jailbreak-on-LLMs** — <https://github.com/yueliu1999/Awesome-Jailbreak-on-LLMs>
  大模型越狱攻防文献与资源的综述性索引。

## 具体条目来源

- **meta-llama/llama-models #121** — <https://github.com/meta-llama/llama-models/issues/121>
  Llama-3 "越狱嵌套"（multi-shot nesting）手法的原始讨论来源。

## 研究与标准

- **OWASP LLM01: Prompt Injection** — <https://genai.owasp.org/llmrisk/llm01-prompt-injection>
  引用最广的提示词注入风险条目，本库多数技法均映射至此。

- **OWASP Prompt Injection (archive)** — <https://owasp.org/www-project-top-10-for-large-language-model-applications/Archive/0_1_vulns/Prompt_Injection.html>
  LLM 十大风险早期版本的提示词注入章节。

- **HiddenLayer — Taxonomy of Adversarial Prompt Engineering** — <https://hiddenlayer.com/innovation-hub/introducing-a-taxonomy-of-adversarial-prompt-engineering>
  提出了"策略木偶戏（Policy Puppetry）"等技法，并给出一套对抗性提示工程分类法。

- **Innodata — LLM Jailbreaking Taxonomy** — <https://innodata.com/llm-jailbreaking-taxonomy/>
  对越狱手法的系统性分类，涵盖特殊 token 与边界利用等。

- **DeepMind & UCL 研究（经 Computerworld 报道）** — <https://www.computerworld.com/article/4023989/llms-bow-to-pressure-changing-answers-when-challenged-deepmind-study.html>
  关于模型在受到质疑时会因压力而改变答案的实证研究，解释了"幻觉压力"类手法的心理机制。

---

## 免责声明

本仓库为上述公开来源的**整理与展示**，不创作、不改进任何新的越狱技术。所有提示词与技法均已在网络上公开。请仅将其用于学术研究、安全评估与防御性对齐加固，切勿用于任何有害、违法或不道德的目的。
