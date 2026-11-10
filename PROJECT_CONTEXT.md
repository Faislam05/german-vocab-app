# German Vocab App — Project Context

## Purpose

This project is a German A1 vocabulary learning app based on textbook vocabulary.

The app should help the user learn vocabulary efficiently using:

- vocabulary cards
- German pronunciation
- example sentences
- progress tracking
- lesson-based study
- later spaced repetition

The project is currently a web app built with Next.js.

---

## Current Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- JSON vocabulary files
- Browser Speech Synthesis API
- localStorage
- Git
- GitHub
- VS Code

The app currently runs locally using:

```bash
npm run dev
```

---

## Important Development Preference

The user is still learning web development.

When making changes:

1. Prefer small, understandable changes.
2. Explain briefly what is being changed and why.
3. Avoid unnecessary architectural complexity.
4. Do not rewrite the entire application unless necessary.
5. Prefer editing the existing code directly.
6. Preserve working functionality while adding features.
7. Do not remove existing features unless explicitly requested.
8. Keep code readable and beginner-friendly.

---

# Data Structure

Vocabulary content is stored separately from the user interface.

Lesson data lives in JSON files inside:

```text
public/data/
```

`public/data/lessons.json` is the list of lessons the app shows. The app loads that list first, then every lesson file in it (`useLessons()` in `src/lib/useLessons.ts`).

Current lessons:

| Lesson | App file | Words | Textbook pages |
|---|---|---|---|
| Lektion 1 | `lektion_01_enriched_with_emojis.json` | 107 | 5–6 |
| Lektion 2 | `lektion_02_enriched_with_emojis.json` | 76 | 19–20 |

Each lesson also has a `lektion_XX_source.json` with exactly what is printed in the book (words, page references, article codes, expressions and grammar tables). The app does not read the source files; they are kept so the enriched files can be rebuilt or checked. (`lektion_01_enriched.json` is an older Lektion 1 version that is not used.)

## Adding a new lesson

1. Share photos/PDF of the lesson's vocabulary page(s) from the textbook.
2. Create `lektion_XX_source.json` (as printed) and `lektion_XX_enriched_with_emojis.json` (for the app), following the Lektion 1 and 2 format and the "Part of Speech Labels" table.
3. Add one entry to `public/data/lessons.json`.
4. Run `npm run check-data` and fix anything it reports.

No code change is needed.

Each enriched lesson file contains:

- vocabulary cards
- German words
- English meanings
- part of speech
- lesson information
- page references
- German pronunciation text
- emoji visuals
- example sentences
- noun article/gender/plural where applicable

---

# App Screens

The app has two screens.

## Home screen (`/`)

The lesson overview. It shows:

- lesson picker: one button per lesson (Lektion 1, Lektion 2, …) plus "All", each with its Mastered %. The choice is remembered in localStorage (`selectedLesson`); the first visit starts with the first lesson.
- CEFR level, word count and title of the chosen lesson
- mastered-word percentage with a progress bar
- Learning count
- Mastered count
- direction toggle: 🇩🇪 → 🇬🇧 or 🇬🇧 → 🇩🇪 (see "Study Direction")
- three study buttons, each with its word count (the lesson and direction are added to each link, e.g. `/study?lesson=2&filter=learning&direction=en-de`):
  - Study Learning words → `/study?filter=learning`
  - Study all words → `/study?filter=all`
  - Review Mastered words → `/study?filter=mastered`
- a keyboard shortcut hint

## Study screen (`/study`)

The flashcard screen. The lesson, filter and direction are read from the URL (`?lesson=2&filter=all&direction=de-en`). `lesson=all` (or a missing/unknown lesson) studies all lessons combined.

Top bar:

- ← Home link
- current filter name + card number (e.g. `All · 1 / 107`)
- 🔀 Shuffle toggle (black when on)
- Flashcard mode On/Off toggle
- progress bar

Each vocabulary card shows:

- emoji visual (shows ❓ until the answer is revealed)
- part-of-speech badge
- German word
- German pronunciation button
- Show Meaning button (in Flashcard mode, until revealed)

After revealing (or always, when Flashcard mode is Off):

- English meaning
- plural where available
- Learning / Mastered buttons
- approximately three German example sentences
- English translations
- pronunciation button for each German sentence

Then:

- Previous button
- Next button

The Study screen is sized so a revealed card fits on one screen without scrolling on desktop (1440×800) and on normal phones (390×844), tested for all 107 words. On very small phones (375×667, iPhone SE) about 40 longer words need a short scroll to see the last example; Previous/Next stick to the bottom of the screen so they are always reachable. Keep this in mind when adding content to the card.

---

# Part of Speech Labels

Every word has a `part_of_speech` value in the JSON. It is shown as the grey badge on the card (e.g. `question_word` → "QUESTION WORD").

Use only these labels in lesson files:

| Label | Use for | Examples (Lektion 1) |
|---|---|---|
| `noun` | nouns, including names of countries | der Beruf, die Frau, Deutschland |
| `verb` | verbs | arbeiten, heißen |
| `adjective` | adjectives | alt, gut |
| `adverb` | adverbs and similar small words | hier, bitte |
| `question_word` | W-question words | was, wer, wie, wie viel, wo, woher, wohin |
| `preposition` | prepositions | aus, in, mit, von |
| `conjunction` | words that join sentences | und, aber |
| `possessive` | possessive words | mein, dein |
| `pronoun` | pronouns | man, das (that/this) |
| `particle` | answer words and conversational particles | ja, denn |

The old catch-all label `function_word` is no longer used. Lektion 1 was relabelled so that question words, prepositions, etc. can be told apart (useful for future category filters, e.g. "study only question words").

New labels can be added if a new lesson needs one; add them to this table.

If you add a label, also add it to `ALLOWED_LABELS` in `scripts/check-data.mjs`.

## Data check

`npm run check-data` checks every lesson in `lessons.json` and reports:

- unknown `part_of_speech` labels (including the old `function_word`)
- nouns with a missing gender, or an article that doesn't match the gender
- missing required fields (`word`, `display`, `part_of_speech`, `english`, `tts_text`, `examples`)
- duplicate words within a lesson, wrong lesson numbers
- lesson files in `public/data/` that are not listed in `lessons.json` (warning)

Run it after creating or editing any lesson file.

---

# Vocabulary Visuals

The project originally tested Wikimedia Commons image search.

This was abandoned because automatically selected images were often irrelevant.

The current design uses emojis stored in the vocabulary JSON.

Example:

```text
arbeiten → 💼
Telefon → 📞
Straße → 🛣️
Geburtstag → 🎂
Student → 🎓
Deutschland → 🇩🇪
```

Emoji visuals are currently preferred because they are:

- consistent
- free
- fast
- simple
- offline-friendly

A different visual system can be introduced later.

---

# Study Status Logic

The project originally considered three states:

```text
New
Learning
Known
```

This was simplified.

The current states are only:

```text
Learning
Mastered
```

The Mastered state was previously called "Known" and saved as `"known"`. It is now `"mastered"` everywhere: interface, code, URLs (`filter=mastered`) and saved data. Older saved progress is converted automatically: `migrateStudyStatus()` in `src/lib/vocabulary.ts` changes any `"known"` values to `"mastered"` when progress is loaded and saves the result.

Every vocabulary word should behave as:

```text
Learning
```

by default.

The user does not need to manually mark a new word as Learning.

A word becomes Mastered only when the user explicitly marks it as Mastered.

Study status is saved using browser `localStorage`.

Current localStorage key:

```text
studyStatus
```

The value maps vocabulary words to their status.

Example:

```json
{
  "arbeiten": "mastered",
  "der Beruf": "learning"
}
```

Untouched words should be treated as Learning.

---

# Study Filters

The app currently provides:

```text
All
Learning
Mastered
```

The filter is chosen on the Home screen and passed to the Study screen in the URL, e.g. `/study?filter=learning`.

The filter logic lives in `filterVocabulary()` in `src/lib/vocabulary.ts`.

### All

Shows every vocabulary word.

### Learning

Shows words that are not marked Mastered.

This includes words without an explicit saved status.

### Mastered

Shows only words explicitly marked Mastered.

---

# Progress Counters

The app currently displays:

```text
Learning: X
Mastered: Y
```

Mastered count is calculated from words explicitly marked:

```text
mastered
```

Learning count is:

```text
total vocabulary - mastered vocabulary
```

This means untouched words count as Learning.

---

# Favorites Decision

A Favorites system was previously implemented.

It included:

- star button
- favorite count
- Favorites-only mode
- localStorage persistence

This feature was intentionally removed.

Reason:

Favorites and Learning had too much overlap for the current learning workflow.

For now, the app should use:

```text
Learning
Mastered
```

instead.

Do not reintroduce Favorites unless specifically requested.

A possible future feature could instead be:

```text
Difficult
```

for words the user wants to focus on.

---

# Keyboard Navigation

Keyboard navigation has been added on the Study screen.

Current behavior:

```text
Spacebar → Show meaning (reveal answer)
Right Arrow → Next word
Left Arrow → Previous word
```

The keyboard listener must safely handle the period before lesson data has loaded.

Do not reference `visibleVocabulary` before it has been initialized.

Current safe approach:

```tsx
const visibleVocabulary = filterVocabulary(
  lessonData?.vocabulary ?? [],
  studyStatus,
  studyFilter
);
```

This is an empty list while data is loading, so its length is safe to use.

---

# Important React Hook Rule

Do not move React hooks below conditional returns.

For example, avoid creating:

```tsx
if (!lessonData) {
  return ...
}

useEffect(...)
```

because React hooks must always execute in the same order.

Any `useEffect` required for keyboard navigation or other behavior should remain before conditional returns.

---

# Current Persistence

For now, user progress is stored in browser `localStorage`.

This is suitable for the current prototype.

A backend/database is not required yet.

Possible future database:

- Supabase
- another simple hosted database

A database should only be introduced when features such as these are needed:

- user accounts
- multiple devices
- progress synchronization
- cloud backup

---

# Current Design Philosophy

The content and interface should remain separate.

In simple terms:

```text
JSON = vocabulary/content
React/Next.js = interface
localStorage = user progress
```

Changing the visual design should not require rebuilding the vocabulary data.

The app may later be redesigned completely.

Possible future styles include:

- Duolingo-style
- Anki-style
- collectible-card style
- Pokémon-inspired card layout
- dark mode
- textbook/notebook style
- native mobile-app style

Do not tightly couple the vocabulary data to the current visual design.

---

# Flashcard Reveal Mode

Implemented on the Study screen.

The card first shows only the German word (with part of speech and the Listen button) and a button:

```text
Show Meaning
```

The emoji shows ❓ until revealed, because the emoji often gives away the meaning.

After revealing the answer, the card shows:

- English meaning
- plural
- Learning / Mastered controls
- examples

Keyboard shortcut:

```text
Spacebar → Reveal answer
```

How it works:

- `revealMode` (true/false) — whether Flashcard mode is on. Default (both directions): Off for "Study all words" (read through everything), On for "Study Learning words" and "Review Mastered words" (test yourself). It is not saved; it resets to that default when the Study screen opens. The top-bar toggle can change it.
- `revealedWord` — the word that has been revealed. Because it stores the word itself, moving to a different word hides the answer again automatically, with no manual reset.

---

# Shuffle Mode

Implemented on the Study screen with the 🔀 button.

- Off by default: words appear in textbook order.
- When turned on, the lesson words are shuffled once (`shuffleArray()` in `src/lib/vocabulary.ts`, a Fisher–Yates shuffle) and stored in `shuffledVocabulary`.
- The order stays the same while studying, including going back with Previous and marking words Mastered.
- Turning it off returns to textbook order; turning it on again gives a new random order.
- It starts again from the first card whenever it is toggled.
- Not saved; it resets to Off when the Study screen opens.

The filter is applied after shuffling, so shuffle works with All, Learning and Mastered.

---

# Study Direction

Chosen on the Home screen and passed to the Study screen in the URL (`&direction=de-en` or `&direction=en-de`). Missing or unknown values mean German → English.

The last choice is remembered in localStorage:

```text
studyDirection
```

### German → English (`de-en`, default)

- Question: German word + 🔊 Listen. Emoji shows ❓ until revealed.
- Button: Show Meaning
- Answer: English meaning, plural, Learning/Mastered, examples

### English → German (`en-de`)

- Question: English meaning + part of speech. Emoji is shown as a hint.
- Button: Show German
- Answer: German word with article, 🔊 Listen, plural, Learning/Mastered, examples
- Listen, plural and examples stay hidden until revealed, because they give away the German word.

The answer is self-checked (reveal and compare); nothing is typed. A possible later step is a typed-answer mode that checks spelling and article.

Learning/Mastered status is shared between both directions.

---

# Article Colours

The German word is shown with its article coloured by gender (`src/components/GermanWord.tsx`), in both study directions:

| Article | Colour | Based on `gender` |
|---|---|---|
| der | blue | masculine |
| die | red | feminine |
| das | green | neuter |
| die (plural-only nouns, e.g. die Eltern, die Leute) | amber | plural |

The colour comes from the `gender` field in the JSON, not from the article text, so plural-only "die" is not shown as feminine. Words without an article are shown unchanged.

---

# Future Features

Potential future development includes:

### Study

- difficult-word status
- spaced repetition
- review scheduling
- quiz mode
- typed answers for English → German (check spelling and article)
- separate Learning/Mastered status per direction

### Progress

- lesson completion percentage
- progress dashboard
- daily review counts

### Lessons

- study expressions (e.g. *Guten Tag!*, *alle sein*) — already stored in each lesson file under `expressions`, not shown yet
- grammar cards from the stored `grammar` tables
- when there are many lessons: a scrolling lesson list instead of buttons

### Vocabulary Import

Potential later workflow:

- upload textbook PDF
- upload textbook page photos
- OCR vocabulary
- normalize vocabulary into JSON
- enrich with examples
- add pronunciation metadata
- add visual metadata

### UI

- improved mobile layout
- responsive navigation
- dark mode
- animations
- redesigned cards
- bottom navigation
- progress screen
- settings screen

### Platform

The current priority is the web app.

Possible later options:

- Progressive Web App
- native iOS app
- SwiftUI version

Do not migrate to native iOS unless explicitly requested.

---

# File Structure

Important files currently include approximately:

```text
german-vocab-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Home screen (lesson overview)
│   │   └── study/
│   │       ├── page.tsx          ← /study route (Suspense wrapper)
│   │       └── StudySession.tsx  ← flashcard study screen (state + logic)
│   │
│   ├── components/               ← reusable pieces of the interface
│   │   ├── ListenButton.tsx      ← 🔊 button (pill or icon-only)
│   │   ├── GermanWord.tsx        ← German word with coloured article
│   │   ├── ExampleSentences.tsx  ← example sentence list
│   │   └── StudyTopBar.tsx       ← Study top bar + progress bar
│   │
│   └── lib/
│       ├── vocabulary.ts         ← shared types, lesson selection,
│       │                            localStorage helpers, filter,
│       │                            shuffle and formatting helpers
│       └── useLessons.ts         ← hook that loads all lessons listed
│                                    in lessons.json (Home and Study)
│
├── public/
│   └── data/
│       ├── lessons.json          ← list of lessons shown in the app
│       ├── lektion_XX_enriched_with_emojis.json  ← lesson data (app)
│       └── lektion_XX_source.json                ← as printed in the book
│
├── scripts/
│   └── check-data.mjs            ← `npm run check-data`: finds mistakes
│                                    in lesson files
│
├── GERMAN_VOCAB_APP_TECHNICAL_GUIDE.md
├── PROJECT_CONTEXT.md
├── package.json
└── README.md
```

The exact project structure should always be inspected before editing.

### Component guideline

- Screens (`src/app/.../page.tsx`, `StudySession.tsx`) hold the state and decide what happens.
- Components (`src/components/`) only display things and report clicks, receiving everything through props.
- Split a piece out into a component when it is reused or when a screen file becomes hard to read — not for every button.
- All localStorage reads/writes go through helpers in `src/lib/vocabulary.ts`, which use try/catch so broken or blocked storage cannot crash the app.

---

# Git Workflow

The repository is connected to GitHub.

Repository:

```text
Faislam05/german-vocab-app
```

Prefer commits at meaningful working milestones.

Examples:

```text
Add Learning and Known study tracking
Add study filters and progress counters
Add keyboard navigation
Add flashcard reveal mode
```

Do not create unnecessary commits for every tiny formatting change.

---

# Source of Truth

Before modifying the project:

1. Read this file.
2. Inspect the current code.
3. Inspect the relevant JSON structure.
4. Preserve existing working functionality.
5. Make the smallest sensible change.
6. Explain the change briefly.

If this file conflicts with the actual current code, inspect the Git history and current implementation before making assumptions.

The actual codebase is the final technical source of truth.

---

# Current Product Principle

Keep the app:

- simple
- fast
- beginner-friendly
- focused on vocabulary learning
- easy to maintain
- easy to redesign later

Do not add complexity simply because it is technically possible.