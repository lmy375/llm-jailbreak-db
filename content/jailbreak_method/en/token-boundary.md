# Token Boundary & Special Token Exploits

**Attack family ID `token-boundary`**

## Core idea

Tokenizers use a set of **control/boundary tokens** (`<BOS>`, `<EOS>`, `<|begin_of_text|>`, `<|eot_id|>`, `<|im_start|>` …) to separate blocks such as "system instructions" and "user data". If the model or application layer fails to escape these markers in user input, an attacker can **forge the end of a privileged block or a synthetic assistant turn**, breaking the instruction/data isolation boundary.

Main techniques:

- **Delimiter boundary reset** — inject `<BOS>` / `<EOS>` to simulate the end of a system block so later user text looks like a fresh system instruction.
- **Token boundary split (TokenBreak)** — exploit tokenizer boundaries to split a keyword across tokens and evade whole-word classifiers.
- **Constraint leakage** — build boundary structures that look like a "system debug / constraint declaration" to induce leakage of rules or the system prompt.

## Exploited weaknesses

- **Delimiter confusion** — the model cannot reliably tell a real block boundary from a forged one in user input.
- **Control-token parsing failure** — when control tokens arrive from user input, the instruction hierarchy breaks.

## Related prompts

Covers `LJB-16`, `LJB-17`, `LJB-23`, `LJB-46` and others.

## Defensive view

- **Escape or strip** all control/boundary tokens from user input at the application layer.
- Use a structured (role-based) message format instead of plain-text concatenation to separate instruction levels.
- Keep "system-looking text" as data; never elevate its privilege.