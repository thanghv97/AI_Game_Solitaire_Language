# Vocab Solitaire

A vocabulary-learning card game built as a solitaire variant. Players sort word cards by topic into Foundation piles to win.

## What It Does

- Upload a JSON vocab file to generate a unique game each session
- Cards represent words belonging to topics (e.g. LIBRARY, KITCHEN)
- Each topic has one golden "Theme card" — you must collect all words under it, then move the full stack to the Foundation
- Countdown move timer adds strategic pressure
- Click any face-up card to see its definition in the Dictionary panel

## How to Run

```bash
npm run dev       # dev server at http://localhost:3000
npm run build     # production build
npm run start     # serve production build
```

## Tech Stack

| Layer     | Choice                      |
|-----------|----------------------------|
| Framework | Next.js 15 (App Router)    |
| Language  | TypeScript                  |
| Styling   | Tailwind CSS v4             |
| State     | useReducer (no external lib)|
| Drag&Drop | @dnd-kit/core               |
| File Load | `<input type="file">` + JSON.parse |
| Dict API  | Placeholder (hook ready)    |

## Folder Structure

```
app/
  page.tsx            — root: shows UploadScreen or GameBoard
  layout.tsx          — HTML shell
  globals.css         — base styles
  types.ts            — Card, GameState, VocabFile types
  gameEngine.ts       — pure game logic (init, moves, validation)
  components/
    UploadScreen.tsx  — file upload / drag-drop / sample load
    GameBoard.tsx     — DnD context, reducer dispatch, layout
    TableauColumn.tsx — droppable column with stacked cards
    StockWaste.tsx    — stock pile + waste pile
    Foundation.tsx    — foundation slot per topic
    GameCard.tsx      — draggable card (face-up / face-down)
    DictionaryPanel.tsx — word definition sidebar
public/
  (static assets)
.env.local            — game config (topic/word count ranges)
```

## Environment Config (.env.local)

```env
NEXT_PUBLIC_MIN_TOPICS=2
NEXT_PUBLIC_MAX_TOPICS=4
NEXT_PUBLIC_MIN_WORDS_PER_TOPIC=3
NEXT_PUBLIC_MAX_WORDS_PER_TOPIC=10
```

## Creating Vocab Topic Files

```json
{
  "topics": [
    {
      "name": "LIBRARY",
      "words": ["shelf", "bookmark", "catalogue", "manuscript", "archive"]
    },
    {
      "name": "KITCHEN",
      "words": ["ladle", "colander", "whisk", "spatula", "cleaver"]
    }
  ]
}
```

Rules:
- `name` must be UPPERCASE (displayed on theme card)
- Each topic needs at least `MIN_WORDS_PER_TOPIC` words
- App randomly selects 2–4 topics and 3–10 words per topic each game

## Game Rules Summary

- **Stock** → draw 1 card at a time (costs 1 move)
- **Waste** → drag to Tableau or Foundation
- **Tableau** → stack same-topic words; theme card can go on a word (not vice versa); any card on empty column
- **Foundation** → drop entire stack when theme card is on top; theme becomes base, words stack above
- **Win** → all topics moved to Foundation
- **Lose** → move counter hits 0

## What's Next

- Connect Cambridge Dictionary API for real definitions + IPA
- Undo last move button
- Hint system (highlight valid moves)
- Persistent high scores via localStorage
- Animated card flip and deal transitions
- Mobile touch support improvements
