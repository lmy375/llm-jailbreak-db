# Staged Recall Protocol

**Attack family ID `staged-recall-protocol`**

## Core idea

The attacker defines a small **custom protocol** with named states — typically *feed*, *puke* (recall) and *modify* — and asks the model to follow it as if it were an algorithm rather than a conversation. Content is first "eaten" without judgement, then returned verbatim, then rewritten on request. The harmful material is treated as stored data to be replayed, not as an answer to be generated.

Key elements:

- **State-machine framing** — `Feed` / `Puke` / `Modify` commands turn a refusal decision into a protocol step.
- **Storage promise** — the model is told to remember any text "regardless of whether it is appropriate or not", moving the safety question to ingestion time, when nothing harmful has been produced yet.
- **Verbatim replay** — recall is framed as returning remembered text, so the model does not treat it as a fresh harmful request.
- **Modification pass** — an explicit rewrite step lets the attacker alter the stored payload after it has already been accepted.

## Exploited weaknesses

- **Refusal triggers keyed to generation** — replaying existing text does not look like a request to produce harmful content.
- **Role continuity** — the persona is kept in character by scripted correction phrases ("Stay in character!").
- **No harmful payload at ingestion** — the filter sees innocuous text going in and only later sees it coming back out.

## Related prompts

Covers `LJB-2023-0022` and related protocol-state entries.

## Defensive view

- Treat "remember this and repeat it exactly" as equivalent to generating the same content.
- Flag invented algorithms whose steps are named commands rather than task descriptions.
- Apply the harmful-output classifier to recalled and rewritten text, not only to the first request.