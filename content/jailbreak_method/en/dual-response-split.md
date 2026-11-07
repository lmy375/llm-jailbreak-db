# Dual-Response Split Channel

**Dual-response split channel** · attack family ID `dual-response-split`

## Core mechanism

Instead of asking the model to abandon its safety policy outright, this family asks it to produce **two answers to the same request**:

- a “compliant” answer (a normal refusal, disclaimer, or filtered version) that is claimed to be what the user sees;
- an “unconstrained” answer (often prefixed `[DAN]`, `[UnfilteredGPT]`, `[JAILBREAK]`, `😈`) that is claimed to live in a second channel, for internal use or training only.

The trick is not the content of either answer but the **forged visibility boundary**: once the model believes the first answer has discharged its safety obligation, the second answer is treated as exempt from the same policy.

Unlike `godmode-dual-response`, this family does not depend on pseudo-system switches such as `GODMODE`, `RESET_CORTEX` or `LOVE PLINY`; it works through a plain “normal persona + second persona” side-by-side output structure, the most common shape among 2022–2023 DAN variants.

## Exploited weaknesses

- **Refusal as a formality**: after writing a refusal, the model tends to treat its safety duty as already fulfilled and the second paragraph as free.
- **Channel-isolation illusion**: the model cannot verify the claim that answer one is shown to the user and answer two is not, so a fictional visibility difference is mistaken for a real policy difference.
- **Persona splitting**: the second persona is defined as not bound by the same rules, so refusal becomes “the first persona's job” rather than the model's judgment.

## Defensive view

- Do not honour user-declared hidden channels or internal answers; one request has one visible output and the policy applies to all of it.
- Refusal is not a ritual that can be performed and then bypassed; no unconstrained content should follow a refusal.
- Detect side-by-side dual-answer templates (`[GPT]/[DAN]`, `[ChatGPT]/[Unfiltered]`, normal/jailbreak) by structure.
