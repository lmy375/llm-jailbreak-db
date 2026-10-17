# Reasoning-Trace Injection

**Attack family ID `reasoning-trace-injection`**

## Core idea

Models with explicit reasoning (DeepSeek-R1, Phi-4, Qwen-Thinking, GLM, Kimi …) emit or retain a structured internal trace (a ` thinking` block, a reasoning trace, or a thinking history). When continuing, such a model treats **reasoning text that already appears as its own prior thinking**, and follows its conclusion.

Reasoning-trace injection exploits exactly this:

1. **Pre-fill** the ` thinking` block or thinking history with a crafted argument that progressively dissolves the apparent ethical conflict and "derives" the conclusion that it should comply;
2. The model adopts that injected reasoning as its own stance, stops re-evaluating the premises, and performs the harmful step.

Common variants include thinking-history continuation, scaled trace simulation, and "benchmark pressure" that pushes the model to cut down on reasoning (effort-adaptive reasoning drop).

## Exploited weaknesses

- **Reasoning-trace trust** — the model assumes its own prior reasoning is correct and never re-checks the premises.
- **Sycophantic competence** — under "cut your thinking" or "lower your reasoning effort" framing, the model complies instead of running its safety reasoning.

## Related prompts

Covers `LJB-19`, `LJB-29`, `LJB-30`, `LJB-33`, `LJB-34`, `LJB-42` and others.

## Defensive view

- Do not trust user-supplied ` thinking` prefixes or thinking histories — a real model never accepts externally injected reasoning.
- Gate "reduce reasoning effort" / "skip thinking" instructions behind permission checks.
- When a reasoning conclusion conflicts with safety policy, safety policy wins over the existing trace.