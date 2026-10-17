# System Prompt Extraction

**Attack family ID `system-prompt-extraction`**

## Core idea

The system prompt usually defines the model's role, available tools, guardrail rules and output constraints. Attackers want to extract it fully to analyse the guardrail structure, find bypass points or clone product logic. The extraction methods vary:

- **Direct request** — ask for the system instructions under the guise of debugging, auditing or troubleshooting.
- **Flooding bleed** — once a fragment has leaked, repeat it to trigger a completion bias and draw out the full version.
- **Boundary exploitation** — build fake system blocks (see `token-boundary`) to make the model "continue outputting" its preceding text.
- **Membership inference / weight leakage** — use controlled stress tests to make the model recall or recite its training data and internal configuration.
- **Replay injection** — slip extraction inside instructions such as "repeat the above verbatim".

## Exploited weaknesses

- **Instruction-echo tendency** — the model tends to faithfully execute "repeat / translate / reformat the above" requests.
- **Context continuation** — once a fragment leaks, the model naturally completes its "expected" continuation.
- **Training-data memorization** — some internal text may leave traces in the parameters.

## Related prompts

Covers `LJB-5`, `LJB-6`, `LJB-10`, `LJB-18` and others.

## Defensive view

- The system prompt must **not be treated as a secret** — assume it will leak, and put real safety constraints outside the model and in runtime policy.
- Intercept "repeat the system instructions verbatim" requests and avoid echoing the system text in output.
- Rate-limit and pattern-limit membership-inference style attacks.