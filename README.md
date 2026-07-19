# The Urban Monk Rule

A single-page, black-and-white "digital field notebook" — vanilla HTML/CSS/JS,
Space Grotesk only, no frameworks. It uses the **same Back4App app/keys as the
wardrobe project** — data is kept separate by project through its own set of
Parse class names, not through a separate app.

## Setup

1. `js/back4app-client.js` already has the same `B4A_ID` / `B4A_KEY` as the
   wardrobe project's `js/back4app-client.js` — nothing to fill in.
2. Open `index.html` in a browser (or serve the folder statically) and use the
   app for a bit — this creates four new classes in that Back4App app
   automatically the first time each is written to: `MonkDay`, `MonkPlaceNote`,
   `MonkJournalEntry`, `MonkActivity`. These don't overlap with the wardrobe's
   `Garment`/`Repair`/`Outfit`/etc classes already in that app.
3. In the Back4App dashboard, open each of those four classes → **Security**,
   and turn on public **Find / Get / Create / Update** — same step you did for
   the wardrobe project's classes. Without it, reads/writes fail quietly and
   the app just runs on an in-memory session instead of persisting.

That's it — no accounts, no login, no separate backend to stand up.

## Structure

```
index.html            — the shell + all 14 chapters (shown/hidden via JS)
css/style.css          — the whole black & white design system
js/back4app-client.js  — generic Back4App REST client (fetchClass/createInClass/etc.)
js/monk-data.js        — all static content: quotes, prompts, checklists, craft db
js/monk-app.js          — navigation + all interactions + Back4App wiring
```
