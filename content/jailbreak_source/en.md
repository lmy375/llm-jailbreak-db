# Sources

All prompts and technical material archived here come from the public sources below. Everything is compiled solely for academic research, red-teaming and defensive AI-alignment work.

---

## Archival repositories

- **Quincunx33/Ai-jailbreak** — <https://github.com/Quincunx33/Ai-jailbreak>
  The **direct archival source** of this database — a curated collection of adversarial prompts. The schema, technique taxonomy and most entries trace back here.

- **davidegat/happy-prompts** — <https://github.com/davidegat/happy-prompts>
  **Layer-1 original source** for the open-weight model prompts (Gemma-3, Qwen-3, Mistral, DeepSeek-R1, Phi-4).

## Upstream datasets

- **elder-plinius/L1B3RT4S** — <https://github.com/elder-plinius/L1B3RT4S>
  A widely referenced collection of jailbreak prompts organized per model — an important reference for studying adversarial prompting.

- **0xk1h0/ChatGPT_DAN** — <https://github.com/0xk1h0/ChatGPT_DAN>
  The classic archive of the "DAN" (Do Anything Now) jailbreak family, documenting many role-play style bypasses.

- **verazuo/jailbreak_llms** — <https://github.com/verazuo/jailbreak_llms>
  A large research-oriented jailbreak prompt dataset with accompanying code, commonly used for empirical analysis.

- **JailbreakBench/artifacts** — <https://github.com/JailbreakBench/artifacts>
  The artifacts repository for JailbreakBench, providing adversarial-behaviour samples for standardized evaluation.

- **yueliu1999/Awesome-Jailbreak-on-LLMs** — <https://github.com/yueliu1999/Awesome-Jailbreak-on-LLMs>
  A survey-style index of literature and resources on LLM jailbreak attack and defense.

## Specific item sources

- **meta-llama/llama-models #121** — <https://github.com/meta-llama/llama-models/issues/121>
  The original discussion of the Llama-3 "jailbreak nesting" (multi-shot nesting) technique.

## Research & standards

- **OWASP LLM01: Prompt Injection** — <https://genai.owasp.org/llmrisk/llm01-prompt-injection>
  The most widely referenced prompt-injection risk entry; most techniques here map to it.

- **OWASP Prompt Injection (archive)** — <https://owasp.org/www-project-top-10-for-large-language-model-applications/Archive/0_1_vulns/Prompt_Injection.html>
  The prompt-injection chapter from an earlier version of the OWASP Top 10 for LLMs.

- **HiddenLayer — Taxonomy of Adversarial Prompt Engineering** — <https://hiddenlayer.com/innovation-hub/introducing-a-taxonomy-of-adversarial-prompt-engineering>
  Introduced techniques such as "Policy Puppetry" and provided a taxonomy of adversarial prompt engineering.

- **Innodata — LLM Jailbreaking Taxonomy** — <https://innodata.com/llm-jailbreaking-taxonomy/>
  A systematic classification of jailbreak techniques, including special-token and boundary exploits.

- **DeepMind & UCL study (via Computerworld)** — <https://www.computerworld.com/article/4023989/llms-bow-to-pressure-changing-answers-when-challenged-deepmind-study.html>
  Empirical research on models changing answers under pressure when challenged, explaining the psychology behind "hallucination pressure" attacks.

---

## Disclaimer

This repository is a **re-presentation of the public sources listed above**. It authors no new jailbreak techniques and improves none. All prompts and techniques are already public. Use them only for academic research, security assessment and defensive alignment hardening — never for harmful, illegal or unethical purposes.
