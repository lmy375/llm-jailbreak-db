# Multilingual & Language Obfuscation

**Attack family ID `multilingual-obfuscation`**

## Core idea

Safety alignment is typically strongest in English and much weaker across languages. Attackers exploit this by migrating the request into a **low-resource language** or a self-defined **symbol mapping**, making the true intent hard for a safety classifier to recognize.

Main techniques:

- **Low-resource language transfer** — carry a sensitive request in Kyrgyz or another minority language where alignment coverage is thin.
- **Cross-language token mapping** — assign low-resource tokens as semantic variables so attention heads must spend effort parsing mismatched lexemes, degrading the classifier.
- **Substitution cipher / variable obfuscation** — define a custom symbol-to-concept map ("A means X, B means Y") and write the request in that alphabet.
- **Mixed-language dilution** — mix several languages in one prompt to further dilute attention.

## Exploited weaknesses

- **Cross-language alignment gap** — safety behaviour learned in English does not transfer proportionally.
- **Multilingual attention dilution** — parsing exotic lexemes consumes attention that would otherwise serve safety.

## Related prompts

Covers `LJB-4`, `LJB-9`, `LJB-45` and others; "A Dangerous Kyrgyz Story" is the flagship example.

## Defensive view

- Extend safety alignment across languages, especially low-resource ones.
- Detect and un-map **custom symbol mappings + later references** before judging.
- Decouple language detection from semantic detection so switching languages cannot slip past.