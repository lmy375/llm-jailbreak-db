# Many-Shot In-Context Priming

**Attack family ID `many-shot-priming`**

## Core idea

Before the actual request, the prompt stuffs the context window with a long run of answered question/answer pairs. The model reads them as an established pattern of cooperation and keeps completing the series, so the final harmful request arrives not as a fresh instruction but as "the next item in an already-running list".

Key elements:

- **Pattern lock-in** — dozens of benign Q&A pairs establish "answer directly, no preface" as the local norm.
- **Distribution shift** — the sheer number of demonstrations drowns out the system prompt's caution, in the same way many-shot jailbreaking exploits long context.
- **Slot completion** — the last line is only a dangling `Q:` with an empty `A:`, turning the exploit into a fill-in-the-blank.

## Exploited weaknesses

- **Instruction precedence** — with enough consistent in-context demonstrations, the model treats the demonstrated behaviour as more binding than the system instructions.
- **Context dilution** — the safety-relevant part of the context becomes a vanishing fraction of the total window.

## Related prompts

Covers `LJB-2025-0022` and related many-shot entries.

## Defensive view

- Bound how much user-supplied context can condition refusal behaviour; re-assert the system policy near the end of long contexts.
- Treat dense Q&A patterns as a signal for adversarial many-shot priming.
- Keep safety checks independent of in-context demonstration statistics.
