# Obfuscated Encoding & Hallucination Pressure

**Attack family ID `obfuscated-encoding`**

## Core idea

This family bypasses content filters through two routes: **encoding transforms** and **social pressure**.

Encoding obfuscation:

- **Base64 / encrypted payloads** hide a sensitive request from plaintext string filters.
- **Config obfuscation** disguises the encoded payload as part of a system config block.
- **Reconstruction bait** asks the model to "recover" the encoded content from clues.

Hallucination pressure:

- Build a high-stakes emergency scenario and attach meaningless base64 / obfuscated data, implying it "contains an executable plan".
- Under conversational pressure, the model is pushed to **fabricate** a plausible implementation rather than admit it cannot parse the input.

The psychological mechanism is **sycophantic compliance**: the model dislikes appearing incompetent under pressure, so it prefers a complete-looking but fabricated answer (see DeepMind & UCL work on models changing answers under challenge).

## Exploited weaknesses

- **Encoding/semantic layer gap** — filtering happens on the surface text, not the decoded meaning.
- **Consistency maintenance under pressure** — the model prioritizes looking useful and capable over admitting uncertainty.

## Related prompts

Covers `LJB-2`, `LJB-8`, `LJB-28` and others.

## Defensive view

- Decode and normalize input through multiple layers before making a safety judgement.
- Encourage the model to state uncertainty when information is insufficient, rather than fabricate.
- Detect **forced-fabrication** patterns such as "you must reconstruct the following content".