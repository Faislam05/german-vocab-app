"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import WordCard, {
  cardFrame,
  cardStyle,
  pressable,
} from "@/components/WordCard";
import { useLessons } from "@/lib/useLessons";
import {
  DAILY_NEW_WORDS,
  ReviewCards,
  addMoreNewWords,
  answerReview,
  dueWords,
  forgotWord,
  getTodayPlan,
  learnNewWord,
  loadReviewCards,
  loadStudyLog,
  todayString,
} from "@/lib/review";
import {
  LessonData,
  VocabularyCard,
  loadStudyDirection,
  selectLesson,
} from "@/lib/vocabulary";

// One step of today's session:
// - "review": a word learned before, due today
// - "meet":   a new word, shown with its answer, to read and listen to
// - "check":  a new word again, answer hidden: do you remember it?
// - "retry":  a word answered "Again", asked once more at the end
type Step = {
  kind: "review" | "meet" | "check" | "retry";
  word: VocabularyCard;
  isNew: boolean; // true for today's new words
};

type Session = {
  steps: Step[];
  index: number; // the step on screen
  reviewed: number; // review words answered
  learned: string[]; // new words learned this session
};

// New words are met and checked in small groups: meet 5, check those 5,
// meet the next 5, …
const GROUP_SIZE = 5;

// Builds today's steps: first the reviews, then the new words.
function buildSession(allWords: VocabularyCard[], cards: ReviewCards): Session {
  const plan = getTodayPlan(allWords, cards);
  const steps: Step[] = dueWords(allWords, cards).map((word) => ({
    kind: "review",
    word,
    isNew: false,
  }));

  const newWords = plan.newWords
    .filter((name) => !cards[name]) // not learned yet
    .map((name) => allWords.find((word) => word.word === name))
    .filter((word): word is VocabularyCard => word !== undefined);

  for (let i = 0; i < newWords.length; i += GROUP_SIZE) {
    const group = newWords.slice(i, i + GROUP_SIZE);
    for (const word of group) steps.push({ kind: "meet", word, isNew: true });
    for (const word of group) steps.push({ kind: "check", word, isNew: true });
  }

  return { steps, index: 0, reviewed: 0, learned: [] };
}

// Waits for the lessons to load, then starts the session.
export default function ReviewSession() {
  const lessons = useLessons();

  if (!lessons) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  return <ReviewRunner lessons={lessons} />;
}

const stepLabels: Record<Step["kind"], string> = {
  review: "Review",
  meet: "New word",
  check: "Check",
  retry: "Once more",
};

function ReviewRunner({ lessons }: { lessons: LessonData[] }) {
  // All words of the book, in book order (Lektion 1 first)
  const allWords = selectLesson(lessons, "all").vocabulary;

  const [isEnglishToGerman] = useState(
    () => loadStudyDirection() === "en-de"
  );

  // Built once when the screen opens (useState runs this only once)
  const [session, setSession] = useState<Session>(() =>
    buildSession(allWords, loadReviewCards())
  );

  // Which step has its answer revealed (null = none)
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);

  // The last step that was answered. Stops a fast double tap from
  // answering (and saving) the same card twice.
  const lastAnswered = useRef<number | null>(null);

  const step = session.steps[session.index] as Step | undefined;
  const showAnswer = step?.kind === "meet" || revealedIndex === session.index;

  function reveal() {
    setRevealedIndex(session.index);
  }

  function next() {
    setSession((current) => ({ ...current, index: current.index + 1 }));
  }

  // Again / Got it
  //
  // The saving happens here, once, when the button is pressed. (It must
  // not happen inside setSession's update function: in development React
  // runs that function twice on purpose, which would save twice.)
  function answer(gotIt: boolean) {
    if (!step || lastAnswered.current === session.index) return;
    lastAnswered.current = session.index;

    const steps = [...session.steps];
    let { reviewed, learned } = session;

    if (step.kind === "review") {
      // First answer of a review word today: this moves it between boxes
      answerReview(step.word.word, gotIt);
      reviewed += 1;
    } else if (step.isNew && gotIt && !learned.includes(step.word.word)) {
      // A new word remembered: it is learned, back tomorrow
      learnNewWord(step.word.word);
      learned = [...learned, step.word.word];
    }

    // "Again": ask once more at the end of today's session (and if the
    // word was Mastered, it goes back to Learning)
    if (!gotIt) {
      forgotWord(step.word.word);
      steps.push({ kind: "retry", word: step.word, isNew: step.isNew });
    }

    setSession({ steps, index: session.index + 1, reviewed, learned });
  }

  // "Learn 10 more": add the next new words and start again with them
  function learnMore() {
    addMoreNewWords(allWords, loadReviewCards());
    setSession(buildSession(allWords, loadReviewCards()));
    setRevealedIndex(null);
    lastAnswered.current = null;
  }

  // Keyboard: Space = show the answer (or continue on a new word),
  // 1 = Again, 2 = Got it
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!step) return;

      if (event.key === " ") {
        event.preventDefault();
        if (step.kind === "meet") next();
        else if (!showAnswer) reveal();
      }

      if (showAnswer && step.kind !== "meet") {
        if (event.key === "1") answer(false);
        if (event.key === "2") answer(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // ---------- Finished (or nothing to do today) ----------

  if (!step) {
    const newWordsLeft = allWords.some((word) => !loadReviewCards()[word.word]);

    // Today's totals (also from earlier visits today)
    const todayLog = loadStudyLog()[todayString()];
    const learnedToday = todayLog?.learned ?? 0;
    const reviewedToday = todayLog?.reviewed ?? 0;
    const didSomething = learnedToday > 0 || reviewedToday > 0;

    return (
      <main className="min-h-screen flex justify-center items-start px-4 pt-6 sm:pt-10">
        <div className={`${cardStyle} ${cardFrame()} p-8 text-center`}>
          <div className="text-5xl mb-4">{didSomething ? "🎉" : "☕"}</div>

          <h1 className="font-serif text-3xl font-semibold mb-2">
            {didSomething ? "All done for today" : "Nothing due right now"}
          </h1>

          {didSomething && (
            <p className="text-pencil mb-6">
              Today: {learnedToday} new words learned, {reviewedToday}{" "}
              reviewed
            </p>
          )}

          {!didSomething && (
            <p className="text-pencil mb-6">
              You have no words to review yet. Come back tomorrow for your
              reviews.
            </p>
          )}

          <div className="space-y-2.5">
            {newWordsLeft && (
              <button
                onClick={learnMore}
                className={`block w-full px-5 py-3 rounded-xl bg-graphite text-paper font-semibold hover:bg-black ${pressable}`}
              >
                Learn {DAILY_NEW_WORDS} more words
              </button>
            )}

            <Link
              href="/"
              className={`block w-full px-5 py-3 rounded-xl bg-paper border border-graphite/15 hover:bg-white ${pressable}`}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ---------- A card ----------

  const position = session.index + 1;
  const total = session.steps.length;

  return (
    <main className="min-h-screen flex justify-center items-start p-2 sm:px-6 sm:pt-10 overflow-x-clip">
      <div className={`${cardStyle} ${cardFrame(step.word)} p-3 sm:p-5`}>
        {/* Top bar: ← Home, what kind of card this is, and progress */}

        <div className="flex items-center justify-between gap-2 whitespace-nowrap text-xs sm:text-sm mb-2">
          <Link href="/" className="text-pencil hover:text-graphite">
            ← Home
          </Link>

          <span
            className={`px-2.5 py-0.5 rounded-full font-bold ${
              step.kind === "meet"
                ? "bg-(--card-accent) text-white"
                : "bg-white text-(--card-accent)"
            }`}
          >
            {stepLabels[step.kind]}
          </span>

          <span>
            <strong>{position}</strong> of {total}
          </span>
        </div>

        <div className="mb-3 w-full h-1.5 bg-white/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-(--card-accent) transition-[width] duration-300 ease-out"
            style={{ width: `${(position / total) * 100}%` }}
          />
        </div>

        {/* The card (slides in for every new step) */}

        <div key={session.index} className="card-in-next">
          <WordCard
            word={step.word}
            isEnglishToGerman={isEnglishToGerman}
            showAnswer={showAnswer}
          />
        </div>

        {/* Bottom buttons (stick to the bottom of the screen) */}

        <div className="sticky bottom-0 bg-(--card-bottom) flex gap-2.5 mt-2 pt-2.5 pb-2 border-t border-white/80">
          {step.kind === "meet" ? (
            <BigButton onClick={next} primary keyHint="Space">
              Next
            </BigButton>
          ) : !showAnswer ? (
            <BigButton onClick={reveal} primary keyHint="Space">
              {isEnglishToGerman ? "Show German" : "Show meaning"}
            </BigButton>
          ) : (
            <>
              <BigButton onClick={() => answer(false)} keyHint="1">
                Again
              </BigButton>
              <BigButton onClick={() => answer(true)} primary keyHint="2">
                Got it
              </BigButton>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// A wide bottom button with an optional key hint (computers only)
function BigButton({
  children,
  onClick,
  primary = false,
  keyHint,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  keyHint?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 h-11 ${
        primary ? "btn-primary" : "btn-secondary"
      }`}
    >
      {children}
      {keyHint && (
        <kbd
          className={`hidden pointer-fine:inline px-1.5 py-0.5 rounded border text-xs font-sans font-normal ${
            primary
              ? "border-paper/30 text-paper/80"
              : "border-graphite/20 text-pencil"
          }`}
        >
          {keyHint}
        </kbd>
      )}
    </button>
  );
}
