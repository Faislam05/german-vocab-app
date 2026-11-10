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

export type StudyFilter = "all" | "learning" | "known";

// Maps a vocabulary word to "learning" or "known".
// Words that are missing count as "learning".
export type StudyStatus = Record<string, string>;

// The lesson file currently used by the app.
export const LESSON_FILE = "/data/lektion_01_enriched_with_emojis.json";

// localStorage key for the user's Learning / Known progress.
const STUDY_STATUS_KEY = "studyStatus";

export function loadStudyStatus(): StudyStatus {
  if (typeof window === "undefined") return {};

  const savedStatus = localStorage.getItem(STUDY_STATUS_KEY);

  return savedStatus ? JSON.parse(savedStatus) : {};
}

export function saveStudyStatus(status: StudyStatus) {
  localStorage.setItem(STUDY_STATUS_KEY, JSON.stringify(status));
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
    return vocabulary.filter((item) => studyStatus[item.word] !== "known");
  }

  if (filter === "known") {
    return vocabulary.filter((item) => studyStatus[item.word] === "known");
  }

  return vocabulary;
}
