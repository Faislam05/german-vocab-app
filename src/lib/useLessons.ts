import { useEffect, useState } from "react";
import {
  LESSON_INDEX_FILE,
  LessonData,
  LessonIndexEntry,
} from "@/lib/vocabulary";

// The whole book:
// - chapters: all chapters listed in lessons.json (also the ones not
//   added yet, which have "file": null), in lesson order
// - lessons: the vocabulary of the lessons that are added, in lesson order
export type Book = {
  chapters: LessonIndexEntry[];
  lessons: LessonData[];
};

// Loads public/data/lessons.json and every lesson file listed in it.
// Returns null while loading (or if loading failed).
//
// A function whose name starts with "use" and that calls React hooks
// is called a "custom hook". All screens use this one, so the loading
// code lives in one place.
export function useBook(): Book | null {
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    async function loadBook() {
      // 1. Read the list of chapters
      const indexResponse = await fetch(LESSON_INDEX_FILE);
      const index: { lessons: LessonIndexEntry[] } = await indexResponse.json();

      const chapters = [...index.lessons].sort((a, b) => a.lesson - b.lesson);

      // 2. Load the lesson files that exist, all at the same time
      const lessons = await Promise.all(
        chapters
          .filter((entry) => entry.file)
          .map(async (entry) => {
            const response = await fetch(`/data/${entry.file}`);
            return (await response.json()) as LessonData;
          })
      );

      setBook({ chapters, lessons });
    }

    loadBook().catch((error) => {
      console.error("Error loading lessons:", error);
    });
  }, []);

  return book;
}

// Only the added lessons (for screens that don't need chapter titles).
export function useLessons(): LessonData[] | null {
  return useBook()?.lessons ?? null;
}
