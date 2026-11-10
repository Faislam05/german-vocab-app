"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LESSON_FILE,
  LessonData,
  StudyStatus,
  loadStudyStatus,
} from "@/lib/vocabulary";

// The Home screen: lesson overview + choose what to study.
// The flashcards themselves live on the Study screen (src/app/study/).
export default function Home() {
  const [lessonData, setLessonData] = useState<LessonData | null>(null);

  const [studyStatus] = useState<StudyStatus>(loadStudyStatus);

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

  if (!lessonData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  const totalCount = lessonData.vocabulary.length;

  const knownCount = lessonData.vocabulary.filter(
    (item) => studyStatus[item.word] === "known"
  ).length;

  const learningCount = totalCount - knownCount;

  const knownPercent = Math.round((knownCount / totalCount) * 100);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-8 w-full max-w-md">
        {/* Lesson header */}

        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🇩🇪</div>

          <p className="text-sm text-gray-500 mb-1">
            Lektion {lessonData.lesson} · {lessonData.cefr}
          </p>

          <h1 className="text-2xl font-bold">{lessonData.title}</h1>
        </div>

        {/* Lesson progress */}

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Known</span>
            <span>{knownPercent}%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${knownPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8 text-sm">
          <span className="px-3 py-1 rounded-full bg-gray-100">
            Learning: {learningCount}
          </span>

          <span className="px-3 py-1 rounded-full bg-gray-100">
            Known: {knownCount}
          </span>
        </div>

        {/* What to study */}

        <div className="space-y-3">
          <Link
            href="/study?filter=learning"
            className="block w-full text-center px-5 py-3 rounded-full bg-black text-white hover:bg-gray-800"
          >
            Study Learning words ({learningCount})
          </Link>

          <Link
            href="/study?filter=all"
            className="block w-full text-center px-5 py-3 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            Study all words ({totalCount})
          </Link>

          <Link
            href="/study?filter=known"
            className="block w-full text-center px-5 py-3 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            Review Known words ({knownCount})
          </Link>
        </div>

        {/* Keyboard hint */}

        <p className="text-xs text-gray-400 text-center mt-6">
          While studying: Space = show meaning, ← → = previous / next
        </p>
      </div>
    </main>
  );
}
