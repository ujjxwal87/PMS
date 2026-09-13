# Bunker-o-Billionaire

A PMS (portfolio management services) marketplace for HNI investors, advisors and asset
managers. This repo is the **frontend prototype**: every screen from the design canvas, built
in React, running on sample data. No backend, no API calls — every number is in `src/data/`.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

To share it with people on the same Wi-Fi:

```bash
npm start            # prints a Network: http://192.168.x.x:5173 URL others can open
```

Production build:

```bash
npm run build && npm run preview
```

Requires Node 18+.

## Screens

Routing is hash-based, so every tab has a shareable link (`…/#/leaderboard`).

| Route | What it is |
| --- | --- |
| `/discover` | Editorial front page — this month's note, top books by period, screener, newsflow |
| `/leaderboard` | Composite ranking on four metrics, with three weighting lenses |
| `/compare` | Three strategies side by side, best value in each row highlighted |
| `/managers` | Firms ranked asset-weighted, not by their flagship |
| `/managers/:slug` | Manager profile — process, books, team, compliance |
| `/research` | Current note plus a filterable archive |
| `/events` | Live sessions, replays, your registrations |
| `/learn` | Six-chapter knowledge centre and glossary |
| `/invest` | Four-step onboarding: strategy → KYC → funding → e-sign |
| `/portfolio` | Investor holdings, XIRR, statements |
| `/fees` | Fee calculator — flat vs hybrid vs profit-only, priced for the year |
| `/plans` | Investor / advisor / asset-manager access tiers |

## What actually works

These are live, not mocked pictures:

- **Period switch (1M/1Y/3Y/5Y)** re-sorts Discover, the leaderboard and the onboarding picker.
- **Lens switch** re-weights the composite score and re-ranks the table; the rail shows which
  strategies moved and by how many places against the Balanced ordering.
- **Screener chips** toggle and update the match count.
- **Comparison basket** carries from the leaderboard into `/compare`.
- **Fee calculator** prices all three structures for the chosen amount and gross return, marks
  the cheapest, and the verdict names the return at which a different structure wins.
- **Onboarding** steps forward and back, keeps its form state and signs the mandate.
- **Event registration** toggles and feeds the "your registrations" rail.

## Layout

```
src/
  data/        sample data — strategies, returns, firms, notes, events, holdings, plans
  lib/         scoring (composite + lens movers), fee maths, formatting
  components/  masthead, shared UI primitives, universe chart
  screens/     one file per screen
  styles/      tokens.css (palette, type, rhythm) + app.css
  state.jsx    cross-screen state: period, lens, chips, comparison basket, plan
```

`design/` holds the original Claude Design canvas files (`.dc.html`) and the HiLabs design-system
bundle the project started from. They are reference only — nothing in `src/` imports them.

## Design

Ivory and deep green, Source Serif 4 for display and Source Sans 3 for text — a broadsheet
rather than a dashboard. All colour, type and spacing values live as CSS custom properties in
`src/styles/tokens.css`; change them there and the whole app follows.

## Caveats

Sample data only. The figures, firms, managers and track records are invented for the prototype —
they are not real PMS performance, and nothing here is investment advice.
