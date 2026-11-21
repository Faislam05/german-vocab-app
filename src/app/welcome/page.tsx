"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import ProgressBar, { getProgress } from "@/components/ProgressBar";
import { LEVELS, LevelId, loadLevel, saveLevel } from "@/lib/level";
import { ReviewCards, loadReviewCards } from "@/lib/review";
import { useBook } from "@/lib/useLessons";
import { StudyStatus, loadStudyStatus, selectLesson } from "@/lib/vocabulary";

// The saved level never changes while this page is open, so there is
// nothing to listen to.
const noSubscribe = () => () => {};

// The Welcome screen: shown the first time you open the app, to choose
// your German level. After that the app opens on Home, and you come back
// here only by tapping the level chip on Home (to change level).
export default function Welcome() {
  const router = useRouter();

  // The level chosen before (null the very first time). localStorage
  // only exists in the browser, so on the server this is always null;
  // useSyncExternalStore handles that switch safely.
  const current = useSyncExternalStore(noSubscribe, loadLevel, () => null);

  // Your progress in A1 (the only level with words so far), shown as a
  // bar on its card once you have started. Hidden for new users.
  const book = useBook();
  const [studyStatus] = useState<StudyStatus>(loadStudyStatus);
  const [reviewCards] = useState<ReviewCards>(loadReviewCards);
  const progress = book
    ? getProgress(
        selectLesson(book.lessons, "all").vocabulary,
        reviewCards,
        studyStatus
      )
    : null;
  const started = progress && progress.learned + progress.mastered > 0;

  function choose(level: LevelId) {
    saveLevel(level);
    router.replace("/");
  }

  const [first, ...later] = LEVELS;

  return (
    <main className="min-h-dvh flex justify-center px-4 py-6 sm:py-12">
      <div className="w-full max-w-md">
        {/* Back to Home, only when changing level (not the first time) */}
        {current && (
          <Link
            href="/"
            className="btn-secondary inline-block px-4 py-1.5 text-sm mb-5"
          >
            ← Home
          </Link>
        )}

        <header className="mb-6">
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            Hallo! 👋
          </h1>
          <p className="text-lg mt-1">Let&apos;s learn German.</p>
          <p className="text-pencil mt-3">Which level do you want to study?</p>
        </header>

        {/* A1: the main choice, a big dark card (with your progress bar
            once you have started) */}
        <button
          onClick={() => choose(first.id)}
          className="w-full px-3.5 py-3 rounded-2xl bg-graphite text-paper text-left shadow-[0_4px_0_#000] transition-[transform,box-shadow] duration-100 ease-out active:translate-y-1 active:shadow-none hover:bg-black"
        >
          <span className="flex items-center gap-3">
            <span className="shrink-0 w-11 h-11 rounded-xl bg-marker text-graphite font-serif text-xl font-semibold flex items-center justify-center">
              {first.id}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-snug">
                {first.name}
              </span>
              <span className="block text-sm text-paper/80 leading-snug">
                {first.text}
              </span>
            </span>
            <span className="text-2xl" aria-hidden="true">
              →
            </span>
          </span>

          {started && (
            <ProgressBar progress={progress} onDark className="mt-2.5" />
          )}
        </button>

        {/* Advice for new users only (not when changing level) */}
        {!current && (
          <p className="text-sm text-pencil mt-2">
            Not sure? Start with A1, it begins from zero.
          </p>
        )}

        {/* The other levels: placeholders until they have words */}
        <h2 className="font-serif text-xl font-semibold mt-6 mb-2">
          Coming later
        </h2>

        <ul className="grid gap-2">
          {later.map((level) => (
            <li
              key={level.id}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-graphite/20 text-graphite/40"
            >
              <span className="shrink-0 w-10 h-10 rounded-lg border border-graphite/15 font-serif font-semibold flex items-center justify-center">
                {level.id}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {level.name}
                </span>
                <span className="block text-xs truncate">{level.text}</span>
              </span>
              <span className="ml-auto text-xs shrink-0">Coming soon</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
