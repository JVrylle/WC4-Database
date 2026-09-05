# AGENTS.md — WC4 Community Database

## Project
Static World Conqueror 4 fan database + damage calculator. No build step, no framework, no backend. Open HTML files directly or serve statically.

## First Steps for Every Task
1. Read `TODO_LOCAL.md` (local-only, gitignored). It holds `In Progress` / `Not Done` / `Done` — strictly separated.
2. Pick work from `Not Done`. Move it to `In Progress` (max 1–2 items at a time).
3. When finished, move it to `Done` as `- [x]` with the file(s) touched. Append any discovered work to the correct `Not Done` subsection.
4. Read `Extracted/DAMAGE_FORMULA.md` before touching any damage math.

## File Map
- Pages: `index.html`, `generals.html`, `elite.html`, `skills.html`, `calculator.html`
- Logic: `js/app.js` (shared), `js/calc.js` + `js/calc_pools.js` (calculator)
- Data (generated, edit carefully): `js/data_generals.js`, `js/data_eliteforce.js`, `js/data_skills.js`, `js/data_portraits.js`, `js/data_skill_icons.js`, `js/data_feat_icons.js`, `js/data_general_extra.js`
- Styles: `css/style.css`, `css/app.css`, `css/calc.css`
- Formula spec: `Extracted/DAMAGE_FORMULA.md` (effAtk = 62.5 constant, Stage 1/Stage 2, crit math)
- Local-only state (never commit): `TODO_LOCAL.md`, `.agents/`, `.claude/`, `.playwright-cli/`

## Conventions
- Cache-busting: CSS/JS links use `?v=N`. Bump `N` on all pages when shipping asset changes.
- Data files expose globals (`WC4_GENERALS`, `WC4_ELITE`, `WC4_SKILLS`, `WC4_PORTRAITS`, etc.). Keep names/shapes stable.
- Damage math lives in `js/calc.js`: `TECH_BY_TYPE`, `STAR_VALUE = [0,4,8,13,16,24,30]`, morale/crit/health/fake/dmgInc/dmgRed/flat, blue ribbon, terrain, effAtk override (default 62.5).
- Verify calculator changes against the two anchors: eq1 → `521.856384`, eq3 → `551.456384`.
- Keep pages offline-friendly; no new network dependencies without asking.
- Don't commit large binaries or extraction intermediates (`*.xapk`, `WC4_Extracted/`, `WC4_Organized/` are gitignored).

## Verification
- No test runner. Smoke test: open each HTML page, confirm counts render and console has no errors.
- After calculator edits: run the eq1/eq3 checks and note results in `TODO_LOCAL.md`.
- Keep diffs small; stage only intended files.
