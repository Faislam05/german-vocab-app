"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ExampleSentences from "@/components/ExampleSentences";
import GermanWord from "@/components/GermanWord";
import ListenButton from "@/components/ListenButton";
import StudyTopBar from "@/components/StudyTopBar";
import { useLessons } from "@/lib/useLessons";
import {
  StudyFilter,
  StudyStatus,
  VocabularyCard,
  filterByWordType,
  filterVocabulary,
  formatPartOfSpeech,
  loadStudyStatus,
  parseLessonChoice,
  saveLastStudy,
  saveStudyStatus,
  selectLesson,
  shuffleArray,
} from "@/lib/vocabulary";

// The flashcard: a white sheet lying on the squared paper
const cardStyle =
  "bg-white rounded-2xl border border-graphite/10 shadow-[0_1px_2px_rgba(46,50,56,0.06),0_8px_24px_rgba(46,50,56,0.08)] w-full max-w-md sm:max-w-lg";

// Small press feedback for buttons
const pressable =
  "transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]";

// The German word gets a yellow highlighter stroke behind its lower half
const highlighter =
  "px-1 box-decoration-clone bg-[linear-gradient(transparent_58%,var(--color-marker)_58%)]";

const filterLabels: Record<StudyFilter, string> = {
  all: "All words",
  learning: "Learning",
  mastered: "Mastered",
};

export default function StudySession() {
  // The filter comes from the URL, e.g. /study?filter=learning
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const studyFilter: StudyFilter =
    filterParam === "learning" || filterParam === "mastered"
      ? filterParam
      : "all";

  // The direction also comes from the URL, e.g. &direction=en-de
  // English → German: the card asks with the English meaning and
  // the German word is the answer.
  const isEnglishToGerman = searchParams.get("direction") === "en-de";

  // The lesson and word type also come from the URL, e.g.
  // &lesson=2&type=verb (lesson=all and no type = everything).
  // lessonVocabulary is null while the lessons are still loading.
  const lessons = useLessons();
  const wordType = searchParams.get("type") ?? "all";
  const lessonChoice = lessons
    ? parseLessonChoice(searchParams.get("lesson"), lessons)
    : "all";
  const lessonVocabulary = lessons
    ? filterByWordType(selectLesson(lessons, lessonChoice).vocabulary, wordType)
    : null;

  // "← Back" returns to the lesson page this study session came from
  const backHref = `/lesson/${lessonChoice}`;

  // Remember this study session (its URL settings), so the "Continue"
  // card on Home can bring you straight back here.
  useEffect(() => {
    saveLastStudy(searchParams.toString());
  }, [searchParams]);

  const [index, setIndex] = useState(0);

  const [studyStatus, setStudyStatus] =
    useState<StudyStatus>(loadStudyStatus);

  // Flashcard Reveal Mode: when on, the answer is hidden until revealed.
  // Default (both directions):
  // - Off for "All words" (read through everything)
  // - On for "Learning" and "Mastered" (test yourself)
  // The toggle in the top bar can still change it.
  const [revealMode, setRevealMode] = useState(studyFilter !== "all");

  // Stores which word has been revealed. Moving to another word
  // automatically hides the answer again, because the word changes.
  const [revealedWord, setRevealedWord] = useState<string | null>(null);

  // Which way we last moved, so the new card slides in from the right
  // (Next) or from the left (Previous).
  const [moveDirection, setMoveDirection] = useState<"next" | "previous">(
    "next"
  );

  // Shuffle mode: when on, this holds the lesson words in a random order.
  // When off, it is null and the normal textbook order is used.
  // The order is made once when shuffle is turned on, so it stays the
  // same while you study (it doesn't reshuffle on every click).
  const [shuffledVocabulary, setShuffledVocabulary] = useState<
    VocabularyCard[] | null
  >(null);

  // Use the shuffled order if shuffle is on, otherwise the textbook order.
  const orderedVocabulary =
    shuffledVocabulary ?? lessonVocabulary ?? [];

  const visibleVocabulary = filterVocabulary(
    orderedVocabulary,
    studyStatus,
    studyFilter
  );

  // The word currently on screen (undefined while data is loading).
  const currentWord =
    visibleVocabulary[index >= visibleVocabulary.length ? 0 : index];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (visibleVocabulary.length === 0) return;

      // Spacebar → reveal the answer
      if (event.key === " " && currentWord) {
        event.preventDefault(); // stop the page from scrolling
        setRevealedWord(currentWord.word);
      }

      if (event.key === "ArrowRight") {
        setMoveDirection("next");
        setIndex(
          (currentIndex) => (currentIndex + 1) % visibleVocabulary.length
        );
      }

      if (event.key === "ArrowLeft") {
        setMoveDirection("previous");
        setIndex(
          (currentIndex) =>
            (currentIndex - 1 + visibleVocabulary.length) %
            visibleVocabulary.length
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visibleVocabulary.length, currentWord]);

  if (!lessonVocabulary) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  if (visibleVocabulary.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className={`${cardStyle} p-8 text-center`}>
          <div className="text-6xl mb-6">🎉</div>

          <h1 className="font-serif text-3xl font-semibold mb-3">
            No words here
          </h1>

          <p className="text-pencil mb-6">
            There are no{" "}
            {studyFilter === "all" ? "" : `${filterLabels[studyFilter]} `}
            words to study right now.
          </p>

          <Link
            href={backHref}
            className="inline-block px-5 py-2.5 rounded-xl bg-graphite text-paper font-semibold hover:bg-black"
          >
            Back to the lesson
          </Link>
        </div>
      </main>
    );
  }

  const safeIndex = index >= visibleVocabulary.length ? 0 : index;

  const word = visibleVocabulary[safeIndex];

  // e.g. "Verb", "Question Word"
  const partOfSpeech = formatPartOfSpeech(word.part_of_speech);

  // Show the answer if reveal mode is off, or this word was revealed.
  const showAnswer = !revealMode || revealedWord === word.word;

  function nextWord() {
    setMoveDirection("next");
    setIndex(
      (currentIndex) => (currentIndex + 1) % visibleVocabulary.length
    );
  }

  function previousWord() {
    setMoveDirection("previous");
    setIndex(
      (currentIndex) =>
        (currentIndex - 1 + visibleVocabulary.length) %
        visibleVocabulary.length
    );
  }

  function updateStudyStatus(status: "learning" | "mastered") {
    setStudyStatus((currentStatus) => {
      const updatedStatus = {
        ...currentStatus,
        [word.word]: status,
      };

      saveStudyStatus(updatedStatus);

      return updatedStatus;
    });
  }

  function toggleShuffle() {
    if (shuffledVocabulary) {
      setShuffledVocabulary(null); // back to textbook order
    } else {
      setShuffledVocabulary(shuffleArray(lessonVocabulary ?? []));
    }

    setIndex(0); // start from the first card of the new order
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-2 sm:p-6 overflow-x-clip">
      <div className={`${cardStyle} p-4 sm:p-6`}>
        <StudyTopBar
          backHref={backHref}
          filterLabel={filterLabels[studyFilter]}
          position={safeIndex + 1}
          total={visibleVocabulary.length}
          isShuffled={shuffledVocabulary !== null}
          onToggleShuffle={toggleShuffle}
          revealMode={revealMode}
          onToggleRevealMode={() => setRevealMode(!revealMode)}
        />

        {/* The card content. "key" makes React draw a fresh copy for each
            word, which plays the slide-in animation (see globals.css). */}

        <div
          key={word.word}
          className={
            moveDirection === "next" ? "card-in-next" : "card-in-previous"
          }
        >
          {/* Emoji visual. German → English: hidden until revealed, since it
              hints at the meaning. English → German: always shown as a hint. */}

          <div className="w-full h-14 sm:h-20 rounded-xl mb-2 bg-paper border border-grid flex items-center justify-center">
            <span className="text-4xl sm:text-6xl">
              {showAnswer || isEnglishToGerman ? word.emoji || "📝" : "❓"}
            </span>
          </div>

          {/* Question: the German word (DE → EN) or the English meaning (EN → DE) */}

          <div className="text-center">
            {isEnglishToGerman ? (
              <>
                {/* Same size as the English meaning in German → English, so
                    the German word is always the biggest thing on the card */}
                <h1 className="text-2xl mb-1">{word.english}</h1>

                <p className="text-sm text-pencil mb-3">{partOfSpeech}</p>
              </>
            ) : (
              <>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight mb-2">
                  <span className={highlighter}>
                    <GermanWord word={word} />
                  </span>
                </h1>

                {/* Part of speech and Listen on one row, to save space */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-sm text-pencil">{partOfSpeech}</span>
                  <ListenButton text={word.tts_text} />
                </div>
              </>
            )}
          </div>

          {/* Reveal button (only while the answer is hidden) */}

          {!showAnswer && (
            <div className="text-center mt-1">
              <button
                onClick={() => setRevealedWord(word.word)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-graphite text-paper font-semibold hover:bg-black ${pressable}`}
              >
                {isEnglishToGerman ? "Show German" : "Show meaning"}

                {/* Key hint, only on computers (phones have no Space key) */}
                <kbd className="hidden pointer-fine:inline px-1.5 py-0.5 rounded border border-paper/30 text-xs font-sans font-normal text-paper/80">
                  Space
                </kbd>
              </button>
            </div>
          )}

          {/* Answer: the other side of the card, plural, status buttons and examples */}

          {showAnswer && (
            <div className="reveal-fade">
              <div className="text-center">
                {isEnglishToGerman ? (
                  <>
                    <p className="font-serif text-3xl sm:text-4xl font-semibold leading-tight mb-2">
                      <span className={highlighter}>
                        <GermanWord word={word} />
                      </span>
                    </p>

                    {/* Listen is only shown now, since it would speak the answer */}
                    <ListenButton text={word.tts_text} className="mb-2" />
                  </>
                ) : (
                  <p className="text-2xl mb-1">{word.english}</p>
                )}

                {/* Always shown (N/A when there is none), so every card has
                    the same layout */}
                <p className="text-pencil">Plural: {word.plural || "N/A"}</p>
              </div>

              {/* Learning / Mastered: one switch with two sides */}

              <div
                className="grid grid-cols-2 gap-1 p-1 mx-auto max-w-64 mt-3 mb-3 rounded-xl bg-grid text-sm"
                role="group"
                aria-label="How well do you know this word?"
              >
                <button
                  onClick={() => updateStudyStatus("learning")}
                  aria-pressed={(studyStatus[word.word] || "learning") === "learning"}
                  className={`py-1.5 rounded-lg ${pressable} ${
                    (studyStatus[word.word] || "learning") === "learning"
                      ? "bg-white font-semibold shadow-sm"
                      : "text-pencil hover:text-graphite"
                  }`}
                >
                  Learning
                </button>

                <button
                  onClick={() => updateStudyStatus("mastered")}
                  aria-pressed={studyStatus[word.word] === "mastered"}
                  className={`py-1.5 rounded-lg ${pressable} ${
                    studyStatus[word.word] === "mastered"
                      ? "bg-marker font-semibold shadow-sm"
                      : "text-pencil hover:text-graphite"
                  }`}
                >
                  Mastered
                </button>
              </div>

              <ExampleSentences examples={word.examples} />
            </div>
          )}
        </div>

        {/* Navigation (sticks to the bottom of the screen if the card is
            taller than the screen, so Next is always reachable) */}

        <div className="sticky bottom-0 bg-white flex justify-between gap-2 mt-2 pt-2 pb-1 border-t border-grid">
          <button
            onClick={previousWord}
            className={`px-4 py-2 rounded-xl border border-graphite/15 bg-paper hover:bg-grid ${pressable}`}
          >
            ← Previous
          </button>

          <button
            onClick={nextWord}
            className={`px-5 py-2 rounded-xl bg-graphite text-paper font-semibold hover:bg-black ${pressable}`}
          >
            Next →
          </button>
        </div>
      </div>
    </main>
  );
}
