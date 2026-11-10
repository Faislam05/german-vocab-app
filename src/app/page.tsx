"use client";

import Link from "next/link";
import { useState } from "react";
import { useLessonData } from "@/lib/useLessonData";
import {
  StudyDirection,
  StudyStatus,
  loadStudyDirection,
  loadStudyStatus,
  saveStudyDirection,
} from "@/lib/vocabulary";

// The Home screen: lesson overview + choose what to study.
// The flashcards themselves live on the Study screen (src/app/study/).
export default function Home() {
  const lessonData = useLessonData();

  const [studyStatus] = useState<StudyStatus>(loadStudyStatus);

  // German → English or English → German (remembered in localStorage)
  const [direction, setDirection] =
    useState<StudyDirection>(loadStudyDirection);

  function chooseDirection(newDirection: StudyDirection) {
    setDirection(newDirection);
    saveStudyDirection(newDirection);
  }

  if (!lessonData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  const totalCount = lessonData.vocabulary.length;

  const masteredCount = lessonData.vocabulary.filter(
    (item) => studyStatus[item.word] === "mastered"
  ).length;

  const learningCount = totalCount - masteredCount;

  const masteredPercent = Math.round((masteredCount / totalCount) * 100);

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
            <span>Mastered</span>
            <span>{masteredPercent}%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${masteredPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8 text-sm">
          <span className="px-3 py-1 rounded-full bg-gray-100">
            Learning: {learningCount}
          </span>

          <span className="px-3 py-1 rounded-full bg-gray-100">
            Mastered: {masteredCount}
          </span>
        </div>

        {/* Direction */}

        <div className="flex justify-center gap-2 mb-4 text-sm">
          <button
            onClick={() => chooseDirection("de-en")}
            className={`px-4 py-1 rounded-full ${
              direction === "de-en" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            🇩🇪 → 🇬🇧
          </button>

          <button
            onClick={() => chooseDirection("en-de")}
            className={`px-4 py-1 rounded-full ${
              direction === "en-de" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            🇬🇧 → 🇩🇪
          </button>
        </div>

        {/* What to study */}

        <div className="space-y-3">
          <Link
            href={`/study?filter=learning&direction=${direction}`}
            className="block w-full text-center px-5 py-3 rounded-full bg-black text-white hover:bg-gray-800"
          >
            Study Learning words ({learningCount})
          </Link>

          <Link
            href={`/study?filter=all&direction=${direction}`}
            className="block w-full text-center px-5 py-3 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            Study all words ({totalCount})
          </Link>

          <Link
            href={`/study?filter=mastered&direction=${direction}`}
            className="block w-full text-center px-5 py-3 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            Review Mastered words ({masteredCount})
          </Link>
        </div>

        {/* Keyboard hint */}

        <p className="text-xs text-gray-400 text-center mt-6">
          While studying: Space = reveal answer, ← → = previous / next
        </p>
      </div>
    </main>
  );
}
