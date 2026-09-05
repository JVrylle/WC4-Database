# Contributing to WC4 Database

Thank you for helping improve WC4 Database! This project is open to everyone:
players who spot a wrong number, developers who want a better UI, and anyone in
between.

## Contribution Flow

```
Fork Repository
  → Create Branch
  → Make Changes
  → Verify / Test
  → Commit
  → Push
  → Open Pull Request
  → Maintainer Review
  → Merge
```

1. **Fork** the repository to your own GitHub account.
2. **Create a branch** for your change (`fix/bock-duplicates`,
   `feat/calculator-buffs`, `docs/readme-touchup`, …).
3. **Make your changes** — keep them focused; one topic per Pull Request.
4. **Verify / test** (see below).
5. **Commit** with a clear message describing what and why.
6. **Push** the branch to your fork.
7. **Open a Pull Request** against the main repository, describing the change and
   how you tested it.
8. The maintainer (**JVrylle**) will **review** it — you may be asked for tweaks.
9. Once approved, it gets **merged**. Thanks!

## What to Contribute

- Correcting inaccurate game data (stats, costs, descriptions, ranges, …)
- Adding missing information (units, skills, generals, ribbons, …)
- Updating generals, units, skills, ribbons, etc. for new game versions
- Fixing bugs
- Improving UI/UX
- Improving calculators and tools
- Improving documentation
- Adding useful features

## Evidence for Data Changes

For changes involving game statistics or database information, please provide
reasonable evidence or a source whenever possible — e.g. a screenshot with the
game version visible, a reference to the game files, or a link to a verifiable
community source. This keeps review fast and the database trustworthy.

## Verify / Test Before Submitting

There is no test runner — verification is manual:

- Open each affected HTML page directly in a browser (or serve the folder
  statically) and confirm the data renders with no console errors.
- If you touched the calculator (`js/calc.js`), check the results against the
  anchors in `Extracted/DAMAGE_FORMULA.md`: eq1 → `521.856384`,
  eq3 → `551.456384`.
- If you touched CSS/JS links, bump the `?v=N` cache version consistently on all
  pages.
- Keep diffs small and stage only the intended files. Do not commit large
  binaries or extraction intermediates (`*.xapk`, `WC4_Extracted/`,
  `WC4_Organized/` are gitignored), and never commit `TODO_LOCAL.md`.

## Review Process

All Pull Requests are reviewed by the maintainer before merging. Expect feedback
on correctness, scope, and consistency with the existing design. Data changes
backed by evidence are merged fastest.

## Code of Conduct

Be respectful and constructive. We are all here because we enjoy the game —
disagreements about numbers are fine, personal attacks are not.
