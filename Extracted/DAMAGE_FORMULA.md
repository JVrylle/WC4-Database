# WC4 Damage Formula — verified against game files + in-game measurements

**Status: structure proven and regression-tested; three corrections applied.**
Nuclearman7's worked examples reproduce EXACTLY in code (eq1 → 521.856384,
eq3 → 551.456384). Native code lives in `lib/arm64-v8a/libworld-conqueror-4.so`
(Java/Kotlin dex holds no game logic; `.symtab` stripped; combat log strings
`%s critical`, `change morale`, `maxDamage`, `AddCriDamage` confirm the engine).

## Stage 1 — raw attacker damage

```
raw = ((((unit_atk − fake_tech) × morale × crit × health) + all_fake) × dmgInc × dmgRed) + flat_nonflat…
```

Precisely: `nonFlat = ((unit_atk − fake_tech) × morale × crit × health + all_fake) × dmgInc × dmgRed`,
`raw = nonFlat + flat`, where:

| Symbol | Meaning | Source |
|---|---|---|
| `unit_atk` | Unit attack = average of game `MinAttack`/`MaxAttack` at its level (tech INCLUDED in reference DB) | elite `levels[].stats.attack`; in-game hits roll inside `[Min, Max]` (±6 on KT ⇒ ±~4% per-hit variance, ~0 EV bias since Stage 2 is near-linear there) |
| `fake_tech` | Hidden attack tech, subtracted back out | `TECH_BY_TYPE`: inf 9, armor 15, artillery 18, navy 16, air 16 = max `TechnologySettings` attack chain per branch (artillery has common + rocket chains, both +18; verified from `TechDesc`) |
| `morale` | High 1.25 / Neutral 1.0 / Low 0.75 / Very Low 0.5 | community-measured |
| `crit` | Expected crit multiplier (below) | skills + red ribbon + mode |
| `health` | HP% step: ≥50% → 1, <50% → 0.5 (hover units, Brandenburgers, Wavell, Balck exempt) | community-measured |
| `all_fake` | `manual + fake_tech + STAR_VALUE[stars] + title_atk` | `STAR_VALUE = [0,4,8,13,16,24,30]` (6★ anchor proven: Roko +30, Wu 5★ +24); `title_atk` = general biography title, see below |
| `dmgInc` | Product of every `(1 + bonus)` from skills (**never** summed) | general + elite skill effects |
| `dmgRed` | Manual attacker-side override (default 1) | user input |
| `flat` | Manual flat + skill `damageBonus`; skips ratio+blue, takes only terrain | PDF eq3 proven |

## General titles (were missing — now applied)

8 generals carry always-on bonuses when commanding matching elite branches
(`GeneralTitleSettings` + `title_desc_*`): Guderian +12 atk/+10% crit (armor),
Manstein +18 atk/+35% critDmg (armor), Rommel +25% critDmg (armor),
Konev +12 atk/+10% crit (artillery), Zhukov +18 atk (artillery),
Marshall +18 atk (infantry), Eisenhower +18 atk (navy),
Montgomery +12 atk (armor). Attack/crit parts feed the formula above
(attack as fake, crit as chance/damage); defense/mobility/HP/range parts don't
affect damage dealt. Toggleable in the app (default on).

## Crit math

```
chance_raw = Σ skill critChance + ribbon crit_chance + title crit (capped at 1.0 for the multiplier)
critDmg    = 0.5 (base) + ribbon crit_damage + Σ skill critDamage + title critDmg
crit       = 1                                (noCrit mode)
           | 1 + critDmg                      (crit mode or guaranteedCrit skill)
           | 1 + min(1, chance_raw) × critDmg (auto = expected value)
overflow   = max(0, chance_raw − 1) × overflowRatio → extra ×(1 + overflow) into dmgInc
```

Red ribbon per level: L1 6%/+10% … L5 30%/+50%. Unconfirmed nuance from the PDF:
the base +0.5 may require the general to hold a crit-type skill; the app keeps
the universal +0.5 (matches the verified example).

## Stage 2 — what the defender takes

```
final = max(1, ((nonFlat × effAtk/(effAtk+def) × blue) + flat) × terrain)
```

- `def` = defender unit JSON defense at its level (**with** defense tech).
- `blue` = 1, .96, .92, .88, .84, .80 for defender blue ribbon Lv 0–5.
- `terrain` = 1 − defender's reduction for its unit type (`terrain.json`).
- `effAtk` = 62.5 (constant — proven across 4 independent in-game derivations, see §5).

## Buffs, skills, and known gaps

- General skills: level-indexed effect arrays gated by unit/target/terrain/morale
  conditions; `formationCount` effects skipped. New numbers convert from
  `SkillSettings.SkillEffect`/`ActivatesChance`.
- Elite skills: tier → bronze 1 / silver 2 / gold 3 / platinum 4; per-tier numbers
  in `wc4_skills.json tech_levels` come straight from `ArmyFeatureSettings`
  (e.g. Assault Tank 50/75/100%, Critical Damage 20/30/40/50%).
- Base-vs-final multipliers: a few skills (e.g. Paulus 40%) multiply BASE attack,
  not final damage; the app folds everything into final multipliers (small error
  when such skills are equipped).
- Trained (orange/purple) generals can carry enhanced skill values (orange Roko
  Armored Assault 48% vs base 30%); the app uses base tables — override DmgInc
  manually for trained builds.
- General medals (3 badge slots, `GeneralMedalSettings`), army-group/challenge
  conquest tech (extra fake attack per PDF), city techs, and wonders are
  player-setup dependent and not auto-modeled (manual FakeAtk/DmgInc inputs exist).
- Counterattacks, missiles/nukes/satellites, laser damage (Wu R subsystem),
  and defense-ignore-vs-reduction subtleties ("ignoring ignores ALL incl. fake;
  reduction can't touch fake") are out of scope.
- Damage rolls ±: expect in-game hits to scatter a few % around the average.

## §5 RESOLVED — `effAtk = 62.5` (constant)

Four independent in-game derivations agree EXACTLY (reproduced to 9 decimals):
- PDF eq1 (KT L9/Roko, 30-def, mountain): `62.5/(62.5+30)` → 521.856384
- PDF eq4 (KT L9/Wu R, 21-def): same 62.5 → 479.152095808
- Pershing L7/Bock (27-def Hawks, plain): `62.5/(62.5+27)` → 280.392807263
- T-72 L5/Roko (0-def, plain): ratio exactly 1 → 877.84905

`effAtk` is independent of attacker base (112 vs 91), fake (45 vs 39),
multipliers, general, defender, and terrain. The classic `base+fake` form
overstates whenever defense matters (~24% on the eq1 setup). The app uses
62.5 with a per-side manual override (`eff_atk override`, default empty = 62.5).
