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

The current lesson data is loaded from a JSON file inside:

```text
public/data/
```

The current app fetches the Lektion 1 enriched vocabulary JSON.

The exact filename may change, so inspect the existing `fetch()` path before editing it.

The current lesson contains approximately:

- 107 vocabulary cards
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

# Current Vocabulary Card Features

Each vocabulary card currently shows:

- lesson title
- current card number
- progress bar
- Learning count
- Known count
- All / Learning / Known filters
- emoji visual
- part-of-speech badge
- German word
- German pronunciation button
- English meaning
- plural where available
- approximately three German example sentences
- English translations
- pronunciation button for each German sentence
- Previous button
- Next button

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
Known
```

Every vocabulary word should behave as:

```text
Learning
```

by default.

The user does not need to manually mark a new word as Learning.

A word becomes Known only when the user explicitly marks it as Known.

Study status is saved using browser `localStorage`.

Current localStorage key:

```text
studyStatus
```

The value maps vocabulary words to their status.

Example:

```json
{
  "arbeiten": "known",
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
Known
```

### All

Shows every vocabulary word.

### Learning

Shows words that are not marked Known.

This includes words without an explicit saved status.

### Known

Shows only words explicitly marked Known.

---

# Progress Counters

The app currently displays:

```text
Learning: X
Known: Y
```

Known count is calculated from words explicitly marked:

```text
known
```

Learning count is:

```text
total vocabulary - known vocabulary
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
Known
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

Keyboard navigation has been added.

Current behavior:

```text
Right Arrow → Next word
Left Arrow → Previous word
```

The keyboard listener must safely handle the period before lesson data has loaded.

Do not reference `visibleVocabulary` before it has been initialized.

Current safe approach:

```tsx
let visibleVocabulary = lessonData?.vocabulary ?? [];
```

and then apply filters before using its length.

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

# Planned Next Feature

The next major study feature under consideration is:

## Flashcard Reveal Mode

Instead of immediately showing the English translation, the card could initially show only:

```text
der Beruf
```

and a button such as:

```text
Show Meaning
```

After revealing the answer, show:

- English meaning
- plural
- examples
- Learning / Known controls

Possible keyboard shortcut:

```text
Spacebar → Reveal answer
```

This has not necessarily been implemented yet.

Inspect the current code before assuming it exists.

---

# Future Features

Potential future development includes:

### Study

- flashcard reveal mode
- difficult-word status
- spaced repetition
- review scheduling
- random/shuffle mode
- quiz mode
- German → English
- English → German

### Progress

- lesson completion percentage
- known-word percentage
- progress dashboard
- daily review counts

### Lessons

- multiple lessons
- lesson selection screen
- lesson progress overview
- combined vocabulary review

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
- dedicated study screen
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
│   └── app/
│       └── page.tsx
│
├── public/
│   └── data/
│       └── lesson JSON files
│
├── GERMAN_VOCAB_APP_TECHNICAL_GUIDE.md
├── PROJECT_CONTEXT.md
├── package.json
└── README.md
```

The exact project structure should always be inspected before editing.

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