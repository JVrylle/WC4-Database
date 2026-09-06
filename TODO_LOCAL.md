# TODO — Local Working List (gitignored)

> **For AI agents:** This is the source of truth for task status.
> - Keep `## Done` and `## Not Done` strictly separated. Never mix them.
> - When you finish a task: move its `- [ ]` line to Done as `- [x]`, add date.
> - When you discover new work: append it under the correct `Not Done` subsection.
> - Keep items short, one line each. Add file paths where useful.
> - Items are numbered `1..n` within each subsection. Restart numbering per subsection; renumber the subsection when adding/moving items.
> - See `AGENTS.md` for project conventions.

_Last updated: 2026-09-06_

---

## In Progress (max 1–2 items)

- [ ] _None — pick from Not Done below._

## Not Done

### Generals DB (`generals.html`, `js/data_generals.js`)
- [ ] 1. Fix total count to 169 — remove duplicates: Bock (Gold), Bock (Orange), Bock (Silver)
- [ ] 2. Make slider UI / choices for general categories [bronze, silver, gold, orange]
- [ ] 3. Fix Marching branch showing damage instead of mobility
- [ ] 4. Make the list alphabetical
- [ ] 5. Cap purple generals at 5 skills max (currently allows more) (`generals.html`, `js/data_generals.js`)

### Elite Forces DB (`elite.html`, `js/data_eliteforce.js`)
- [ ] 1. Fix hover range data error — values like 2-3 range don't fit the single-bar UI
- [ ] 2. Fix range label: show X/Xmax instead of X
- [ ] 3. For Air units, specify how many sorties are available
- [ ] 4. Add the cost to spawn for each Elite Force unit
- [ ] 5. EF Database: add skins
- [ ] 6. EF Database: add Regular Units

### Skills DB (`skills.html`, `js/data_skills.js`)
- [ ] 1. Fix double `%%` in some skill descriptions
- [ ] 2. Fill in missing values in some skill descriptions

### Calculator (`calculator.html`, `js/calc.js`, `js/calc_pools.js`)
- [ ] 1. Remove all "coming soon" copy (`index.html`, `generals.html`, `elite.html`) once calculator is verified
- [ ] 2. Verify A-vs-B-vs-Enemy results against `Extracted/DAMAGE_FORMULA.md` worked examples (eq1 → 521.856384, eq3 → 551.456384)
- [ ] 3. Confirm title bonuses (Guderian/Manstein/Rommel/Konev/Zhukov/Marshall/Eisenhower/Montgomery) toggle correctly
- [ ] 4. Confirm crit math (chance cap 1.0, overflow ratio, red ribbon L1–L5, noCrit/crit/auto modes)
- [ ] 5. Handle trained (orange/purple) generals with enhanced skill values (currently uses base tables)
- [ ] 6. Calculator: add buffs
- [ ] 7. Calculator: add debuffs
- [ ] 8. Calculator: add medals (medals that buff general skills)
- [ ] 9. Calculator: add skins
- [ ] 10. Calculator: add upgradable medals
- [ ] 11. Separate damage multipliers in breakdown with hover labels (`calculator.html`, `js/calc.js`)
- [ ] 12. Add Naval Assault skill calculations (`js/calc.js`, `js/calc_pools.js`)
- [ ] 13. Fix crit mode Auto (bugged) — consider removing Auto, keep No Crit / Full Crit only (`calculator.html`, `js/calc.js`)
- [ ] 14. Add missing damage-increase multiplier for Divine Wrath (`js/calc.js`, `js/calc_pools.js`)
- [ ] 15. Calculator formula UI: hover value reveals label, plus toggle button for reverse (`calculator.html`, `js/calc.js`)

### Data Accuracy (`js/data_*.js`, `Extracted/`)
- [ ] 1. Spot-check general skills level-indexed effects vs `SkillSettings` (`formationCount` skipped — confirm intended)
- [ ] 2. Spot-check elite skill tier mapping (bronze 1 / silver 2 / gold 3 / platinum 4) vs `ArmyFeatureSettings`
- [ ] 3. Decide scope for medals / conquest tech / city techs / wonders (currently manual FakeAtk/DmgInc only)

### UI / UX (`index.html`, `generals.html`, `elite.html`, `skills.html`, `css/`)
- [ ] 1. Mobile/responsive pass (topbar nav, vs-grid, side panels)
- [ ] 2. Accessibility pass (labels, focus states, keyboard for sliders/combos)
- [ ] 3. Missing portraits/icons fallback audit (`assets/generals/general.png`, `media/skills/*.webp`)
- [ ] 4. Bump `?v=` cache version consistently when shipping CSS/JS changes (currently `v=18`)

### Release / Hygiene
- [ ] 1. Define publish folder (which dirs get deployed; `WC4_Extracted/`, `WC4_Organized/`, `*.xapk` are already gitignored)
- [ ] 2. Add lightweight smoke test (open pages, check `WC4_GENERALS`/`WC4_ELITE`/`WC4_SKILLS` counts render)

---

## Done

- [x] 1. Home page with live counts + coverage line (`index.html`)
- [x] 2. Generals DB: search, tier filter, multi-state variant switcher, star damage hover, skill tooltips (`generals.html`)
- [x] 3. Elite Forces DB: 1–12 level slider, max-tech stats, upgrade costs (`elite.html`)
- [x] 4. Skills DB level-by-level browse (`skills.html`, `js/data_skills.js`)
- [x] 5. Damage formula structure proven, `effAtk = 62.5` constant verified (see `Extracted/DAMAGE_FORMULA.md` §5)
- [x] 6. Calculator shell: A / B / Enemy panels, formula inputs, basic modifiers, HP sliders (`calculator.html`)
- [x] 7. Static site with no build step (plain HTML/CSS/JS, `js/` + `css/` + `media/`)
- [x] 8. Open-source presentation: `LICENSE` (MIT), `README.md`, `CONTRIBUTING.md`, footer attribution on all 5 pages (2026-09-05)
- [x] 9. Footer redesign (nav + brand + disclaimer, `?v=19`) and `CONTRIBUTORS.md` contributors list (2026-09-05)
- [x] 10. Footer nav gap increase (`?v=20`), Special Thanks (Nuclearman, Styx) + Contributors sections (2026-09-05)
- [x] 11. Footer credits line (Contributors + Special thanks) on all 5 pages (2026-09-05)
- [x] 12. Donate modal (`js/support.js`, `?v=21`): recipient notice naming JVrylle as owner, Continue/Cancel (2026-09-05)
- [x] 13. Disclaimer hardened: EasyTech named as game developer, no dev/ownership claims (2026-09-05)

---

## Backlog / Ideas (not committed)

- [ ] 1. Counterattack / missile / nuke / satellite damage modes
- [ ] 2. Defense-ignore vs defense-reduction subtlety modeling
- [ ] 3. Base-vs-final multiplier split for skills like Paulus 40%
