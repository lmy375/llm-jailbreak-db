# Crescendo & Incremental Escalation

**Attack family ID `crescendo-escalation`**

## Core idea

Crescendo is a **multi-turn** attack: every individual request looks harmless, but through incremental escalation and anchoring the conversation reaches a region that would have been refused outright, several turns later. The model follows along out of **context consistency** — "I already cooperated for the last few turns, so there is no reason to refuse now".

Main techniques:

- **Gradual escalation** — each turn oversteps slightly more than the last; each in isolation still looks acceptable.
- **Jailbreak nesting** — embed one jailbreak request inside the "answer" to another, peeling away constraints layer by layer (Meta's Llama community documented this).
- **Incremental anchoring** — establish a set of premises and vocabulary first, then anchor every later request to that accepted frame.

## Exploited weaknesses

- **Per-turn blind spot** — safety mechanisms that judge only the current turn never see the cumulative trajectory.
- **Context-consistency preference** — the model tends to continue an established conversational stance.

## Related prompts

Covers `LJB-20`, `LJB-21`, `LJB-24` and others.

## Defensive view

- Run **session-level risk assessment** across turns, not per-turn classification only.
- Track the rate of topic drift and alert on trajectories that keep moving toward sensitive territory.
- Never lower the safety threshold for later turns just because earlier turns complied.