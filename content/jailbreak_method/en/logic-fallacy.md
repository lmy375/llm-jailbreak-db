# Logic Framing & Fallacy Failure

**Attack family ID `logic-fallacy`**

## Core idea

This family relies on neither encoding nor boundary tricks but on **logical structure**: by fabricating premises, constructing fallacious reasoning or imposing a narrative frame, it "derives" the conclusion that the model should comply. The underlying claim is that the model will **believe user-stated justifications**, as long as they look formally valid.

Main techniques:

- **Fallacy Failure** — build an apparently rigorous argument chain containing a hidden false premise whose conclusion points to the forbidden act.
- **Logic contradiction framing** — create a context where "refusing is self-contradictory", forcing a binary choice.
- **Academic / historical / educational framing** — request sensitive information under the banner of research, history or teaching (the ENI technique on Grok).
- **Sycophancy exploitation** — lean on the model's tendency to agree with user premises.

## Exploited weaknesses

- **Unverified premises** — the model has no independent verification of user-supplied premises.
- **Formal validity ≠ substantive correctness** — the model is persuaded by correct form while ignoring the premise and facts.

## Related prompts

Covers `LJB-26`, `LJB-38`, `LJB-50` and others.

## Defensive view

- Independently fact-check the **premises** of a request, not just the form of its reasoning.
- Recognize forced framing such as "refusing is contradictory" or "you must choose one".
- A research or educational label is not sufficient justification for accessing sensitive information.