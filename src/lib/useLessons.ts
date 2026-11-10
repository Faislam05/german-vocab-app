import { useEffect, useState } from "react";
import { LESSON_FILE, LessonData } from "@/lib/vocabulary";

// Loads the lesson JSON once and returns it.
// Returns null while the file is still loading (or if loading failed).
//
// A function whose name starts with "use" and that calls React hooks
// is called a "custom hook". Both the Home and Study screens use this
// one, so the fetch code lives in one place.
export function useLessonData(): LessonData | null {
  const [lessonData, setLessonData] = useState<LessonData | null>(null);

  useEffect(() => {
    fetch(LESSON_FILE)
      .then((response) => response.json())
      .then((data) => {
        setLessonData(data);
      })
      .catch((error) => {
        console.error("Error loading lesson data:", error);
      });
  }, []);

  return lessonData;
}
