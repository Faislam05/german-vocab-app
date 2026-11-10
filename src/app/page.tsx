"use client";

import Link from "next/link";
import { useState } from "react";
import { useLessons } from "@/lib/useLessons";
import {
  BOOK_LESSON_COUNT,
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

  // One box for every lesson of the book (1 to 10), plus "All".
  // Lessons that are not added yet become placeholders ("available: false").
  const lastLessonNumber = Math.max(
    BOOK_LESSON_COUNT,
    ...lessons.map((lesson) => lesson.lesson)
  );

  const lessonButtons: {
    choice: LessonChoice;
    label: string; // shown in the box: "3" or "All"
    name: string; // read out by screen readers: "Lektion 3"
    percent: number;
    available: boolean;
  }[] = [
    ...Array.from({ length: lastLessonNumber }, (_, i) => {
      const number = i + 1;
      const lesson = lessons.find((item) => item.lesson === number);

      return {
        choice: number as LessonChoice,
        label: String(number),
        name: `Lektion ${number}`,
        percent: lesson ? percentMastered(lesson.vocabulary) : 0,
        available: lesson !== undefined,
      };
    }),
    {
      choice: "all",
      label: "All",
      name: "All lessons",
      percent: percentMastered(selectLesson(lessons, "all").vocabulary),
      available: true,
    },
  ];


  // Shared button styles. "active:scale" gives a small press feedback.
  const pressable =
    "transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-5 sm:p-8">
      <div className="w-full max-w-md lg:max-w-3xl lg:grid lg:grid-cols-2 lg:gap-14 lg:items-center">
        {/* Left column (top on phones): lesson, word type, progress */}

        <section>
          {/* Header */}

          <div className="mb-4">
            <h1 className="font-serif text-4xl font-semibold leading-tight">
              {title}
            </h1>

            <p className="text-sm text-pencil">
              {vocabulary.length} German A1 words
            </p>
          </div>

          {/* Lesson picker: numbered boxes (6 per row), each with a tiny
              bar showing how much of that lesson is Mastered. "All" takes
              two boxes. The chosen lesson is highlighted in marker yellow.
              Lessons not added yet are dashed placeholders. */}

          <p className="text-sm text-pencil mb-1.5">Lektion</p>

          <div className="grid grid-cols-6 gap-1.5 mb-4">
            {lessonButtons.map((button) => {
              const isChosen = lessonChoice === button.choice;

              // Not added yet: a dashed, greyed-out box that can't be clicked
              if (!button.available) {
                return (
                  <button
                    key={String(button.choice)}
                    disabled
                    aria-label={`${button.name}, not added yet`}
                    title={`${button.name}: not added yet`}
                    className="h-11 px-1.5 pt-1.5 rounded-lg border border-dashed border-graphite/20 text-sm leading-none text-graphite/30 flex flex-col cursor-not-allowed"
                  >
                    {button.label}
                  </button>
                );
              }

              return (
                <button
                  key={String(button.choice)}
                  onClick={() => chooseLesson(button.choice)}
                  aria-label={`${button.name}, ${button.percent}% mastered`}
                  aria-pressed={isChosen}
                  title={`${button.name}: ${button.percent}% mastered`}
                  className={`h-11 px-1.5 pt-1.5 pb-1 rounded-lg border flex flex-col justify-between ${pressable} ${
                    button.choice === "all" ? "col-span-2" : ""
                  } ${
                    isChosen
                      ? "bg-marker border-marker-strong font-semibold"
                      : "bg-paper border-graphite/15 hover:bg-white"
                  }`}
                >
                  <span className="text-sm leading-none">{button.label}</span>

                  {/* Mini Mastered bar */}
                  <span className="block w-full h-1 rounded-full bg-graphite/10 overflow-hidden">
                    <span
                      className={`block h-full ${isChosen ? "bg-graphite" : "bg-marker-strong"}`}
                      style={{ width: `${button.percent}%` }}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Word type dropdown: only types that exist in the chosen lesson */}

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

          {/* Progress of the chosen lesson (and word type) */}

          <div className="mb-5 lg:mb-0">
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

        {/* Right column (bottom on phones): direction and what to study */}

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
