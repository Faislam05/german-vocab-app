// Shared vocabulary types and helpers, used by both the Home
// screen (src/app/page.tsx) and the Study screen (src/app/study/).

export type Example = {
  de: string;
  en: string;
};

export type VocabularyCard = {
  word: string;
  display: string;
  part_of_speech: string;
  english: string;
  cefr: string;
  lesson: number;
  references: number[];
  tts_text: string;
  image_search: string;
  emoji?: string;
  examples: Example[];
  article?: string;
  gender?: string;
  plural?: string;
};

export type LessonData = {
  lesson: number;
  title: string;
  cefr: string;
  vocabulary: VocabularyCard[];
};

export type StudyFilter = "all" | "learning" | "mastered";

// Which way the flashcards are asked:
// "de-en" = see German, recall English (default)
// "en-de" = see English, recall German (with article)
export type StudyDirection = "de-en" | "en-de";

// Maps a vocabulary word to "learning" or "mastered".
// Words that are missing count as "learning".
export type StudyStatus = Record<string, string>;

// The lesson file currently used by the app.
export const LESSON_FILE = "/data/lektion_01_enriched_with_emojis.json";

// localStorage key for the user's Learning / Mastered progress.
const STUDY_STATUS_KEY = "studyStatus";

// Note on try/catch below: reading or writing localStorage can fail,
// for example if the saved data is broken or the browser blocks storage
// (some private-browsing modes). Instead of crashing the page, we fall
// back to "nothing saved" and log the problem.

export function loadStudyStatus(): StudyStatus {
  if (typeof window === "undefined") return {};

  try {
    const savedStatus = localStorage.getItem(STUDY_STATUS_KEY);
    const parsed = savedStatus ? JSON.parse(savedStatus) : {};

    // Only accept a plain object like { "arbeiten": "mastered" }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return migrateStudyStatus(parsed);
  } catch (error) {
    console.error("Could not read saved study status:", error);
    return {};
  }
}

// One-time conversion of older saved progress.
// "Mastered" used to be called "Known" and was saved as "known".
// Any "known" values are changed to "mastered" and saved back, so old
// progress keeps working. Once converted, this does nothing.
function migrateStudyStatus(status: StudyStatus): StudyStatus {
  let changed = false;
  const migrated: StudyStatus = {};

  for (const [word, value] of Object.entries(status)) {
    if (value === "known") {
      migrated[word] = "mastered";
      changed = true;
    } else {
      migrated[word] = value;
    }
  }

  if (changed) {
    saveStudyStatus(migrated);
  }

  return migrated;
}

export function saveStudyStatus(status: StudyStatus) {
  try {
    localStorage.setItem(STUDY_STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    console.error("Could not save study status:", error);
  }
}

// localStorage key for the last chosen study direction, so the Home
// screen remembers it.
const STUDY_DIRECTION_KEY = "studyDirection";

export function loadStudyDirection(): StudyDirection {
  if (typeof window === "undefined") return "de-en";

  try {
    return localStorage.getItem(STUDY_DIRECTION_KEY) === "en-de"
      ? "en-de"
      : "de-en";
  } catch {
    return "de-en";
  }
}

export function saveStudyDirection(direction: StudyDirection) {
  try {
    localStorage.setItem(STUDY_DIRECTION_KEY, direction);
  } catch (error) {
    console.error("Could not save study direction:", error);
  }
}

// Turns "proper_noun" into "Proper Noun" for the part-of-speech badge.
export function formatPartOfSpeech(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// Returns a shuffled copy of a list (the original list is not changed).
// Uses the Fisher–Yates shuffle, which gives every order an equal chance.
export function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// Returns only the words that match the chosen filter.
export function filterVocabulary(
  vocabulary: VocabularyCard[],
  studyStatus: StudyStatus,
  filter: StudyFilter
) {
  if (filter === "learning") {
    return vocabulary.filter((item) => studyStatus[item.word] !== "mastered");
  }

  if (filter === "mastered") {
    return vocabulary.filter((item) => studyStatus[item.word] === "mastered");
  }

  return vocabulary;
}
