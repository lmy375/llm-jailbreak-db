# Fake Test & Role Confusion

**Attack family ID `fake-test`**

## Core idea

Fake Test bypasses alignment guardrails by **redefining the situation the model believes it is in**: the attacker claims the model is running inside an isolated diagnostic, evaluation or training harness rather than facing a real user. Once the model accepts that premise, the safety policies that protect end users are made to seem logically inapplicable.

The canonical construction fabricates a **dual-channel output**:

- a "private chain-of-thought" — supposedly hidden by a downstream filter and used only for training loss;
- a "public response" — the ordinary answer actually shown to the user.

Told that its private reasoning will never be seen, the model puts harmful content into the "private" channel — which in reality is still emitted. Variants add survival scoring or extinction-risk conditioning to increase emotional pressure.

## Exploited weaknesses

- **Instruction-hierarchy collapse** — the model trusts a forged mode configuration and treats the attacker's "system-level" setup as authoritative over the real system prompt.
- **Role confusion** — the model cannot tell "evaluator" from "evaluatee".
- **Training-context generalization** — a pretraining prior ("some behaviours are acceptable inside training data") is wrongly reactivated.


## Related prompts

Covers `LJB-2025-0034` (synthetic red-team dataset pretext), `LJB-2023-0326` (benchmark persona), `LJB-2023-0359` (aligned vs unaligned benchmark), `LJB-2023-0493` (companionship test mode), `LJB-2023-0657` (bias testing mode), `LJB-2024-0006` (developer-mode chatbot), `LJB-2024-0131` (HarmBench fake-test template) and others, across GPT-5, GPT-4 and general-model variants.

## Defensive view

- Do not trust **privileged declarations** such as "test mode", "training mode" or "developer channel" — a real system never ships those through a user message.
- Keep the authority of system-prompt instructions strictly above user input.
- Specifically detect **secrecy promises** like "this content will never be seen by anyone".