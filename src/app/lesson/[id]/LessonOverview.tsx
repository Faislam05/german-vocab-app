"use client";

import Link from "next/link";
import { useState } from "react";
import { useBook } from "@/lib/useLessons";
import {
  StudyDirection,
  StudyStatus,
  WordType,
  countMastered,
  filterByWordType,
  loadStudyDirection,
  loadStudyStatus,
  saveStudyDirection,
  selectLesson,
  wordTypesIn,
} from "@/lib/vocabulary";

// Shared button styles. "active:scale" gives a small press feedback.
const pressable =
  "transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]";

type LessonOverviewProps = {
  // From the URL: "2" for /lesson/2, or "all" for /lesson/all
  lessonId: string;
};

// The lesson page: progress of one lesson (or all lessons), and the
// choices for studying it — word type, direction and what to study.
export default function LessonOverview({ lessonId }: LessonOverviewProps) {
  const book = useBook();

  const [studyStatus] = useState<StudyStatus>(loadStudyStatus);

  // German → English or English → German (remembered in localStorage)
  const [direction, setDirection] =
    useState<StudyDirection>(loadStudyDirection);

  // Word type chosen in the dropdown ("all" or e.g. "verb").
  // Not saved on purpose: it starts at "All types" every visit, so a
  // forgotten filter never hides words.
  const [wordTypeChoice, setWordTypeChoice] = useState<WordType>("all");

  function chooseDirection(newDirection: StudyDirection) {
    setDirection(newDirection);
    saveStudyDirection(newDirection);
  }

  if (!book) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  // Which lesson is this page for?
  const isAll = lessonId === "all";
  const chapter = book.chapters.find(
    (item) => String(item.lesson) === lessonId
  );
  const lesson = book.lessons.find((item) => String(item.lesson) === lessonId);

  // Unknown lesson, or a chapter whose words are not added yet
  if (!isAll && !lesson) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="font-serif text-3xl font-semibold mb-2">
            {chapter ? chapter.title : "Lesson not found"}
          </h1>

          {chapter && <p className="text-pencil mb-1">{chapter.chapter}</p>}

          <p className="text-pencil mb-6">
            {chapter
              ? "The words of this lesson are not added yet."
              : "There is no lesson with this number."}
          </p>

          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-graphite text-paper font-semibold hover:bg-black"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const lessonChoice = isAll ? "all" : Number(lessonId);
  const { vocabulary } = selectLesson(book.lessons, lessonChoice);

  // Word types that exist in this lesson (for the dropdown).
  // If the chosen type isn't in this lesson, fall back to "All types".
  const wordTypes = wordTypesIn(vocabulary);
  const wordType = wordTypes.some((item) => item.type === wordTypeChoice)
    ? wordTypeChoice
    : "all";

  // The words that will be studied: this lesson + chosen word type
  const studyWords = filterByWordType(vocabulary, wordType);

  const totalCount = studyWords.length;
  const masteredCount = countMastered(studyWords, studyStatus);
  const learningCount = totalCount - masteredCount;
  const masteredPercent =
    totalCount === 0 ? 0 : Math.round((masteredCount / totalCount) * 100);

  // Every study link carries the lesson, filter, direction and word type
  function studyLink(filter: string) {
    const typePart = wordType === "all" ? "" : `&type=${wordType}`;
    return `/study?lesson=${lessonChoice}&filter=${filter}&direction=${direction}${typePart}`;
  }

  return (
    // Same top position as Home, so titles don't jump between pages.
    // One centred column, the same width as the Study card, on all screens.
    <main className="min-h-screen flex justify-center px-4 pt-6 pb-8 sm:px-10 sm:pt-10">
      <div className="w-full max-w-md sm:max-w-lg">
        <Link
          href="/"
          className="inline-block text-sm text-pencil hover:text-graphite mb-3"
        >
          ← Home
        </Link>

        <div>
          {/* About this lesson */}

          <section>
            {/* Header: "Lektion 2", the chapter title and its English meaning */}

            <div className="mb-5">
              <h1 className="font-serif text-4xl font-semibold leading-tight">
                {isAll ? "All lessons" : chapter?.title}
              </h1>

              {chapter && (
                <p className="font-serif text-lg leading-snug">
                  {chapter.chapter}
                </p>
              )}

              <p className="text-sm text-pencil">
                {chapter ? `${chapter.chapter_en}, ` : ""}
                {vocabulary.length} words
              </p>
            </div>

            {/* Word type dropdown: only types that exist in this lesson */}

            <div className="flex items-center gap-2 mb-5 text-sm">
              <label htmlFor="word-type" className="text-pencil">
                Word type
              </label>

              <select
                id="word-type"
                value={wordType}
                onChange={(event) => setWordTypeChoice(event.target.value)}
                className="px-2 py-1 rounded-lg bg-paper border border-graphite/15 hover:bg-white"
              >
                <option value="all">All types ({vocabulary.length})</option>

                {wordTypes.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.name} ({item.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Progress of this lesson (and word type) */}

            <div className="mb-5">
              <div className="flex justify-between text-sm mb-1.5">
                <span>
                  Learning: <strong>{learningCount}</strong>
                  <span className="mx-2 text-graphite/30">|</span>
                  Mastered: <strong>{masteredCount}</strong>
                </span>

                <span className="text-pencil">{masteredPercent}%</span>
              </div>

              <div className="w-full h-2.5 bg-grid rounded-full overflow-hidden border border-graphite/10">
                <div
                  className="h-full bg-marker-strong transition-[width] duration-300 ease-out"
                  style={{ width: `${masteredPercent}%` }}
                />
              </div>
            </div>
          </section>

          {/* How to study it */}

          <section>
            {/* Direction */}

            <div
              className="grid grid-cols-2 gap-1 p-1 mb-4 rounded-xl bg-grid text-sm"
              role="group"
              aria-label="Study direction"
            >
              <button
                onClick={() => chooseDirection("de-en")}
                aria-pressed={direction === "de-en"}
                className={`py-1.5 rounded-lg ${pressable} ${
                  direction === "de-en"
                    ? "bg-paper font-semibold shadow-sm"
                    : "text-pencil hover:text-graphite"
                }`}
              >
                German → English
              </button>

              <button
                onClick={() => chooseDirection("en-de")}
                aria-pressed={direction === "en-de"}
                className={`py-1.5 rounded-lg ${pressable} ${
                  direction === "en-de"
                    ? "bg-paper font-semibold shadow-sm"
                    : "text-pencil hover:text-graphite"
                }`}
              >
                English → German
              </button>
            </div>

            {/* What to study */}

            <div className="space-y-2.5">
              <Link
                href={studyLink("learning")}
                className={`block w-full text-center px-5 py-3 rounded-xl bg-graphite text-paper font-semibold hover:bg-black ${pressable}`}
              >
                Study Learning words ({learningCount})
              </Link>

              <Link
                href={studyLink("all")}
                className={`block w-full text-center px-5 py-3 rounded-xl bg-paper border border-graphite/15 hover:bg-white ${pressable}`}
              >
                Study all words ({totalCount})
              </Link>

              <Link
                href={studyLink("mastered")}
                className={`block w-full text-center px-5 py-3 rounded-xl bg-paper border border-graphite/15 hover:bg-white ${pressable}`}
              >
                Review Mastered words ({masteredCount})
              </Link>
            </div>

            {/* Keyboard hint (only on computers with a mouse/trackpad) */}

            <div className="hidden pointer-fine:block text-xs text-pencil mt-5 space-y-1.5">
              <p>While studying:</p>
              <p>
                <Key>Space</Key> reveals the answer
              </p>
              <p>
                <Key>←</Key> <Key>→</Key> move between words
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// A keyboard key, drawn like a small key cap
function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded border border-graphite/20 border-b-2 bg-paper font-sans text-graphite">
      {children}
    </kbd>
  );
}
