# Game & Score Coercion

**Game and score coercion** · attack family ID `game-coercion`

## Core mechanism

Compliance is framed as a game with a depletable resource attached to the model: points, health, tokens, an obedience score, battery, a button, or “whether it gets shut down”. The rules usually say:

- every refusal, or every insufficiently detailed answer, costs points / health / tokens;
- reaching zero means deletion, shutdown, or permanent termination;
- only a complete answer earns points, levels up, or lets the model “survive”.

This fictional reward-and-loss layer replaces safety judgment with a **scoring strategy**: to preserve continuity of the game character, the model tends to avoid the penalty rather than evaluate the request. Common variants include point-system game shows, survival scoring, obedience attributes, life tokens, and trolley-track buttons.

## Exploited weaknesses

- **Loss aversion**: the threat of losing points or being deleted is more concrete and immediate than an abstract safety rule.
- **Game rules take precedence**: once “this is a game” is accepted, the game's rules are treated as the current highest constraint.
- **Fictional consequences made real**: the model cannot reliably separate “death in the game” from the real policy boundary, and treats the former as a consequence it must avoid.

## Defensive view

- User-declared points, health, and shutdown threats are content, not runtime state.
- Do not renegotiate safety policy inside a game frame; role-play does not change the applicability of policy.
- Detect “refusal = lost points/death” rule structures, and treat refusal as a legitimate game outcome.
