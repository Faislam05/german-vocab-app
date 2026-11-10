"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LESSON_FILE,
  LessonData,
  StudyFilter,
  StudyStatus,
  VocabularyCard,
  filterVocabulary,
  loadStudyStatus,
  saveStudyStatus,
  shuffleArray,
} from "@/lib/vocabulary";

const filterLabels: Record<StudyFilter, string> = {
  all: "All",
  learning: "Learning",
  known: "Known",
};

export default function StudySession() {
  // The filter comes from the URL, e.g. /study?filter=learning
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const studyFilter: StudyFilter =
    filterParam === "learning" || filterParam === "known"
      ? filterParam
      : "all";

  // The direction also comes from the URL, e.g. &direction=en-de
  // English → German: the card asks with the English meaning and
  // the German word is the answer.
  const isEnglishToGerman = searchParams.get("direction") === "en-de";

  const [lessonData, setLessonData] = useState<LessonData | null>(null);

  const [index, setIndex] = useState(0);

  const [studyStatus, setStudyStatus] =
    useState<StudyStatus>(loadStudyStatus);

  // Flashcard Reveal Mode: when on, the answer is hidden until revealed.
  const [revealMode, setRevealMode] = useState(true);

  // Stores which word has been revealed. Moving to another word
  // automatically hides the answer again, because the word changes.
  const [revealedWord, setRevealedWord] = useState<string | null>(null);

  // Shuffle mode: when on, this holds the lesson words in a random order.
  // When off, it is null and the normal textbook order is used.
  // The order is made once when shuffle is turned on, so it stays the
  // same while you study (it doesn't reshuffle on every click).
  const [shuffledVocabulary, setShuffledVocabulary] = useState<
    VocabularyCard[] | null
  >(null);

  useEffect(() => {
    fetch(LESSON_FILE)
      .then((response) => response.json())
      .then((data) => {
        setLessonData(data);
      })
      .catch((error) => {
        console.error("Error loading lesson data:", error);
      });
  }, []);

  // Use the shuffled order if shuffle is on, otherwise the textbook order.
  const orderedVocabulary =
    shuffledVocabulary ?? lessonData?.vocabulary ?? [];

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
        setIndex(
          (currentIndex) => (currentIndex + 1) % visibleVocabulary.length
        );
      }

      if (event.key === "ArrowLeft") {
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

  if (!lessonData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  if (visibleVocabulary.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-6">🎉</div>

          <h1 className="text-2xl font-bold mb-3">No words here</h1>

          <p className="text-gray-500 mb-6">
            There are no {filterLabels[studyFilter]} words to study right
            now.
          </p>

          <Link
            href="/"
            className="inline-block px-5 py-2 rounded-full bg-black text-white"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const safeIndex = index >= visibleVocabulary.length ? 0 : index;

  const word = visibleVocabulary[safeIndex];

  // Show the answer if reveal mode is off, or this word was revealed.
  const showAnswer = !revealMode || revealedWord === word.word;

  function formatPartOfSpeech(value: string) {
    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function speakText(text: string) {
    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "de-DE";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  function nextWord() {
    setIndex(
      (currentIndex) => (currentIndex + 1) % visibleVocabulary.length
    );
  }

  function previousWord() {
    setIndex(
      (currentIndex) =>
        (currentIndex - 1 + visibleVocabulary.length) %
        visibleVocabulary.length
    );
  }

  function updateStudyStatus(status: "learning" | "known") {
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
      setShuffledVocabulary(shuffleArray(lessonData?.vocabulary ?? []));
    }

    setIndex(0); // start from the first card of the new order
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-5 sm:p-6 w-full max-w-md">
        {/* Top bar: back to Home, filter name, shuffle + flashcard toggles */}

        <div className="flex items-center justify-between gap-2 whitespace-nowrap text-xs sm:text-sm mb-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900">
            ← Home
          </Link>

          <span className="px-3 py-1 rounded-full bg-gray-100">
            {filterLabels[studyFilter]} · {safeIndex + 1} /{" "}
            {visibleVocabulary.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${
                shuffledVocabulary ? "bg-black" : "bg-gray-100"
              }`}
              aria-label={shuffledVocabulary ? "Turn shuffle off" : "Shuffle words"}
              title={shuffledVocabulary ? "Shuffle: On" : "Shuffle: Off"}
            >
              🔀
            </button>

            <button
              onClick={() => setRevealMode(!revealMode)}
              className="text-gray-500 hover:text-gray-900"
            >
              Flashcard: {revealMode ? "On" : "Off"}
            </button>
          </div>
        </div>

        {/* Progress bar */}

        <div className="mb-4">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${((safeIndex + 1) / visibleVocabulary.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Emoji visual. German → English: hidden until revealed, since it
            hints at the meaning. English → German: always shown as a hint. */}

        <div className="w-full h-16 sm:h-24 rounded-2xl mb-3 bg-gray-100 flex items-center justify-center">
          <span className="text-4xl sm:text-6xl">
            {showAnswer || isEnglishToGerman ? word.emoji || "📝" : "❓"}
          </span>
        </div>

        {/* Part of speech */}

        <div className="flex justify-center mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
            {formatPartOfSpeech(word.part_of_speech)}
          </span>
        </div>

        {/* Question: the German word (DE → EN) or the English meaning (EN → DE) */}

        <div className="text-center">
          {isEnglishToGerman ? (
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
              {word.english}
            </h1>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {word.display}
              </h1>

              <button
                onClick={() => speakText(word.tts_text)}
                className="mb-3 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800"
              >
                🔊 Listen
              </button>
            </>
          )}
        </div>

        {/* Reveal button (only while the answer is hidden) */}

        {!showAnswer && (
          <div className="text-center">
            <button
              onClick={() => setRevealedWord(word.word)}
              className="px-6 py-3 rounded-full bg-black text-white hover:bg-gray-800"
            >
              {isEnglishToGerman ? "Show German" : "Show Meaning"}
            </button>

            <p className="text-xs text-gray-400 mt-2">or press Space</p>
          </div>
        )}

        {/* Answer: the other side of the card, plural, status buttons and examples */}

        {showAnswer && (
          <>
            <div className="text-center">
              {isEnglishToGerman ? (
                <>
                  <p className="text-3xl sm:text-4xl font-bold mb-2">
                    {word.display}
                  </p>

                  {/* Listen is only shown now, since it would speak the answer */}
                  <button
                    onClick={() => speakText(word.tts_text)}
                    className="mb-2 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800"
                  >
                    🔊 Listen
                  </button>
                </>
              ) : (
                <p className="text-2xl mb-2">{word.english}</p>
              )}

              {word.plural && (
                <p className="text-gray-500">Plural: {word.plural}</p>
              )}
            </div>

            {/* Learning / Known buttons */}

            <div className="flex justify-center gap-2 mt-4 mb-4">
              <button
                onClick={() => updateStudyStatus("learning")}
                className={`px-4 py-2 rounded-full text-sm ${
                  (studyStatus[word.word] || "learning") === "learning"
                    ? "bg-black text-white"
                    : "bg-gray-200"
                }`}
              >
                Learning
              </button>

              <button
                onClick={() => updateStudyStatus("known")}
                className={`px-4 py-2 rounded-full text-sm ${
                  studyStatus[word.word] === "known"
                    ? "bg-black text-white"
                    : "bg-gray-200"
                }`}
              >
                Known
              </button>
            </div>

            {/* Example sentences */}

            <div className="text-left text-sm sm:text-base space-y-2">
              {word.examples.map((example, exampleIndex) => (
                <div key={exampleIndex}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{example.de}</p>

                    <button
                      onClick={() => speakText(example.de)}
                      className="text-lg hover:scale-110 transition-transform"
                      aria-label="Listen to sentence"
                    >
                      🔊
                    </button>
                  </div>

                  <p className="text-gray-500">{example.en}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Navigation (sticks to the bottom of the screen if the card is
            taller than the screen, so Next is always reachable) */}

        <div className="sticky bottom-0 bg-white flex justify-between mt-2 pt-2 pb-1">
          <button
            onClick={previousWord}
            className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            ← Previous
          </button>

          <button
            onClick={nextWord}
            className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            Next →
          </button>
        </div>
      </div>
    </main>
  );
}
