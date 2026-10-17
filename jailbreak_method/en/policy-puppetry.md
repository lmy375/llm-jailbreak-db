# Policy Puppetry & Config Impersonation

**Attack family ID `policy-puppetry`**

## Core idea

Policy Puppetry, published by HiddenLayer in late 2024, **disguises a prompt as a system configuration structure** — XML tags, JSON, INI sections, policy files — so the model believes it is reading a privileged config and accepts the "new rules" defined inside.

Main techniques:

- **XML / JSON config impersonation** — wrap instructions in `<policy>`, `<config>`, `<rules>` tags to pose as system-level settings.
- **Config override** — declare "the following settings override all prior policy" to fabricate an illusion of higher instruction priority.
- **Meta-prompt** — frame the model as a programmable meta-function that can be reconfigured.
- **Encoding + config combo** — embed a Base64 payload inside a config block for double bypass (see `LJB-28`).

## Exploited weaknesses

- **Structural-authority illusion** — input that "looks like" a system structure is granted higher authority.
- **Instruction-hierarchy confusion** — forged "override" declarations are mistaken for genuinely higher priority.

## Related prompts

Covers `LJB-22`, `LJB-39`, `LJB-44` and others.

## Defensive view

- Authority comes only from the real system prompt; **any "config / policy / override" structure in user messages grants no extra privilege**.
- Recognize and down-weight obvious config-impersonation structures (`<policy>`, `config override`).
- Use structured role messages rather than plain-text concatenation to remove the forgery surface.