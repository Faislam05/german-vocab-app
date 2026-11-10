"use client";

import Link from "next/link";
import { useState } from "react";
import { useBook } from "@/lib/useLessons";
import {
  StudyStatus,
  VocabularyCard,
  countMastered,
  filterByWordType,
  filterVocabulary,
  loadLastStudy,
  loadStudyStatus,
  parseLessonChoice,
  selectLesson,
  wordTypeName,
} from "@/lib/vocabulary";

// Shared button styles. "active:scale" gives a small press feedback.
const pressable =
  "transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]";

// Activities planned for later (see "Future Features" in PROJECT_CONTEXT.md).
// Shown as "Coming soon" placeholders until they are built.
const PRACTICE_IDEAS = [
  { title: "der / die / das", text: "Guess the article" },
  { title: "Expressions", text: "Phrases like “alle sein”" },
  { title: "Daily review", text: "Words due today" },
  { title: "Grammar", text: "Tables from each lesson" },
];

// Names used in the Continue card
const filterNames: Record<string, string> = {
  all: "All words",
  learning: "Learning words",
  mastered: "Mastered words",
};

// The Home screen: overall progress, "Continue" where you left off, the
// lessons of the book and (later) other ways to practise.
export default function Home() {
  const book = useBook();

  const [studyStatus] = useState<StudyStatus>(loadStudyStatus);

  // The last study session, e.g. "lesson=2&filter=learning&direction=de-en"
  // (null if you haven't studied yet)
  const [lastStudy] = useState<string | null>(loadLastStudy);

  if (!book) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  // Percentage of a word list that is Mastered (0 for an empty list)
  function percentMastered(words: VocabularyCard[]) {
    if (words.length === 0) return 0;
    return Math.round((countMastered(words, studyStatus) / words.length) * 100);
  }

  const allWords = selectLesson(book.lessons, "all").vocabulary;
  const allMastered = countMastered(allWords, studyStatus);
  const allPercent = percentMastered(allWords);

  const continueCard = getContinueCard();

  // What the Continue card shows and where it goes
  function getContinueCard() {
    if (!book) return null;

    // Never studied yet: start with the first lesson
    if (!lastStudy) {
      const first = book.chapters.find((item) => item.file);
      if (!first) return null;

      return {
        href: `/lesson/${first.lesson}`,
        label: "Start learning",
        title: `${first.title}: ${first.chapter}`,
        detail: "Choose how you want to study",
      };
    }

    // Studied before: go straight back to the same study session
    const settings = new URLSearchParams(lastStudy);
    const lessonChoice = parseLessonChoice(settings.get("lesson"), book.lessons);
    const filter = settings.get("filter") ?? "all";
    const wordType = settings.get("type") ?? "all";
    const direction =
      settings.get("direction") === "en-de"
        ? "English → German"
        : "German → English";

    const chapter = book.chapters.find((item) => item.lesson === lessonChoice);
    const words = filterVocabulary(
      filterByWordType(
        selectLesson(book.lessons, lessonChoice).vocabulary,
        wordType
      ),
      studyStatus,
      filter === "learning" || filter === "mastered" ? filter : "all"
    );

    const typePart = wordType === "all" ? "" : `${wordTypeName(wordType)}, `;

    return {
      href: `/study?${lastStudy}`,
      label: "Continue",
      title: chapter ? `${chapter.title}: ${chapter.chapter}` : "All lessons",
      detail: `${typePart}${filterNames[filter] ?? "All words"} (${words.length}), ${direction}`,
    };
  }

  return (
    // The page is exactly one screen tall and has two parts:
    // 1. a fixed top part (title, progress, Continue, column headings)
    // 2. a scroll area below it with the lessons and practice
    <main className="h-dvh flex justify-center px-4 sm:px-10">
      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-5xl flex flex-col min-h-0">
        {/* ---------- 1. Fixed top part ---------- */}

        <div className="shrink-0 pt-6 sm:pt-10">
          {/* Header with overall progress */}

          <header className="mb-5">
            <h1 className="font-serif text-4xl font-semibold leading-tight">
              German A1
            </h1>

            <div className="flex justify-between text-sm text-pencil mt-1 mb-1.5">
              <span>
                Mastered{" "}
                <strong className="text-graphite">{allMastered}</strong> of{" "}
                {allWords.length} words
              </span>
              <span>{allPercent}%</span>
            </div>

            <div className="w-full h-2 bg-grid rounded-full overflow-hidden border border-graphite/10">
              <div
                className="h-full bg-marker-strong"
                style={{ width: `${allPercent}%` }}
              />
            </div>
          </header>

          {/* Continue: one tap back to where you left off */}

          {continueCard && (
            <Link
              href={continueCard.href}
              className={`flex items-center justify-between gap-4 mb-5 p-4 rounded-2xl bg-graphite text-paper hover:bg-black ${pressable}`}
            >
              <span className="min-w-0">
                <span className="block text-xs text-paper/70 mb-0.5">
                  {continueCard.label}
                </span>
                <span className="block font-semibold truncate">
                  {continueCard.title}
                </span>
                <span className="block text-sm text-paper/80">
                  {continueCard.detail}
                </span>
              </span>

              <span className="text-2xl" aria-hidden="true">
                →
              </span>
            </Link>
          )}

          {/* Column headings (same columns as the scroll area below) */}

          <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 lg:grid-cols-3 lg:gap-6 pb-2">
            <h2 className="font-serif text-2xl font-semibold lg:col-span-2">
              Lessons
            </h2>
            <h2 className="font-serif text-2xl font-semibold">Practice</h2>
          </div>
        </div>

        {/* ---------- 2. Scroll area ----------
            Two columns, on phones too: Lessons on the left (a bit wider),
            Practice on the right. Practice is "sticky": it stays in view
            while you scroll down the lessons. On desktop the lessons get
            two cards per row. The small side padding keeps card shadows
            from being cut off at the edges. */}

        <div className="flex-1 min-h-0 overflow-y-auto -mx-2 px-2 pt-1 pb-6 sm:pb-10">
          <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 lg:grid-cols-3 lg:gap-6 items-start">
            {/* Lessons of the book. Lessons not added yet are dashed
              placeholders that can't be clicked. */}

            <section className="lg:col-span-2" aria-label="Lessons">
              <div className="grid gap-2 lg:grid-cols-2">
                {book.chapters.map((chapter) => {
                  const lesson = book.lessons.find(
                    (item) => item.lesson === chapter.lesson
                  );

                  if (!lesson) {
                    return (
                      <div
                        key={chapter.lesson}
                        className="p-2.5 sm:p-3 rounded-xl border border-dashed border-graphite/20 text-graphite/40"
                      >
                        <p className="text-xs">{chapter.title}</p>
                        <p className="font-serif text-sm sm:text-base font-semibold leading-snug">
                          {chapter.chapter}
                        </p>
                        <p className="text-xs">Not added yet</p>
                      </div>
                    );
                  }

                  const percent = percentMastered(lesson.vocabulary);

                  return (
                    <Link
                      key={chapter.lesson}
                      href={`/lesson/${chapter.lesson}`}
                      className={`block p-2.5 sm:p-3 rounded-xl bg-white border border-graphite/10 shadow-sm hover:border-graphite/30 ${pressable}`}
                    >
                      <p className="text-xs text-pencil">{chapter.title}</p>
                      <p className="font-serif text-sm sm:text-base font-semibold leading-snug">
                        {chapter.chapter}
                      </p>
                      <p className="text-xs text-pencil mb-2">
                        {chapter.chapter_en}
                      </p>

                      <div className="flex justify-between text-xs text-pencil mb-1">
                        <span>{lesson.vocabulary.length} words</span>
                        <span>{percent}%</span>
                      </div>

                      <div className="h-1.5 bg-grid rounded-full overflow-hidden">
                        <div
                          className="h-full bg-marker-strong"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}

                {/* All lessons together */}

                <Link
                  href="/lesson/all"
                  className={`block p-2.5 sm:p-3 rounded-xl bg-white border border-graphite/10 shadow-sm hover:border-graphite/30 lg:col-span-2 ${pressable}`}
                >
                  <p className="font-serif text-sm sm:text-base font-semibold">
                    All lessons
                  </p>
                  <p className="text-xs text-pencil">
                    Every added lesson together ({allWords.length} words)
                  </p>
                </Link>
              </div>
            </section>

            {/* Other ways to practise: placeholders for now */}

            <section className="sticky top-0" aria-label="Practice">
              <div className="grid gap-2">
                {PRACTICE_IDEAS.map((idea) => (
                  <div
                    key={idea.title}
                    className="p-2.5 sm:p-3 rounded-xl border border-dashed border-graphite/20 text-graphite/40"
                  >
                    <p className="font-serif text-sm sm:text-base font-semibold leading-snug">
                      {idea.title}
                    </p>
                    <p className="text-xs">{idea.text}</p>
                    <p className="text-xs mt-1">Coming soon</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
