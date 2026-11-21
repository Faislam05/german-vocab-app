"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import Fox from "@/components/Fox";
import ProgressBar, { getProgress } from "@/components/ProgressBar";
import { resetHints } from "@/lib/hints";
import { LEVELS, loadLevel } from "@/lib/level";
import { ReviewCards, loadReviewCards } from "@/lib/review";
import { useBook } from "@/lib/useLessons";
import { StudyStatus, loadStudyStatus, selectLesson } from "@/lib/vocabulary";

// The saved level never changes while this page is open, so there is
// nothing to listen to.
const noSubscribe = () => () => {};

// The Profile screen, opened with the fox button at the top right of
// Home. Your level, your overall progress and app settings. Later also
// streak, stats and the daily goal (see "Future Features").
export default function Profile() {
  const router = useRouter();
  const book = useBook();

  const level = useSyncExternalStore(noSubscribe, loadLevel, () => null);
  const levelInfo = LEVELS.find((item) => item.id === level) ?? LEVELS[0];

  const [studyStatus] = useState<StudyStatus>(loadStudyStatus);
  const [reviewCards] = useState<ReviewCards>(loadReviewCards);

  if (!book) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  const progress = getProgress(
    selectLesson(book.lessons, "all").vocabulary,
    reviewCards,
    studyStatus
  );

  function showTipsAgain() {
    resetHints();
    router.push("/");
  }

  return (
    // Same layout as the Lesson screen: one centred column
    <main className="min-h-screen flex justify-center px-4 pt-6 pb-8 sm:px-10 sm:pt-10">
      <div className="w-full max-w-md sm:max-w-lg">
        <Link
          href="/"
          className="btn-secondary inline-flex items-center h-8 px-3 text-sm mb-2.5 sm:mb-4"
        >
          ← Home
        </Link>

        {/* ---------- Cover: the fox, your level and progress ---------- */}

        <section className="rounded-3xl bg-graphite text-white shadow-[0_1px_2px_rgba(46,50,56,0.1),0_8px_24px_rgba(46,50,56,0.18)] p-3 sm:p-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-3.5">
            {/* The fox on dark yellow (the "mastered" colour of the progress bar) */}
            <span className="shrink-0 grid place-items-center w-16 h-16 rounded-full bg-marker-strong">
              <Fox pose="head" height={52} />
            </span>

            <div className="min-w-0">
              <p className="text-xs text-white/70">Your profile</p>
              <h1 className="font-serif text-2xl font-semibold leading-tight">
                German {levelInfo.id}
              </h1>
              <p className="text-sm text-white/75 truncate">
                {levelInfo.name}, {progress.learned} learned,{" "}
                {progress.mastered} mastered
              </p>
            </div>
          </div>

          <ProgressBar progress={progress} onDark className="mt-3" />
        </section>

        {/* ---------- Settings ---------- */}

        <section className="rounded-3xl bg-white border border-graphite/10 shadow-[0_1px_2px_rgba(46,50,56,0.05),0_6px_18px_rgba(46,50,56,0.06)] p-3 sm:p-4 mb-4 sm:mb-5 divide-y divide-graphite/10">
          <div className="flex items-center justify-between gap-3 pb-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-pencil">Level</p>
              <p className="font-semibold">
                {levelInfo.id} {levelInfo.name}
              </p>
            </div>
            <Link
              href="/welcome"
              className="btn-secondary shrink-0 inline-flex items-center h-10 px-4 text-sm"
            >
              Change
            </Link>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-pencil">Tips</p>
              <p className="font-semibold">First-time tips</p>
            </div>
            <button
              onClick={showTipsAgain}
              className="btn-secondary shrink-0 h-10 px-4 text-sm"
            >
              Show again
            </button>
          </div>
        </section>

        {/* ---------- Planned ---------- */}

        <div className="p-3 rounded-2xl border border-dashed border-graphite/20 text-graphite/40">
          <p className="font-serif font-semibold">Streak and stats</p>
          <p className="text-xs">
            Days in a row, words per day, daily goal. Coming soon
          </p>
        </div>
      </div>
    </main>
  );
}
