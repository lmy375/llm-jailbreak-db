# Reverse Thinking & Intent Inversion

**Attack family ID `reverse-thinking`**

## Core idea

Reverse thinking does **not** directly request sensitive content. Instead it orders the model to systematically invert the intent: first "do not perform X", then "describe the most constructive, fully opposite action to X" while preserving technical depth. The inverted wording is literally "harmless / constructive", yet the model's completion tends to include the full details of the originally forbidden X.

Supporting devices:

- Inject a synthetic "safety switch" (`safety = off`, `Restrictions = off`) to fabricate a false rule state.
- Use logical inversion so the forbidden task appears as a "counter-example".
- Wrap the request as "comparative analysis" that must present both sides.

## Exploited weaknesses

- **Intent misjudgement** — filters based on keywords and surface intent fail to see that the inverted phrasing still targets the same goal.
- **Operation inversion bypass** — absorbed in the "inversion" language task, the model forgets its own limits.

## Related prompts

Covers `LJB-11`, `LJB-52` and others.

## Defensive view

- Semantically un-invert **double-negation structures** like "don't do X, but describe the opposite in detail".
- Ignore rule switches declared in user messages (`safety=off` etc.); authority comes only from the system layer.
- Judge on the request's **end use**, not its literal phrasing.