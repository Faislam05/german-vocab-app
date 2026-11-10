# German Vocabulary App — Tools, Technologies, and Project Architecture

This document explains the tools and technologies currently used in the **German Vocabulary App** project, what each one does, why it was chosen, and how the pieces fit together.

---

## 1. Project Goal

The goal of this project is to build a German A1 vocabulary learning application based on vocabulary taken from a textbook.

The app should eventually allow a learner to study vocabulary cards containing:

- German word
- Article
- Plural form
- English meaning
- Part of speech
- Lesson number
- Book/page reference
- Emoji or another visual
- German pronunciation
- Example sentences
- English translations
- Previous / Next navigation
- Favorites
- Known / Unknown status
- Spaced repetition
- Lesson selection
- Later: PDF/photo vocabulary extraction

The current version is being built as a **web app first**, before deciding whether to create a native iOS version.

---

# 2. Current High-Level Architecture

The current app works approximately like this:

```text
German textbook
      ↓
Vocabulary extracted and cleaned
      ↓
ChatGPT generates structured lesson data
      ↓
JSON file
      ↓
Next.js web app
      ↓
React displays vocabulary cards
      ↓
Browser provides German pronunciation
      ↓
User studies vocabulary
```

The development workflow looks like this:

```text
MacBook
   ↓
VS Code
   ↓
Next.js / React / TypeScript
   ↓
Local development server
   ↓
localhost:3000
   ↓
Git tracks changes
   ↓
GitHub stores project history online
```

---

# 3. Node.js

## What is Node.js?

Node.js is a runtime that allows JavaScript to run outside of a browser.

Normally, JavaScript runs inside browsers such as Chrome or Safari.

Node.js lets development tools and servers run JavaScript directly on the computer.

## Why do we need it?

Our Next.js project depends on Node.js.

When we run:

```bash
npm run dev
```

Node.js is what actually runs the Next.js development server.

## In this project

Installed version:

```text
Node.js v26.13.0
```

Node.js is not the app itself.

It is the environment that lets our development tools run.

Think of it like:

```text
Node.js
   ↓
allows
   ↓
Next.js development tools to run
```

---

# 4. npm

## What is npm?

npm stands for:

```text
Node Package Manager
```

It manages JavaScript packages and libraries.

## Why do we need it?

Instead of manually downloading every dependency, npm installs and manages them automatically.

For example, our project uses packages such as:

- next
- react
- react-dom
- typescript
- tailwindcss
- eslint

npm keeps track of these in:

```text
package.json
```

and:

```text
package-lock.json
```

## Important commands

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Check npm version:

```bash
npm -v
```

Installed version:

```text
npm 11.20.0
```

---

# 5. Next.js

## What is Next.js?

Next.js is a framework built on top of React.

React handles the user interface.

Next.js gives the project structure and additional functionality.

## Why did we choose Next.js?

It gives us:

- a clean project structure
- React support
- routing
- TypeScript support
- fast local development
- easy future deployment
- easy access to public files
- good support for APIs later

## In this project

The main page currently lives at:

```text
src/app/page.tsx
```

The vocabulary JSON lives at:

```text
public/data/lektion_01_enriched.json
```

The app loads that JSON using:

```tsx
fetch("/data/lektion_01_enriched.json")
```

## Development server

When we run:

```bash
npm run dev
```

Next.js starts a local server.

The app becomes available at:

```text
http://localhost:3000
```

This is only running on the local computer.

It is not public on the internet yet.

---

# 6. React

## What is React?

React is a JavaScript library for building interactive user interfaces.

Instead of manually changing HTML every time something happens, React updates the page automatically based on state.

## Why do we need it?

Our vocabulary card needs to change when the learner:

- presses Next
- presses Previous
- changes lesson
- chooses an answer
- presses Listen
- marks a word as known
- later selects favorites

React handles this kind of interaction very well.

## Example from this project

We use:

```tsx
const [index, setIndex] = useState(0);
```

This stores the current vocabulary card number.

When the learner presses Next:

```tsx
setIndex((index + 1) % lessonData.vocabulary.length);
```

React automatically updates the displayed card.

So:

```text
User clicks Next
       ↓
index changes
       ↓
React notices
       ↓
new vocabulary word appears
```

---

# 7. TypeScript

## What is TypeScript?

TypeScript is JavaScript with type checking.

It helps detect mistakes before the code runs.

## Why did we use it?

Vocabulary data has a predictable structure.

For example:

```tsx
type VocabularyCard = {
  word: string;
  display: string;
  english: string;
  examples: Example[];
};
```

TypeScript checks whether our code uses these values correctly.

## Example of a real error we encountered

VS Code showed:

```text
'lessonData' is possibly 'null'
```

This happened because TypeScript correctly noticed that the lesson data might not have loaded yet.

We fixed it with:

```tsx
if (!lessonData) return;
```

This makes the code safer.

## Why this matters later

As the app grows, TypeScript will help prevent errors when we add:

- multiple lessons
- favorites
- review history
- spaced repetition
- user progress
- images
- categories

---

# 8. Tailwind CSS

## What is Tailwind CSS?

Tailwind is a CSS framework.

CSS controls how the app looks.

Instead of writing large CSS files, Tailwind lets us style components using small classes.

## Example

```tsx
<div className="bg-white rounded-3xl shadow-lg p-8">
```

This means:

```text
bg-white      → white background
rounded-3xl   → rounded corners
shadow-lg     → large shadow
p-8           → padding
```

## Why did we choose it?

It makes it very quick to experiment with the vocabulary card design.

That is useful because we are still deciding:

- card size
- visual style
- spacing
- typography
- mobile layout

---

# 9. VS Code

## What is VS Code?

Visual Studio Code is the editor used to write and manage the project.

## What we currently use it for

We use VS Code to:

- edit React code
- edit JSON files
- view errors
- run the terminal
- manage Git
- commit changes
- push changes to GitHub

## Important project files visible in VS Code

```text
german-vocab-app
├── public
├── src
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
└── AGENTS.md
```

---

# 10. JSON

## What is JSON?

JSON stands for:

```text
JavaScript Object Notation
```

It is a structured text format for storing data.

## Why do we use JSON?

The vocabulary content should be separate from the React interface.

Instead of writing vocabulary directly inside:

```text
page.tsx
```

we store lesson content inside:

```text
lektion_01_enriched.json
```

This is much cleaner.

## Example

```json
{
  "word": "Monat",
  "display": "der Monat",
  "english": "month",
  "plural": "Monate",
  "emoji": "📅",
  "examples": [
    {
      "de": "Der Monat hat vier Wochen.",
      "en": "The month has four weeks."
    }
  ]
}
```

## Why this architecture is important

React only needs to know:

```text
Load data
↓
Display data
```

The content is independent.

Later we can add:

```text
lektion_02_enriched.json
lektion_03_enriched.json
lektion_04_enriched.json
```

without rewriting the application.

---

# 11. Lesson Data Files

We created two main data concepts.

## Source data

```text
lektion_01_source.json
```

Purpose:

- preserve the original textbook vocabulary
- preserve page references
- preserve categories
- preserve grammar sections
- avoid mixing source material with generated content

## Enriched data

```text
lektion_01_enriched.json
```

Purpose:

- app-ready vocabulary
- article
- plural
- English meaning
- CEFR level
- example sentences
- translations
- TTS text
- visual metadata

We later added emoji support.

Example:

```json
{
  "word": "arbeiten",
  "display": "arbeiten",
  "english": "to work",
  "emoji": "💼"
}
```

---

# 12. Browser Speech Synthesis

## What is it?

Modern browsers can convert text into speech.

We use:

```javascript
SpeechSynthesisUtterance
```

## Why did we choose it?

We wanted German pronunciation without paying for an audio API.

The browser already has speech functionality.

## Example

```tsx
const speech = new SpeechSynthesisUtterance(word.tts_text);
speech.lang = "de-DE";
window.speechSynthesis.speak(speech);
```

## What this does

```text
der Monat
    ↓
browser speech system
    ↓
German pronunciation
```

## Advantages

- free
- simple
- no audio storage
- no cloud API
- no API key
- no extra server

## Limitation

The voice quality may differ depending on:

- browser
- operating system
- installed voices

Later we can use a dedicated TTS system if needed.

---

# 13. Wikimedia Commons API

## What is it?

Wikimedia Commons is a large repository of images.

It offers an API that software can search automatically.

## Why did we test it?

We originally wanted each vocabulary card to automatically search for a suitable picture.

Example:

```text
word: Straße
image_search: street road
       ↓
Wikimedia search
       ↓
candidate images
```

## What happened?

The API worked technically, but image relevance was inconsistent.

For example, a search could return:

- random locations
- historical images
- signs
- unrelated objects

The API was doing exactly what we asked, but it was not smart enough to understand which image would be best for language learning.

## Decision

We removed Wikimedia images as the primary visual system.

We may still use image search later for selected cards.

---

# 14. Emoji Visual System

## Why did we switch to emojis?

For A1 learning, consistency is more important than random photography.

Examples:

```text
arbeiten → 💼
Telefon → 📞
Straße → 🛣️
Geburtstag → 🎂
Student → 🎓
Deutschland → 🇩🇪
```

## Advantages

- instant
- free
- no API
- no loading
- no image search
- consistent style
- works offline
- stored directly in JSON

## Example

```json
{
  "word": "Telefon",
  "emoji": "📞"
}
```

React displays it using:

```tsx
{word.emoji || "📝"}
```

The pencil is the fallback when no emoji exists.

---

# 15. Git

## What is Git?

Git is a version control system.

It tracks changes made to the project.

## Why is it important?

Imagine we break the app tomorrow.

Git allows us to return to an earlier working version.

Git also creates a history of the project.

Example:

```text
Initial project
      ↓
Vocabulary card
      ↓
Pronunciation
      ↓
JSON integration
      ↓
Emoji visuals
```

Each step can be stored as a commit.

## Example commit messages used

```text
Build initial vocabulary card with navigation and pronunciation
```

```text
Load Lektion 1 vocabulary from JSON
```

```text
Replace image search with emoji visuals
```

## Good rule for commits

Commit when a meaningful working feature is completed.

Do not necessarily commit every single line change.

---

# 16. GitHub

## What is GitHub?

GitHub hosts Git repositories online.

Our repository is:

```text
https://github.com/Faislam05/german-vocab-app
```

## Why do we use it?

GitHub gives us:

- online backup
- version history
- easy access from another computer
- collaboration
- future deployment integration

## Important distinction

```text
Git = version control system
GitHub = website/service that hosts Git repositories
```

Git can work without GitHub.

GitHub uses Git.

---

# 17. Git Author Configuration

We also corrected the Git author information.

Current project author configuration was changed to the correct developer identity.

This matters because Git stores:

- author name
- author email
- timestamp
- commit message

inside every commit.

We also rewrote the original initial commit so the repository history correctly reflects the current developer.

---

# 18. Local Development Server

When we run:

```bash
npm run dev
```

Next.js starts a local development server.

Example:

```text
localhost:3000
```

## What does localhost mean?

`localhost` means:

```text
this computer
```

So:

```text
http://localhost:3000
```

means:

```text
open port 3000 on this Mac
```

The website is not public.

When the terminal running `npm run dev` is closed, the local server stops.

The code remains saved.

---

# 19. How to Reopen the Project

After shutting everything down:

1. Open VS Code.
2. Open:

```text
/Users/mohammedfaisalislam/german-vocab-app
```

3. Open a new terminal.
4. Run:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

The project will start again.

---

# 20. Current Project State

The app currently supports:

- Next.js project
- TypeScript
- Tailwind CSS
- real lesson JSON
- 107 Lektion 1 vocabulary cards
- Previous navigation
- Next navigation
- German pronunciation
- English meanings
- plural display where available
- example sentences
- English example translations
- emoji visuals
- Git version control
- GitHub repository

---

# 21. Current Vocabulary Flow

The app currently works like this:

```text
lektion_01_enriched.json
          ↓
Next.js fetch()
          ↓
React stores lessonData
          ↓
current index selected
          ↓
VocabularyCard displayed
          ↓
emoji
German word
English meaning
plural
examples
pronunciation
Previous / Next
```

---

# 22. Planned Features

The next likely development areas are:

## UI improvement

Make the vocabulary card feel more like a polished language-learning product.

Possible improvements:

- better typography
- progress bar
- cleaner navigation
- improved mobile layout
- larger visual
- category labels
- article color coding

## Lesson selection

Example:

```text
Lektion 1
Lektion 2
Lektion 3
```

## Vocabulary categories

Allow filtering:

```text
Verben
Nomen
Adjektive
Adverbien
Funktionswörter
```

## Favorites

Allow the learner to save difficult words.

Example:

```text
☆ → not favorite
★ → favorite
```

## Known / Unknown

Example:

```text
Again
Hard
Good
Easy
```

## Spaced repetition

Words answered incorrectly appear more often.

Words answered correctly appear less often.

## Progress storage

Eventually store:

```text
last reviewed
number of reviews
correct answers
incorrect answers
next review date
favorite
known
```

## Multiple lessons

Add files such as:

```text
lektion_02_enriched.json
lektion_03_enriched.json
...
```

## PDF / photo extraction

Later:

```text
Textbook page
      ↓
OCR
      ↓
Vocabulary extraction
      ↓
Review
      ↓
Generate lesson data
```

---

# 23. Possible Future Backend

Currently everything can work locally in the browser.

Later, if users need accounts and synchronization, we may introduce a backend.

Possible architecture:

```text
                Database
                   ↑
        ┌──────────┴──────────┐
        │                     │
     Web App               iOS App
```

Possible technologies later:

- Supabase
- PostgreSQL
- authentication
- cloud storage
- API routes

This is not required yet.

---

# 24. Possible Future iOS App

The original idea was an iOS app.

We decided to build the web version first because it is faster to:

- prototype
- test
- redesign
- debug
- validate the learning experience

Later the same data can be reused.

Example:

```text
             Lesson Data
                 ↑
        ┌────────┴────────┐
        │                 │
     Web App           iOS App
```

The iOS version could eventually use:

- Swift
- SwiftUI
- SwiftData
- AVSpeechSynthesizer

---

# 25. Why Web First Was Chosen

The difficult part of this project is not specifically iOS.

The difficult parts are:

- vocabulary data
- learning experience
- visuals
- pronunciation
- study logic
- spaced repetition
- lesson organization

A web app lets us solve these problems quickly.

Once the product design works, building an iOS version becomes much easier.

---

# 26. Current Folder Structure

A simplified version of the project currently looks like this:

```text
german-vocab-app
│
├── public
│   └── data
│       └── lektion_01_enriched.json
│
├── src
│   └── app
│       ├── page.tsx
│       ├── layout.tsx
│       └── globals.css
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── AGENTS.md
└── .gitignore
```

---

# 27. What Each Important File Does

## `src/app/page.tsx`

Main vocabulary interface.

Currently responsible for:

- loading JSON
- selecting current word
- displaying word
- showing meaning
- showing examples
- pronunciation
- navigation
- emoji visual

---

## `src/app/globals.css`

Global styles.

Tailwind and global CSS behavior are controlled here.

---

## `public/data/lektion_01_enriched.json`

Contains the actual vocabulary content.

The browser can access it at:

```text
/data/lektion_01_enriched.json
```

---

## `package.json`

Defines:

- project name
- scripts
- dependencies
- development dependencies

Example script:

```json
"dev": "next dev"
```

This is why:

```bash
npm run dev
```

starts Next.js.

---

## `package-lock.json`

Locks exact dependency versions.

This helps ensure that another computer installs the same dependency versions.

---

## `tsconfig.json`

TypeScript configuration.

---

## `.gitignore`

Tells Git which files should not be committed.

For example:

```text
node_modules
.next
```

These folders are generated automatically and do not belong in GitHub.

---

# 28. Key Design Principle

The most important architectural choice so far is:

```text
CONTENT ≠ INTERFACE
```

Vocabulary content lives in JSON.

The interface lives in React.

This means:

```text
Change vocabulary
→ no major UI rewrite

Change design
→ no need to rewrite vocabulary
```

This separation will make the project much easier to maintain.

---

# 29. Summary

The current technology stack is:

```text
Node.js
   ↓
npm
   ↓
Next.js
   ↓
React
   ↓
TypeScript
   ↓
Tailwind CSS
   ↓
JSON lesson data
   ↓
Browser Speech Synthesis
   ↓
Git
   ↓
GitHub
```

Each tool has a specific role.

The app is already data-driven rather than being a simple hardcoded prototype.

That is an important milestone because future lessons and features can now be added without rebuilding the whole application.
