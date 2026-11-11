"use client";

import Link from "next/link";
import { useState } from "react";
import { ReviewCards, loadReviewCards } from "@/lib/review";
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

// A small rounded choice button (word type chips, direction switch):
// filled when chosen, white otherwise.
function choiceStyle(isChosen: boolean) {
  return `rounded-full border-2 font-bold transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] ${
    isChosen
      ? "bg-graphite border-graphite text-white"
      : "bg-white border-graphite/15 text-graphite hover:border-graphite/40"
  }`;
}

type LessonOverviewProps = {
  // From the URL: "2" for /lesson/2, or "all" for /lesson/all
  lessonId: string;
};

// The lesson page: a cover with the lesson's progress, and the choices for
// studying it — word type, direction and what to study.
export default function LessonOverview({ lessonId }: LessonOverviewProps) {
  const book = useBook();

  const [studyStatus] = useState<StudyStatus>(loadStudyStatus);

  // Daily review progress (for the "learned" part of the progress bar)
  const [reviewCards] = useState<ReviewCards>(loadReviewCards);

  // German → English or English → German (remembered in localStorage)
  const [direction, setDirection] =
    useState<StudyDirection>(loadStudyDirection);

  // Word type chosen with the chips ("all" or e.g. "verb").
  // Not saved on purpose: it starts at "All" every visit, so a forgotten
  // filter never hides words.
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

          <Link href="/" className="btn-primary inline-block px-6 py-2.5">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const lessonChoice = isAll ? "all" : Number(lessonId);
  const { vocabulary } = selectLesson(book.lessons, lessonChoice);

  // ---------- The cover: progress of the whole lesson ----------

  const total = vocabulary.length;
  const learnedCount = vocabulary.filter((word) => reviewCards[word.word]).length;
  const masteredAll = countMastered(vocabulary, studyStatus);
  const learnedNotMastered = vocabulary.filter(
    (word) => reviewCards[word.word] && studyStatus[word.word] !== "mastered"
  ).length;
  const percent = (count: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100);

  // ---------- Word type chips ----------

  // Word types that exist in this lesson. If the chosen type isn't in
  // this lesson, fall back to "All".
  const wordTypes = wordTypesIn(vocabulary);
  const wordType = wordTypes.some((item) => item.type === wordTypeChoice)
    ? wordTypeChoice
    : "all";

  // The words that will be studied: this lesson + chosen word type
  const studyWords = filterByWordType(vocabulary, wordType);

  const totalCount = studyWords.length;
  const masteredCount = countMastered(studyWords, studyStatus);
  const learningCount = totalCount - masteredCount;

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
          className="btn-secondary inline-flex items-center h-8 px-3 text-sm mb-2.5 sm:mb-4"
        >
          ← Home
        </Link>

        {/* ---------- Cover ---------- */}

        {/* Dark, like the Today card on Home */}
        <section className="rounded-3xl bg-graphite text-white shadow-[0_1px_2px_rgba(46,50,56,0.1),0_8px_24px_rgba(46,50,56,0.18)] p-3 sm:p-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-3.5">
            {/* Big lesson number */}
            <span className="shrink-0 grid place-items-center w-14 h-14 rounded-2xl bg-white text-graphite font-serif text-3xl font-semibold">
              {isAll ? "∑" : lessonId}
            </span>

            <div className="min-w-0">
              <p className="text-xs text-white/70">
                {isAll ? "All added lessons" : chapter?.title}
              </p>
              {/* Always room for two lines of title (at most two), and one
                  line for the English, so every cover has the same height */}
              <h1 className="font-serif text-xl sm:text-2xl font-semibold leading-tight line-clamp-2 min-h-[3.125rem] sm:min-h-[3.75rem]">
                {isAll ? "All lessons" : chapter?.chapter}
              </h1>
              <p className="text-sm text-white/75 truncate">
                {chapter ? `${chapter.chapter_en}, ` : ""}
                {total} words
              </p>
            </div>
          </div>

          {/* Two-tone bar: dark = Mastered, light = learned in Daily review */}
          <div className="flex w-full h-2.5 mt-2.5 sm:mt-3.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-marker-strong"
              style={{ width: `${percent(masteredAll)}%` }}
            />
            <div
              className="h-full bg-marker"
              style={{ width: `${percent(learnedNotMastered)}%` }}
            />
          </div>

          <p className="flex items-center gap-1.5 text-xs text-white/75 mt-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-marker border border-marker-strong/50" />
            {percent(learnedCount)}% learned
            <span className="mx-1">·</span>
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-marker-strong" />
            {percent(masteredAll)}% mastered
          </p>
        </section>

        {/* ---------- Word type chips ---------- */}

        {/* On short screens (small phones) the chips are one row you can
            swipe sideways, so the page still fits on one screen. */}
        <div
          className="flex flex-wrap gap-1.5 mb-4 [@media(max-height:700px)]:flex-nowrap [@media(max-height:700px)]:overflow-x-auto [@media(max-height:700px)]:-mx-4 [@media(max-height:700px)]:px-4 [@media(max-height:700px)]:pb-1 [scrollbar-width:none]"
          role="group"
          aria-label="Word type"
        >
          <button
            onClick={() => setWordTypeChoice("all")}
            aria-pressed={wordType === "all"}
            className={`shrink-0 px-3 py-1 text-sm ${choiceStyle(wordType === "all")}`}
          >
            All {total}
          </button>

          {wordTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => setWordTypeChoice(item.type)}
              aria-pressed={wordType === item.type}
              className={`shrink-0 px-3 py-1 text-sm ${choiceStyle(wordType === item.type)}`}
            >
              {item.name} {item.count}
            </button>
          ))}
        </div>

        {/* ---------- Direction ---------- */}

        <div
          className="grid grid-cols-2 gap-1.5 mb-4 sm:mb-5"
          role="group"
          aria-label="Study direction"
        >
          <button
            onClick={() => chooseDirection("de-en")}
            aria-pressed={direction === "de-en"}
            className={`py-1.5 text-sm ${choiceStyle(direction === "de-en")}`}
          >
            German → English
          </button>

          <button
            onClick={() => chooseDirection("en-de")}
            aria-pressed={direction === "en-de"}
            className={`py-1.5 text-sm ${choiceStyle(direction === "en-de")}`}
          >
            English → German
          </button>
        </div>

        {/* ---------- What to study ---------- */}

        <div className="space-y-3 sm:space-y-3.5">
          <Link
            href={studyLink("learning")}
            className="btn-primary flex items-center justify-center w-full h-12"
          >
            Study Learning words ({learningCount})
          </Link>

          <Link
            href={studyLink("all")}
            className="btn-secondary flex items-center justify-center w-full h-12"
          >
            Study all words ({totalCount})
          </Link>

          <Link
            href={studyLink("mastered")}
            className="btn-secondary flex items-center justify-center w-full h-12"
          >
            Review Mastered words ({masteredCount})
          </Link>
        </div>

        {/* Keyboard hint (only on computers with a mouse/trackpad) */}

        <div className="hidden pointer-fine:block text-xs text-pencil mt-6 space-y-1.5">
          <p>While studying:</p>
          <p>
            <Key>Space</Key> reveals the answer
          </p>
          <p>
            <Key>←</Key> <Key>→</Key> move between words
          </p>
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
