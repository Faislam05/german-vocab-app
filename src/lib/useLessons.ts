import { useEffect, useState } from "react";
import {
  LESSON_INDEX_FILE,
  LessonData,
  LessonIndexEntry,
} from "@/lib/vocabulary";

// Loads every lesson listed in public/data/lessons.json and returns them
// in lesson order. Returns null while loading (or if loading failed).
//
// A function whose name starts with "use" and that calls React hooks
// is called a "custom hook". Both the Home and Study screens use this
// one, so the loading code lives in one place.
export function useLessons(): LessonData[] | null {
  const [lessons, setLessons] = useState<LessonData[] | null>(null);

  useEffect(() => {
    async function loadLessons() {
      // 1. Read the list of lessons
      const indexResponse = await fetch(LESSON_INDEX_FILE);
      const index: { lessons: LessonIndexEntry[] } = await indexResponse.json();

      // 2. Load all lesson files at the same time
      const loaded = await Promise.all(
        index.lessons.map(async (entry) => {
          const response = await fetch(`/data/${entry.file}`);
          return (await response.json()) as LessonData;
        })
      );

      setLessons(loaded.sort((a, b) => a.lesson - b.lesson));
    }

    loadLessons().catch((error) => {
      console.error("Error loading lessons:", error);
    });
  }, []);

  return lessons;
}
