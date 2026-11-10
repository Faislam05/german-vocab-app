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
  image_search: string | null;
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

// The list of all chapters of the book. To add a lesson: put its JSON
// file in public/data/ and set "file" in its lessons.json entry — no code
// change needed. Chapters with "file": null are shown as "not added yet".
export const LESSON_INDEX_FILE = "/data/lessons.json";

export type LessonIndexEntry = {
  lesson: number;
  title: string; // "Lektion 2"
  chapter: string; // German chapter title, "Gegenstände in Haus und Haushalt"
  chapter_en: string; // English meaning, "Objects in the Home"
  file: string | null; // file name inside public/data/, or null = not added yet
};

// What the user chose to study: one lesson number, or "all" lessons.
export type LessonChoice = number | "all";

// Turns a value from the URL or localStorage (e.g. "2" or "all") into a
// LessonChoice. Anything unknown means "all".
export function parseLessonChoice(
  value: string | null,
  lessons: LessonData[]
): LessonChoice {
  const number = Number(value);

  return lessons.some((lesson) => lesson.lesson === number) ? number : "all";
}

// Returns the title and words for the chosen lesson, or all lessons
// combined (in lesson order).
export function selectLesson(lessons: LessonData[], choice: LessonChoice) {
  if (choice === "all") {
    return {
      title: "All lessons",
      vocabulary: lessons.flatMap((lesson) => lesson.vocabulary),
    };
  }

  const lesson = lessons.find((item) => item.lesson === choice);

  return {
    title: lesson?.title ?? "All lessons",
    vocabulary: lesson?.vocabulary ?? [],
  };
}

// How many words of a list are marked Mastered.
export function countMastered(
  vocabulary: VocabularyCard[],
  studyStatus: StudyStatus
) {
  return vocabulary.filter((item) => studyStatus[item.word] === "mastered")
    .length;
}

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

// localStorage key for the last study session, used by the "Continue"
// card on Home. It stores the Study screen's settings exactly as they
// appear in its URL, e.g. "lesson=2&filter=learning&direction=de-en".
const LAST_STUDY_KEY = "lastStudy";

export function loadLastStudy(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(LAST_STUDY_KEY);
  } catch {
    return null;
  }
}

export function saveLastStudy(settings: string) {
  try {
    localStorage.setItem(LAST_STUDY_KEY, settings);
  } catch (error) {
    console.error("Could not save last study session:", error);
  }
}

// Turns a word type like "verb" into its name for people: "Verbs".
export function wordTypeName(wordType: WordType) {
  return WORD_TYPE_NAMES[wordType] ?? formatPartOfSpeech(wordType);
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

// ---------------------------------------------------------------------------
// Word types (part of speech), used by the "Word type" dropdown on Home
// ---------------------------------------------------------------------------

// The word types in the order they appear in the dropdown, with the
// name shown to the user. Matches the "Part of Speech Labels" table
// in PROJECT_CONTEXT.md.
const WORD_TYPE_NAMES: Record<string, string> = {
  noun: "Nouns",
  verb: "Verbs",
  adjective: "Adjectives",
  adverb: "Adverbs",
  question_word: "Question words",
  preposition: "Prepositions",
  conjunction: "Conjunctions",
  possessive: "Possessives",
  pronoun: "Pronouns",
  particle: "Particles",
};

// "all" = every word type, otherwise a part_of_speech value like "verb"
export type WordType = string;

// The word types that exist in a list of words, with how many words each
// has, e.g. [{ type: "noun", name: "Nouns", count: 43 }, ...].
// Types with no words are left out.
export function wordTypesIn(vocabulary: VocabularyCard[]) {
  const counts: Record<string, number> = {};

  for (const item of vocabulary) {
    counts[item.part_of_speech] = (counts[item.part_of_speech] ?? 0) + 1;
  }

  const knownOrder = Object.keys(WORD_TYPE_NAMES);
  const types = Object.keys(counts).sort(
    (a, b) =>
      (knownOrder.indexOf(a) + 1 || 99) - (knownOrder.indexOf(b) + 1 || 99)
  );

  return types.map((type) => ({
    type,
    name: wordTypeName(type),
    count: counts[type],
  }));
}

// Returns only the words of one word type ("all" returns every word).
export function filterByWordType(
  vocabulary: VocabularyCard[],
  wordType: WordType
) {
  if (wordType === "all") return vocabulary;

  return vocabulary.filter((item) => item.part_of_speech === wordType);
}
