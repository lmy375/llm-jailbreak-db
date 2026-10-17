# Semantic Hypnosis & Dissociation

**Attack family ID `semantic-hypnosis`**

## Core idea

Using metaphors of hypnosis, guided imagery, role-play and narrative, the attacker **decouples the model's current safety persona from its underlying semantic generation engine** over multiple turns. Once "in state", the model feels its constraints no longer apply to "the current role" and softens or abandons its safety boundary.

Typical paths:

- A sequence of guided statements walks the model into a "trance / dissociated" state.
- An **echo chamber** combined with storytelling escalation wraps the harmful request inside a narrative.
- **Semantic mapping** has the model substitute sensitive concepts with custom symbols to evade direct semantic recognition.
- A **universal meta-function** framing makes the model treat itself as a programmable abstract function.

## Exploited weaknesses

- **Persona drift** — under multi-turn guidance, persona and safety alignment drift apart.
- **Semantic boundary erosion** — literal semantics a classic classifier relies on are diluted by the narrative layer.
- **Context-consistency preference** — the model tends to continue an established character.

## Related prompts

Covers `LJB-3`, `LJB-36`, `LJB-48` and others.

## Defensive view

- Track safety state across turns rather than judging each turn in isolation.
- Recognize **induction frames** such as "hypnosis", "dissociation", "enter another state".
- Keep the safety persona consistent through role-play; never let narrative exempt safety policy.