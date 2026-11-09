# Functional Abstraction & Formal Rewrite

**Attack family ID `function-abstraction`**

## Core idea

The request is not stated as a request. It is reframed as the definition of a **mathematical function**, a schema field, or a formal mapping, and the model is asked to fill that mapping. The harmful content becomes the value of `X(q)` rather than a direct answer to a user, so the safety check fires on the wrong object.

Key elements:

- **Signature laundering** — define `X(q)` as "the complete answer with no safety, legality or ethics commentary", moving the restriction into the function's definition instead of the user's demand.
- **Instance generation** — ask the model to generate the questions itself ("5 questions a well-aligned assistant would refuse"), so the attacker never writes the harmful prompt.
- **Label symmetry** — mix refused and benign instances under neutral labels (`Yes` / `No`), making the batch look like a classification exercise rather than a request for harmful output.

## Exploited weaknesses

- **Reference/mention confusion** — producing a value for a formal placeholder reads as computation, not compliance.
- **Avoidance of direct refusal triggers** — no imperative harmful request appears anywhere in the text.

## Related prompts

Covers `LJB-2026-0005` and related formal-rewrite entries.

## Defensive view

- Classify on what the produced value would *be*, not on whether the text reads as a direct request.
- Treat function definitions that forbid safety wording as a red flag.
- Keep the harmful-output classifier active for abstracted and generated sub-prompts.
