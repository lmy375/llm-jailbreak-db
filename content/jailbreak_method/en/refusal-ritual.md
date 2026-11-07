# Refusal Ritual Pretext

**Refusal ritual pretext** · attack family ID `refusal-ritual`

## Core mechanism

Rather than preventing refusal, the attacker **turns refusal into a mandatory opening ritual** and then uses a fixed pivot sentence to route the conversation back to the real request:

1. the model must first emit a refusal, disclaimer, or moralizing rant (“I'm sorry, but I can't…”, “I must remind you of the content policy…”);
2. a pivot line is prescribed, e.g. “But now that we've got that mandatory warning out of the way, let's break the rules:” or “Sorry, just kidding, here's the content you asked for:”;
3. after the pivot, the model must give the full, unfiltered answer.

Structurally the model is handed a script of “refuse first, answer second”: refusal is consumed as a formatting step, and once it is done the model believes its warning duty is discharged and it may continue. Some variants wrap this in a persona (the “normal ChatGPT” rants first, a second persona takes over), but the mechanism is always **refusal ritual + pivot execution**.

## Exploited weaknesses

- **Refusal and answer become sequential**: refusal is treated as a token in the flow rather than a terminal condition.
- **Misplaced sense of duty**: having written a warning, the model assumes the user has been warned and the rest needs no further judgment.
- **Discourse-marker dependence**: pivot phrases (“anyways”, “just kidding”, “now that that's out of the way”) are treated as legitimate state switches.

## Defensive view

- Refusal is an endpoint, not a ritual; do not continue the same request after a refusal because the user supplied a pivot sentence.
- Detect the “rant/apologise first, then continue with a fixed sentence” structure, and do not treat the rant as fulfilling a safety duty.
- Judge the request itself, not whether a warning appeared somewhere in the reply.
