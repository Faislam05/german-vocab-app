// First-time hints ("tips"): small bubbles that explain a feature the
// first time you see it. Each hint is shown once; after "Got it" it is
// remembered in localStorage and never shown again. "Skip all tips"
// turns them all off. "Show tips again" (on Home) brings them back.

import { useState } from "react";

// Every hint, with its text. The id is what gets saved.
export const HINTS = {
  "home-today": {
    text: "Start here: learn 10 new words a day, and repeat older words just before you would forget them.",
  },
  "home-lessons": {
    text: "Or open a lesson to study it your way: by word type, by direction, or only the words you're still learning.",
  },
  "lesson-types": {
    text: "Study just one kind of word, e.g. only verbs. “All” studies every word of the lesson.",
  },
  "lesson-buttons": {
    text: [
      "Learning words: the ones you haven't mastered yet, to test yourself.",
      "All words: every word of the lesson, answers shown, to read through.",
      "Mastered words: check you still know the ones you've mastered.",
    ],
  },
  "study-flashcard": {
    text: "Flashcard on hides the answer so you can test yourself. Tap “Show meaning” (or press Space) to check.",
  },
  "study-mastered": {
    text: "Know this word well? Tap the star to mark it as Mastered. Tap it again to set it back to Learning.",
  },
  "review-answer": {
    text: "Be honest: “Again” brings the word back tomorrow, “Got it” moves it further away.",
  },
} as const;

export type HintId = keyof typeof HINTS;

const SEEN_KEY = "seenHints"; // list of hint ids already seen
const SKIPPED_KEY = "hintsSkipped"; // "true" after "Skip all tips"

function loadSeen(): HintId[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadSkipped(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SKIPPED_KEY) === "true";
  } catch {
    return false;
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Could not save ${key}:`, error);
  }
}

// Have any tips been seen or skipped? (Used for "Show tips again".)
export function anyHintsSeen() {
  return loadSkipped() || loadSeen().length > 0;
}

// Brings all tips back.
export function resetHints() {
  try {
    localStorage.removeItem(SEEN_KEY);
    localStorage.removeItem(SKIPPED_KEY);
  } catch (error) {
    console.error("Could not reset tips:", error);
  }
}

// For one screen: which hint to show now (at most one at a time).
// `candidates` are this screen's hints in order, each with `ready`:
// whether the thing it points at is on screen right now (e.g. the
// Mastered button only appears once the answer is shown).
export function useHints(candidates: { id: HintId; ready: boolean }[]) {
  const [seen, setSeen] = useState<HintId[]>(loadSeen);
  const [skipped, setSkipped] = useState<boolean>(loadSkipped);

  const current = skipped
    ? null
    : (candidates.find((hint) => hint.ready && !seen.includes(hint.id))
        ?.id ?? null);

  function dismiss(id: HintId) {
    const updated = [...seen, id];
    setSeen(updated);
    save(SEEN_KEY, JSON.stringify(updated));
  }

  function skipAll() {
    setSkipped(true);
    save(SKIPPED_KEY, "true");
  }

  return { current, dismiss, skipAll };
}
