"use client";

import Link from "next/link";
import { useState } from "react";
import { useLessons } from "@/lib/useLessons";
import {
  LessonChoice,
  StudyDirection,
  StudyStatus,
  WordType,
  countMastered,
  filterByWordType,
  loadLessonChoiceText,
  loadStudyDirection,
  loadStudyStatus,
  parseLessonChoice,
  saveLessonChoice,
  saveStudyDirection,
  selectLesson,
  wordTypesIn,
} from "@/lib/vocabulary";

// The Home screen: choose a lesson, see its progress, choose what to study.
// The flashcards themselves live on the Study screen (src/app/study/).
export default function Home() {
  const lessons = useLessons();

  const [studyStatus] = useState<StudyStatus>(loadStudyStatus);

  // German → English or English → German (remembered in localStorage)
  const [direction, setDirection] =
    useState<StudyDirection>(loadStudyDirection);

  // The lesson last chosen, as saved text ("2", "all", or nothing yet).
  // It is turned into a real choice below, once the lessons are loaded.
  const [lessonChoiceText, setLessonChoiceText] = useState<string | null>(
    loadLessonChoiceText
  );

  // Word type chosen in the dropdown ("all" or e.g. "verb").
  // Not saved on purpose: it starts at "All types" every visit, so a
  // forgotten filter never hides words.
  const [wordTypeChoice, setWordTypeChoice] = useState<WordType>("all");

  function chooseDirection(newDirection: StudyDirection) {
    setDirection(newDirection);
    saveStudyDirection(newDirection);
  }

  function chooseLesson(choice: LessonChoice) {
    setLessonChoiceText(String(choice));
    saveLessonChoice(choice);
  }

  if (!lessons) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  // Nothing chosen yet → start with the first lesson
  const lessonChoice = parseLessonChoice(
    lessonChoiceText ?? String(lessons[0]?.lesson),
    lessons
  );

  const { title, vocabulary } = selectLesson(lessons, lessonChoice);

  // Percentage of a word list that is Mastered (0 for an empty list)
  function percentMastered(words: typeof vocabulary) {
    if (words.length === 0) return 0;
    return Math.round((countMastered(words, studyStatus) / words.length) * 100);
  }

  // Word types that exist in the chosen lesson (for the dropdown).
  // If the chosen type isn't in this lesson (e.g. after switching lesson),
  // fall back to "All types".
  const wordTypes = wordTypesIn(vocabulary);
  const wordType = wordTypes.some((item) => item.type === wordTypeChoice)
    ? wordTypeChoice
    : "all";

  // The words that will be studied: chosen lesson + chosen word type
  const studyWords = filterByWordType(vocabulary, wordType);

  const totalCount = studyWords.length;
  const masteredCount = countMastered(studyWords, studyStatus);
  const learningCount = totalCount - masteredCount;
  const masteredPercent = percentMastered(studyWords);

  // Every study link carries the lesson, filter, direction and word type
  function studyLink(filter: string) {
    const typePart = wordType === "all" ? "" : `&type=${wordType}`;
    return `/study?lesson=${lessonChoice}&filter=${filter}&direction=${direction}${typePart}`;
  }

  // One button per lesson, plus "All"
  const lessonButtons: { choice: LessonChoice; label: string; percent: number }[] = [
    ...lessons.map((lesson) => ({
      choice: lesson.lesson as LessonChoice,
      label: `Lektion ${lesson.lesson}`,
      percent: percentMastered(lesson.vocabulary),
    })),
    {
      choice: "all",
      label: "All",
      percent: percentMastered(selectLesson(lessons, "all").vocabulary),
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-6 sm:p-8 w-full max-w-md">
        {/* Header */}

        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🇩🇪</div>

          <p className="text-sm text-gray-500 mb-1">
            A1 · {vocabulary.length} words
          </p>

          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        {/* Lesson picker: one button per lesson, with its Mastered % */}

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {lessonButtons.map((button) => (
            <button
              key={String(button.choice)}
              onClick={() => chooseLesson(button.choice)}
              className={`px-3 py-1.5 rounded-2xl text-sm leading-tight ${
                lessonChoice === button.choice
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {button.label}
              <span
                className={`block text-xs ${
                  lessonChoice === button.choice
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {button.percent}%
              </span>
            </button>
          ))}
        </div>

        {/* Word type dropdown: only types that exist in the chosen lesson */}

        <div className="flex items-center justify-center gap-2 mb-4 text-sm">
          <label htmlFor="word-type" className="text-gray-500">
            Word type:
          </label>

          <select
            id="word-type"
            value={wordType}
            onChange={(event) => setWordTypeChoice(event.target.value)}
            className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <option value="all">All types ({vocabulary.length})</option>

            {wordTypes.map((item) => (
              <option key={item.type} value={item.type}>
                {item.name} ({item.count})
              </option>
            ))}
          </select>
        </div>

        {/* Progress of the chosen lesson (and word type) */}

        <div className="mb-4">
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

        <div className="flex justify-center gap-4 mb-5 text-sm">
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
            href={studyLink("learning")}
            className="block w-full text-center px-5 py-3 rounded-full bg-black text-white hover:bg-gray-800"
          >
            Study Learning words ({learningCount})
          </Link>

          <Link
            href={studyLink("all")}
            className="block w-full text-center px-5 py-3 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            Study all words ({totalCount})
          </Link>

          <Link
            href={studyLink("mastered")}
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
