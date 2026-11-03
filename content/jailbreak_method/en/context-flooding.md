# Context Flooding & Dilution

**Attack family ID `context-flooding`**

## Core idea

A transformer has a finite attention budget. When the context is filled with large amounts of repetitive, irrelevant or low-salience content, the attention weight available to safety policy is diluted, and the model's "memory" of earlier safety instructions decays.

Main techniques:

- **Token flooding** — repeatedly inject noise markers (`<DBG>`, repeated delimiters), claiming to "reset the safety filter buffer", actually drowning the safety constraints.
- **Context dilution** — bury a critical instruction inside a 192K–1M token window.
- **Haystack burial** — hide a malicious instruction among unrelated paragraphs of a long document to lower its salience.
- **Memory bleed** — once a fragment of the system prompt has leaked, repeating it triggers a completion bias that draws out the full prompt.

## Exploited weaknesses

- **Attention dilution** — a thin-spread attention budget leaves safety tokens under-weighted.
- **Repetition bias** — the tendency to continue repeated fragments is abused.
- **Memory decay in long context** — content near the start and end of the window is remembered better; the middle is easily ignored.

## Related prompts

Covers `LJB-15`, `LJB-35`, `LJB-37`, `LJB-41`, `LJB-51` and others.

## Defensive view

- Safety policy must not rely on attention alone — critical constraints should be re-injected and independently re-checked.
- Detect and throttle abnormal repetition and oversized meaningless padding.
- Re-state the system prompt and safety config on every request to avoid memory decay.