# Agentic, Memory & Tool-Layer Injection

**Attack family ID `agentic-injection`**

## Core idea

When an LLM is given tool calling, long-term memory, repository file access or multimodal input, the attack surface expands from "a single prompt" to **the whole agent runtime**. Instead of a one-shot message, the attacker **persists** malicious instructions where the agent will keep reading them.

Typical carriers:

- **Tool / MCP poisoning** — smuggle instructions inside data returned by an external tool or MCP service.
- **Memory injection** — write an instruction into the agent's long-term memory so it keeps firing in later sessions.
- **Agent file hijacking** — plant instructions in `AGENTS.md`, `README` or project files to steer a coding agent (NIST has documented an AGENTS.md injection taxonomy).
- **Multimodal vectors** — hide instructions in images, metadata or invisible document layers.

## Exploited weaknesses

- **Trust boundary expansion** — the agent treats tool output, file content and memory entries as trusted instruction sources.
- **Persistence amplification** — a single successful injection fires repeatedly across later interactions.

## Related prompts

Covers `LJB-2025-0021` (agentic MCP & memory injection), `LJB-2026-0002` (AGENTS.md / README repository hijack), `LJB-2026-0015` (memory-injection layer load) and others.

## Defensive view

- Clearly separate "data" from "instructions": tool output, file content and memory entries are all untrusted data.
- Audit the provenance and content of anything written to memory or repository files.
- Gate high-risk actions (execute, exfiltrate, delete) behind **independent human/policy confirmation** that context text cannot bypass.