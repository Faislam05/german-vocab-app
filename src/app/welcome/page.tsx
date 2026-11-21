"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { LEVELS, LevelId, loadLevel, saveLevel } from "@/lib/level";

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

        {/* A1: the main choice, a big dark card */}
        <button
          onClick={() => choose(first.id)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-graphite text-paper text-left shadow-[0_4px_0_#000] transition-[transform,box-shadow] duration-100 ease-out active:translate-y-1 active:shadow-none hover:bg-black"
        >
          <span className="shrink-0 w-14 h-14 rounded-xl bg-marker text-graphite font-serif text-2xl font-semibold flex items-center justify-center">
            {first.id}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-lg">{first.name}</span>
            <span className="block text-sm text-paper/80">{first.text}</span>
          </span>
          <span className="text-2xl" aria-hidden="true">
            →
          </span>
        </button>

        <p className="text-sm text-pencil mt-2 mb-6">
          Not sure? Start with A1, it begins from zero.
        </p>

        {/* The other levels: placeholders until they have words */}
        <h2 className="font-serif text-xl font-semibold mb-2">Coming later</h2>

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
