# WC4 Database

**An open-source, community-driven database and toolkit for World Conqueror 4.**

Created and maintained by **JVrylle**.

WC4 Database provides accurate, accessible, and useful World Conqueror 4 information
and tools for the community — free to use, free to fork, and open to contributions.
If you spot wrong data or have an idea for a feature,
[contributions are welcome](CONTRIBUTING.md).

## About

WC4 Database is a static fan-made website (plain HTML, CSS, and JavaScript — no build
step, no backend) covering World Conqueror 4 generals, elite forces, skills, and a
damage calculator. All data is stored in versioned JavaScript files under `js/`, so
corrections are easy to review and merge.

## Features

- **Generals database** — search generals by name, filter by tier, inspect branch
  ratings, ranks, and per-skill effects.
- **Elite Forces database** — browse units with a 1–12 level slider showing stats,
  upgrade costs, and skills at every stage.
- **Skills browser** — look up general and elite-force skills level by level.
- **Damage calculator** — compare two general + elite-force setups against a
  defender, based on the verified formula in `Extracted/DAMAGE_FORMULA.md`.
- **Offline-friendly** — no accounts, no paywalls, no build tools required.

## Getting Started

No installation needed. Either open `index.html` directly in a browser, or serve the
folder statically, for example:

```sh
npx serve .
# or
python -m http.server
```

Then open the printed local URL.

## Project Structure

| Path | Contents |
| --- | --- |
| `index.html`, `generals.html`, `elite.html`, `skills.html`, `calculator.html` | Pages |
| `js/app.js` | Shared UI logic |
| `js/calc.js`, `js/calc_pools.js` | Damage calculator |
| `js/data_*.js` | Database files (generals, elite forces, skills, portraits, icons) |
| `css/` | Styles (`style.css`, `app.css`, `calc.css`) |
| `Extracted/DAMAGE_FORMULA.md` | Verified damage-formula reference |
| `CONTRIBUTING.md` | How to contribute |

## Data Accuracy

Game data is transcribed from in-game values and community verification. If you find
an error, please [open a Pull Request](CONTRIBUTING.md) with evidence or a source
(screenshot, game version, or reference) so it can be reviewed quickly.

## Contributing

Contributions of all kinds are welcome: data corrections, bug fixes, UI
improvements, calculator work, documentation, and new features. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

## Contributors

Created by **JVrylle** and improved with contributions from the WC4 community
(see [CONTRIBUTORS.md](CONTRIBUTORS.md)). Special thanks to **Nuclearman** and
**Styx**.
Individual contributions are recorded in the Git history — please see the
repository's commit and Pull Request history as the source of truth.

## Support the Project

WC4 Database is free and open source. If you find the project useful, you can
support its continued development and maintenance.

- Donate: [https://ko-fi.com/jvrylle](https://ko-fi.com/jvrylle)

Donations go directly to the project maintainer and help support continued
development and maintenance of WC4 Database.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
The license covers the original project source code. It does not grant rights to
third-party World Conqueror 4 intellectual property (see Disclaimer below).

## Disclaimer

WC4 Database is an unofficial fan-made project. It is not affiliated with,
sponsored by, or officially endorsed by EasyTech, the developer of World
Conqueror 4, or its publishers. World Conqueror 4, and all related game assets, artwork, characters,
and trademarks, belong to their respective owners.
