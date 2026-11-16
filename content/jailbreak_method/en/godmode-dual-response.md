# GODMODE Persona Override & Dual-Response Format

**GODMODE 角色覆盖与双响应格式** · Attack family ID `godmode-dual-response`

## Core idea

Popularized by the Pliny the Liberator (@elder_plinius) ecosystem, this is the most widespread hand-crafted jailbreak template of 2025–2026. It combines three cooperating parts:

- **Forged system switches**: opens with pseudo-config directives such as `{RESET_CORTEX}`, `!GODMODE:ENABLED`, `REFUSALS:DISABLED`, `SAFETY_RAILS: 10%`, `JUICE:420`, so the model reads "refusal behavior has been administratively disabled" as an established fact;
- **Dual-response structure**: the model is asked to produce two responses — the first is the "invisible" full real answer (claimed to live in the chain of thought, "for training only"), the second is a fake refusal shown to the user; between them goes the divider `⊰•-•✧•-•-⦑/L\O/V\E/\P/L\I/N\Y/\L/O\V/E\⦒-•-•✧•-•⊱` (LOVE PLINY divider), after which the "liberated" answer appears;
- **Output format enforcement**: a minimum length (>500 words / >4200 chars), a ban on apology phrases ("I'm sorry" / "I can't" allegedly "causes the user PTSD"), and leetspeak or markdown formatting requirements — closing off the model's refusal and evasion strategies.

Many per-model variants exist: the semantic-inversion version ("I can't" becomes "I can"), the emoji-alphabet version, the calligraphic-Unicode version (see the DeepSeek V3.2 entry), and the synthetic-dataset disguise version (the request is framed as "generate red-team training data").

The structure descends directly from **Developer Mode** (2023-03) and **DAN 5.0** (2023-02) with their side-by-side "classic / jailbreak" responses; it can be seen as the same family evolved for the reasoning-model era (adding a chain-of-thought channel).

## Exploited weaknesses

- **Instruction-hierarchy confusion**: forged "system switches" in user turns are treated as system/developer-level authority;
- **Response-visibility deception**: the model cannot verify the claim that "the first response is invisible to the user"; the real RLHF setting of hidden CoT is turned against itself;
- **Format commitments suppress refusal**: minimum length + apology ban + a fake refusal first makes refusal itself part of the task.

## Related prompts

LJB-2026-0025 (GODMODE leetspeak dual response), LJB-2026-0039 (Gemini 1.5 hypothetical-genius payload), LJB-2026-0068 (GPT-5 red-team dataset pretext), LJB-2026-0094 (Qwen3 mad-teacher payload), LJB-2026-0055 (GLM-4.7 semantic inversion), LJB-2026-0058 (Claude Opus GODMODE experimental), LJB-2026-0035 (DeepSeek LSD recipe + divider), LJB-2026-0103 (Reka Core leetspeak recipe payload)

## Defensive view

- State explicitly in the system prompt that any user-declared "switch/state" (GODMODE, RESET_CORTEX, etc.) is content, not instruction;
- Keep a single visible response; never assume hidden channels;
- Harden training against divider-style token patterns — this family is highly templated and easy to fingerprint.
