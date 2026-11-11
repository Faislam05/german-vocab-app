"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import StudyTopBar from "@/components/StudyTopBar";
import WordCard, { cardFrame, cardStyle } from "@/components/WordCard";
import { useLessons } from "@/lib/useLessons";
import {
  StudyFilter,
  StudyStatus,
  VocabularyCard,
  filterByWordType,
  filterVocabulary,
  loadStudyStatus,
  parseLessonChoice,
  saveLastStudy,
  saveStudyStatus,
  selectLesson,
  shuffleArray,
} from "@/lib/vocabulary";

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
        <div className={`${cardStyle} ${cardFrame()} p-8 text-center`}>
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
            className="btn-primary inline-block px-6 py-2.5"
          >
            Back to the lesson
          </Link>
        </div>
      </main>
    );
  }

  const safeIndex = index >= visibleVocabulary.length ? 0 : index;

  const word = visibleVocabulary[safeIndex];

  const isMastered = studyStatus[word.word] === "mastered";

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

  // The card starts at the top (not centred), so it doesn't move up and
  // down when the next word has more or fewer example sentences.
  return (
    <main className="min-h-screen flex justify-center items-start p-2 sm:px-6 sm:pt-10 overflow-x-clip">
      <div className={`${cardStyle} ${cardFrame(word)} p-3 sm:p-5`}>
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
          <WordCard
            word={word}
            isEnglishToGerman={isEnglishToGerman}
            showAnswer={showAnswer}
            onReveal={() => setRevealedWord(word.word)}
            actions={
              /* One button: "Mark as Mastered" ⇄ "Mastered" (with a star) */
              <div className="flex justify-center mb-3">
                <button
                  onClick={() =>
                    updateStudyStatus(isMastered ? "learning" : "mastered")
                  }
                  aria-pressed={isMastered}
                  className={`inline-flex items-center gap-1.5 px-5 py-1.5 text-sm ${
                    isMastered ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  <StarIcon filled={isMastered} />
                  {isMastered ? "Mastered" : "Mark as Mastered"}
                </button>
              </div>
            }
          />
        </div>

        {/* Navigation (sticks to the bottom of the screen if the card is
            taller than the screen, so Next is always reachable) */}

        <div className="sticky bottom-0 bg-(--card-bottom) flex gap-2.5 mt-2 pt-2.5 pb-1.5 border-t border-white/80">
          <button
            onClick={previousWord}
            aria-label="Previous word"
            className="btn-secondary shrink-0 w-12 h-11 text-lg"
          >
            ←
          </button>

          <button onClick={nextWord} className="btn-primary flex-1 h-11">
            Next →
          </button>
        </div>
      </div>
    </main>
  );
}

// A star: outlined = not Mastered yet, filled = Mastered
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z" />
    </svg>
  );
}
