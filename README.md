# The Urban Monk Rule

A single-page, black-and-white "digital field notebook" — vanilla HTML/CSS/JS,
Space Grotesk only, no frameworks. It uses the **same Back4App app/keys as the
wardrobe project** — data is kept separate by project through its own set of
Parse class names, not through a separate app.

## Setup

1. `js/back4app-client.js` already has the same `B4A_ID` / `B4A_KEY` as the
   wardrobe project's `js/back4app-client.js` — nothing to fill in.
2. Open `index.html` in a browser (or serve the folder statically) and use the
   app for a bit — this creates ten new classes in that Back4App app
   automatically the first time each is written to: `MonkDay`, `MonkPlaceNote`,
   `MonkJournalEntry`, `MonkActivity`, `MonkPlant`, `MonkSourdoughFeeding`,
   `MonkWatchlistItem`, `MonkBook`, `MonkBookNote`, `MonkWishlistItem`. These
   don't overlap with the wardrobe's `Garment`/`Repair`/`Outfit`/etc classes
   already in that app.
3. In the Back4App dashboard, open each of those ten classes → **Security**,
   and turn on public **Find / Get / Create / Update / Delete** — same step you
   did for the wardrobe project's classes (Delete is needed here too, since
   Plants, Watchlist items, Books, Book notes, and Wishlist items can all be
   removed). Without it, reads/writes fail quietly and the app just runs on an
   in-memory session instead of persisting.
4. The Wishlist chapter's daily savings rate is stored in your browser's
   localStorage, not Back4App — it's a pacing number, not real money tracking,
   so nothing to set up for it.

That's it — no accounts, no login, no separate backend to stand up.

## Structure

```
index.html            — the shell + all 19 chapters (shown/hidden via JS)
css/style.css          — the whole black & white design system
js/back4app-client.js  — generic Back4App REST client (fetchClass/createInClass/etc.)
js/monk-data.js        — all static content: quotes, prompts, checklists, craft db, recipes
js/monk-app.js          — navigation + all interactions + Back4App wiring
```

## Chapters

Home, Rhythm, Place, Presence, Solitude, Humility, Learning, **Reading**,
Craft, **Plants**, **Sourdough**, **Watchlist**, **Wishlist**, Stewardship,
Attention, Joy, Journal, Random Practice, Progress.

- **Reading** — a shelf of books, each an expandable card. Click a book to
  open it, cycle its status (Want to Read → Reading → Finished) with the
  status pill, and leave annotations: a quote, an optional page number, and
  a note on what it means to you. Annotations and books can each be removed
  individually.
- **Plants** — track anything you're growing through Seed → Seedling → Sprout
  → Fruiting → Harvestable, with an "Advance Stage" button per plant.
- **Sourdough** — a starter feeding log ("last fed X days ago"), plus two
  recipe lists (discard recipes, recipes to try). Clicking a recipe opens a
  popup with its full ingredient list and method, where you can mark it
  tried or remove it from the list permanently.
- **Watchlist** — documentaries/videos to watch instead of doomscrolling, with
  a "What Should I Watch Tonight?" button that picks something you haven't
  watched yet.
- **Wishlist** — things to mull over rather than buy on impulse. Set a daily
  amount you're setting aside; each item shows a derived waiting period
  (price ÷ daily rate) and how far along you are, alongside a short checklist
  (fulfills a purpose / matches your aesthetic / not plastic) to actually look
  at before buying. "Bought It" and "Remove" both take it off the list.
