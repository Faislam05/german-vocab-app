// Your German level (A1 to C2). Chosen once on the Welcome screen
// (/welcome) and remembered in localStorage, so the app opens straight
// on Home after that. Only A1 has words so far; the others are shown as
// "Coming soon".

export const LEVELS = [
  { id: "A1", name: "Beginner", text: "Your first words and phrases", ready: true },
  { id: "A2", name: "Elementary", text: "Everyday situations", ready: false },
  { id: "B1", name: "Intermediate", text: "Talk about work, travel, plans", ready: false },
  { id: "B2", name: "Upper intermediate", text: "Discuss and explain", ready: false },
  { id: "C1", name: "Advanced", text: "Fluent and precise", ready: false },
  { id: "C2", name: "Proficient", text: "Almost like a native speaker", ready: false },
] as const;

export type LevelId = (typeof LEVELS)[number]["id"];

const LEVEL_KEY = "level";

// Keys that show someone has used the app before (from before the
// Welcome screen existed). They skip the Welcome screen and get A1.
const PROGRESS_KEYS = ["studyStatus", "reviewCards", "lastStudy"];

// The saved level, or null if none has been chosen yet
export function loadLevel(): LevelId | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(LEVEL_KEY);
    if (LEVELS.some((level) => level.id === saved)) return saved as LevelId;

    // Used the app before the Welcome screen existed: keep going with A1
    if (PROGRESS_KEYS.some((key) => localStorage.getItem(key))) {
      saveLevel("A1");
      return "A1";
    }
  } catch {
    // localStorage blocked: fall through
  }
  return null;
}

export function saveLevel(level: LevelId) {
  try {
    localStorage.setItem(LEVEL_KEY, level);
  } catch {
    // localStorage blocked: the choice just isn't remembered
  }
}
