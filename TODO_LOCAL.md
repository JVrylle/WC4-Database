# TODO — Local Working List (gitignored)

> **For AI agents:** This is the source of truth for task status.
> - Keep `## Done` and `## Not Done` strictly separated. Never mix them.
> - When you finish a task: move its `- [ ]` line to Done as `- [x]`, add date.
> - When you discover new work: append it under the correct `Not Done` subsection.
> - Keep items short, one line each. Add file paths where useful.
> - See `AGENTS.md` for project conventions.

_Last updated: 2026-09-05_

---

## In Progress (max 1–2 items)

- [ ] _None — pick from Not Done below._

## Not Done

### Generals DB (`generals.html`, `js/data_generals.js`)
- [ ] Fix total count to 169 — remove duplicates: Bock (Gold), Bock (Orange), Bock (Silver)
- [ ] Make slider UI / choices for general categories [bronze, silver, gold, orange]
- [ ] Fix Marching branch showing damage instead of mobility
- [ ] Make the list alphabetical

### Elite Forces DB (`elite.html`, `js/data_eliteforce.js`)
- [ ] Fix hover range data error — values like 2-3 range don't fit the single-bar UI
- [ ] Fix range label: show X/Xmax instead of X
- [ ] For Air units, specify how many sorties are available
- [ ] Add the cost to spawn for each Elite Force unit
- [ ] EF Database: add skins
- [ ] EF Database: add Regular Units

### Skills DB (`skills.html`, `js/data_skills.js`)
- [ ] Fix double `%%` in some skill descriptions
- [ ] Fill in missing values in some skill descriptions

### Calculator (`calculator.html`, `js/calc.js`, `js/calc_pools.js`)
- [ ] Remove all "coming soon" copy (`index.html`, `generals.html`, `elite.html`) once calculator is verified
- [ ] Verify A-vs-B-vs-Enemy results against `Extracted/DAMAGE_FORMULA.md` worked examples (eq1 → 521.856384, eq3 → 551.456384)
- [ ] Confirm title bonuses (Guderian/Manstein/Rommel/Konev/Zhukov/Marshall/Eisenhower/Montgomery) toggle correctly
- [ ] Confirm crit math (chance cap 1.0, overflow ratio, red ribbon L1–L5, noCrit/crit/auto modes)
- [ ] Handle trained (orange/purple) generals with enhanced skill values (currently uses base tables)
- [ ] Calculator: add buffs
- [ ] Calculator: add debuffs
- [ ] Calculator: add medals (medals that buff general skills)
- [ ] Calculator: add skins
- [ ] Calculator: add upgradable medals

### Data Accuracy (`js/data_*.js`, `Extracted/`)
- [ ] Spot-check general skills level-indexed effects vs `SkillSettings` (`formationCount` skipped — confirm intended)
- [ ] Spot-check elite skill tier mapping (bronze 1 / silver 2 / gold 3 / platinum 4) vs `ArmyFeatureSettings`
- [ ] Decide scope for medals / conquest tech / city techs / wonders (currently manual FakeAtk/DmgInc only)

### UI / UX (`index.html`, `generals.html`, `elite.html`, `skills.html`, `css/`)
- [ ] Mobile/responsive pass (topbar nav, vs-grid, side panels)
- [ ] Accessibility pass (labels, focus states, keyboard for sliders/combos)
- [ ] Missing portraits/icons fallback audit (`assets/generals/general.png`, `media/skills/*.webp`)
- [ ] Bump `?v=` cache version consistently when shipping CSS/JS changes (currently `v=18`)

### Release / Hygiene
- [ ] Define publish folder (which dirs get deployed; `WC4_Extracted/`, `WC4_Organized/`, `*.xapk` are already gitignored)
- [ ] Add lightweight smoke test (open pages, check `WC4_GENERALS`/`WC4_ELITE`/`WC4_SKILLS` counts render)

---

## Done

- [x] Home page with live counts + coverage line (`index.html`)
- [x] Generals DB: search, tier filter, multi-state variant switcher, star damage hover, skill tooltips (`generals.html`)
- [x] Elite Forces DB: 1–12 level slider, max-tech stats, upgrade costs (`elite.html`)
- [x] Skills DB level-by-level browse (`skills.html`, `js/data_skills.js`)
- [x] Damage formula structure proven, `effAtk = 62.5` constant verified (see `Extracted/DAMAGE_FORMULA.md` §5)
- [x] Calculator shell: A / B / Enemy panels, formula inputs, basic modifiers, HP sliders (`calculator.html`)
- [x] Static site with no build step (plain HTML/CSS/JS, `js/` + `css/` + `media/`)
- [x] Open-source presentation: `LICENSE` (MIT), `README.md`, `CONTRIBUTING.md`, footer attribution on all 5 pages (2026-09-05)
- [x] Footer redesign (nav + brand + disclaimer, `?v=19`) and `CONTRIBUTORS.md` contributors list (2026-09-05)
- [x] Footer nav gap increase (`?v=20`), Special Thanks (Nuclearman, Styx) + Contributors sections (2026-09-05)
- [x] Footer credits line (Contributors + Special thanks) on all 5 pages (2026-09-05)
- [x] Donate modal (`js/support.js`, `?v=21`): recipient notice naming JVrylle as owner, Continue/Cancel (2026-09-05)
- [x] Disclaimer hardened: EasyTech named as game developer, no dev/ownership claims (2026-09-05)

---

## Backlog / Ideas (not committed)

- [ ] Counterattack / missile / nuke / satellite damage modes
- [ ] Defense-ignore vs defense-reduction subtlety modeling
- [ ] Base-vs-final multiplier split for skills like Paulus 40%
