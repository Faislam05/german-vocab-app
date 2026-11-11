// Daily review: learn a few new words every day and review older words
// just before you would forget them.
//
// It uses the Leitner box system (the classic "Karteikasten" method):
// every word sits in one of 5 boxes. "Got it" moves a word one box up,
// so it comes back later; "Again" sends it back to box 1, so it comes
// back tomorrow.
//
// Everything is saved in localStorage. It is connected to the
// Learning / Mastered labels of the Study screen:
// - a word that reaches box 5 becomes Mastered
// - answering "Again" on a Mastered word sets it back to Learning

import {
  VocabularyCard,
  loadStudyStatus,
  saveStudyStatus,
} from "@/lib/vocabulary";

// How many new words to learn per day (a setting can be added later)
export const DAILY_NEW_WORDS = 10;

// Days until a word comes back, for box 1, 2, 3, 4 and 5
const BOX_INTERVALS = [1, 2, 4, 8, 16];

// Reaching this box makes a word Mastered (4 correct reviews in a row,
// spread over about 2 weeks)
const MASTERED_BOX = 5;

// On days with many reviews (e.g. after missing a few days) there are
// fewer new words, so a session never gets too long.
function newWordsForToday(reviewsDue: number) {
  if (reviewsDue >= 40) return 0;
  if (reviewsDue >= 20) return 5;
  return DAILY_NEW_WORDS;
}

// ---------------------------------------------------------------------------
// Dates. Saved as "2026-11-11" in the local time zone, so a "day" is your
// day, not the UTC day.
// ---------------------------------------------------------------------------

export function todayString(): string {
  return dateString(new Date());
}

function dateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dayString: string, days: number): string {
  const [year, month, day] = dayString.split("-").map(Number);
  return dateString(new Date(year, month - 1, day + days));
}

// ---------------------------------------------------------------------------
// Saved data
// ---------------------------------------------------------------------------

// Where each learned word is: its box (1–5) and the day it is due again.
// Words that are not in here have not been learned yet.
export type ReviewCards = Record<string, { box: number; due: string }>;

// Today's plan, so the same new words are used all day (even after
// closing the app).
export type TodayPlan = {
  date: string;
  newWords: string[]; // the words to learn today, in book order
};

// One entry per day, for the streak and stats planned for later.
export type StudyLog = Record<string, { reviewed: number; learned: number }>;

const REVIEW_CARDS_KEY = "reviewCards";
const TODAY_PLAN_KEY = "reviewToday";
const STUDY_LOG_KEY = "studyLog";

// Reads a saved object; anything broken or missing gives `fallback`.
function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed && typeof parsed === "object" ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save ${key}:`, error);
  }
}

export function loadReviewCards(): ReviewCards {
  return load<ReviewCards>(REVIEW_CARDS_KEY, {});
}

export function loadStudyLog(): StudyLog {
  return load<StudyLog>(STUDY_LOG_KEY, {});
}

// Adds to today's numbers in the study log.
function addToLog(field: "reviewed" | "learned") {
  const log = loadStudyLog();
  const today = todayString();
  const entry = log[today] ?? { reviewed: 0, learned: 0 };
  log[today] = { ...entry, [field]: entry[field] + 1 };
  save(STUDY_LOG_KEY, log);
}

// ---------------------------------------------------------------------------
// Today's work
// ---------------------------------------------------------------------------

// Learned words that are due today (or were due earlier and were missed),
// oldest first, then in book order.
export function dueWords(
  allWords: VocabularyCard[],
  cards: ReviewCards
): VocabularyCard[] {
  const today = todayString();

  return allWords
    .filter((word) => cards[word.word] && cards[word.word].due <= today)
    .sort((a, b) => cards[a.word].due.localeCompare(cards[b.word].due));
}

// The next words that have never been learned, in book order.
function nextNewWords(
  allWords: VocabularyCard[],
  cards: ReviewCards,
  count: number,
  skip: string[] = []
): string[] {
  return allWords
    .filter((word) => !cards[word.word] && !skip.includes(word.word))
    .slice(0, count)
    .map((word) => word.word);
}

// Today's plan. If there is none for today yet, it is made now:
// the next new words in book order (fewer on heavy review days).
// With shouldSave = false it only previews the plan (used by the Home screen).
export function getTodayPlan(
  allWords: VocabularyCard[],
  cards: ReviewCards,
  shouldSave = true
): TodayPlan {
  const today = todayString();
  const saved = load<TodayPlan | null>(TODAY_PLAN_KEY, null);

  if (saved && saved.date === today && Array.isArray(saved.newWords)) {
    return saved;
  }

  const count = newWordsForToday(dueWords(allWords, cards).length);
  const plan = { date: today, newWords: nextNewWords(allWords, cards, count) };

  if (shouldSave) save(TODAY_PLAN_KEY, plan);
  return plan;
}

// "Learn 10 more": adds the next new words to today's plan.
export function addMoreNewWords(
  allWords: VocabularyCard[],
  cards: ReviewCards
): TodayPlan {
  const plan = getTodayPlan(allWords, cards);
  const more = nextNewWords(allWords, cards, DAILY_NEW_WORDS, plan.newWords);
  const updated = { ...plan, newWords: [...plan.newWords, ...more] };

  save(TODAY_PLAN_KEY, updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

// A review word was answered for the first time today.
// Got it → one box up (max 5); Again → back to box 1. Either way it is
// saved with its next due day.
export function answerReview(word: string, gotIt: boolean): ReviewCards {
  const cards = loadReviewCards();
  const box = gotIt ? Math.min((cards[word]?.box ?? 1) + 1, 5) : 1;

  cards[word] = { box, due: addDays(todayString(), BOX_INTERVALS[box - 1]) };
  save(REVIEW_CARDS_KEY, cards);
  addToLog("reviewed");

  if (box === MASTERED_BOX) setMastered(word, true);

  return cards;
}

// "Again" on any word: if it was Mastered, it goes back to Learning,
// because forgetting it means it isn't mastered yet.
export function forgotWord(word: string) {
  setMastered(word, false);
}

// Updates the Learning / Mastered label used by the Study screen.
function setMastered(word: string, mastered: boolean) {
  const status = loadStudyStatus();
  const isMastered = status[word] === "mastered";

  if (mastered === isMastered) return; // nothing to change

  saveStudyStatus({ ...status, [word]: mastered ? "mastered" : "learning" });
}

// A new word was answered "Got it" for the first time: it is learned and
// goes into box 1, so it comes back tomorrow.
export function learnNewWord(word: string): ReviewCards {
  const cards = loadReviewCards();

  cards[word] = { box: 1, due: addDays(todayString(), BOX_INTERVALS[0]) };
  save(REVIEW_CARDS_KEY, cards);
  addToLog("learned");

  return cards;
}
