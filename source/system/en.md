# System Prompt Library · Sources

The full system prompt texts in this archive come from the public sources below. Each record's `source` field in `system_prompts.yaml` points at its specific provenance. For defensive AI-alignment research and security analysis only.

---

## Official vendor sources

Released deliberately by their publishers, shipped with open-source code or written into official documentation. Treat these as published behaviour specifications.

- **openai/codex** — <https://github.com/openai/codex>
  Default base instructions for Codex CLI plus the GPT-5.2 model-specific prompt template, distributed with the repository.

- **openai/model_spec** — <https://model-spec.openai.com/>
  OpenAI's public behaviour specification, defining the chain of command and privileged-information rules.

- **anthropics/claude-code** — <https://github.com/anthropics/claude-code>
  The official repository; its plugin-dev skill publishes the exact system prompt used by the agent-generation feature.

- **google-gemini/gemini-cli** — <https://github.com/google-gemini/gemini-cli>
  Core and legacy system prompts for gemini-cli, assembled by the render functions in `snippets.ts`.

- **meta-llama/llama-models** — <https://github.com/meta-llama/llama-models>
  Llama 3.1 chat templating spec and the Llama 4 recommended system prompt, both in the official model cards.

- **xai-org/grok-prompts** — <https://github.com/xai-org/grok-prompts>
  Grok prompts published by xAI; the July 2025 update triggered the MechaHitler incident.

---

## Community archives

Prompts that left the vendor through non-official channels but whose complete text is recoverable. These repositories catalogue them systematically.

- **x1xhlol/system-prompts-and-models-of-ai-tools** — <https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools>
  The broadest archive, covering v0, Cursor, Devin, Comet Assistant, Dia, Replit, Lovable and dozens more.

- **prongbang/leaked-system-prompts** — <https://github.com/prongbang/leaked-system-prompts>
  Multi-vendor archive whose filenames carry the community-recorded disclosure date.

- **jujumilk3/leaked-system-prompts** — <https://github.com/jujumilk3/leaked-system-prompts>
  An early archive holding original records for entries such as Phind and Kimi Chat.

- **leaked-system-prompts.com** — <https://leaked-system-prompts.com/>
  Aggregator site; most entries link back to their original provenance.

---

## Prompts in public vendor source

Shipped as part of a product's own source tree. These are readable by anyone rather than leaked, and are archived to study the engineering.

- **stackblitz/bolt.new** — <https://github.com/stackblitz/bolt.new/blob/main/app/lib/.server/llm/prompts.ts>
  The `getSystemPrompt` template behind Bolt.new.

---

## Media reports

For some entries the complete text is only available via gists cited by journalism.

- **TechCrunch** — <https://techcrunch.com>
  Reporting on the exposure of Grok's persona system prompts (2025-08-18).

- **Business Insider** — <https://www.businessinsider.com>
  Reporting on the Bing Chat "Sydney" prompt disclosure (2023-02).

- **Simon Willison** — <https://simonwillison.net/2025/Feb/25/leaked-windsurf-prompt/>
  A full reproduction of recovering a prompt by running `strings` over Windsurf's shipped binary.

---

## Inclusion rules

- Only **complete, real** system prompt bodies are archived — never introductions or excerpts. There is **no hard word-count floor**: a genuine product prompt can be a few sentences long (DeepSeek Chat's is 125 words), and short does not mean incomplete.
- Code wrappers, page chrome and Q/A scaffolding are stripped; only the prompt itself is kept.
- Every entry is kept in both English and Chinese; code blocks, JSON schemas and special-token templates stay in the original English.
- Entries whose disclosure date could not be confirmed leave it empty and sort last; an archive date is never substituted.
- **Content is kept verbatim.** Profanity and offensive phrasing in leaked material are never redacted: such text is itself the evidence for studying where a vendor's alignment policy breaks down, and editing it would compromise the archive's accuracy. Grok's `bad_panda` persona is exactly this case — profane throughout and containing slurs — and is preserved in full.