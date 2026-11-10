"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LESSON_FILE,
  LessonData,
  StudyFilter,
  StudyStatus,
  filterVocabulary,
  loadStudyStatus,
  saveStudyStatus,
} from "@/lib/vocabulary";

const filterLabels: Record<StudyFilter, string> = {
  all: "All words",
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

  const [lessonData, setLessonData] = useState<LessonData | null>(null);

  const [index, setIndex] = useState(0);

  const [studyStatus, setStudyStatus] =
    useState<StudyStatus>(loadStudyStatus);

  // Flashcard Reveal Mode: when on, the answer is hidden until revealed.
  const [revealMode, setRevealMode] = useState(true);

  // Stores which word has been revealed. Moving to another word
  // automatically hides the answer again, because the word changes.
  const [revealedWord, setRevealedWord] = useState<string | null>(null);

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

  const visibleVocabulary = filterVocabulary(
    lessonData?.vocabulary ?? [],
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

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-5 sm:p-6 w-full max-w-md">
        {/* Top bar: back to Home, filter name, flashcard toggle */}

        <div className="flex items-center justify-between text-sm mb-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900">
            ← Home
          </Link>

          <span className="px-3 py-1 rounded-full bg-gray-100">
            {filterLabels[studyFilter]} · {safeIndex + 1} /{" "}
            {visibleVocabulary.length}
          </span>

          <button
            onClick={() => setRevealMode(!revealMode)}
            className="text-gray-500 hover:text-gray-900"
          >
            Flashcard: {revealMode ? "On" : "Off"}
          </button>
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

        {/* Emoji visual (hidden until revealed, since it hints at the meaning) */}

        <div className="w-full h-20 sm:h-24 rounded-2xl mb-3 bg-gray-100 flex items-center justify-center">
          <span className="text-5xl sm:text-6xl">
            {showAnswer ? word.emoji || "📝" : "❓"}
          </span>
        </div>

        {/* Part of speech */}

        <div className="flex justify-center mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
            {formatPartOfSpeech(word.part_of_speech)}
          </span>
        </div>

        {/* Main word */}

        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{word.display}</h1>

          <button
            onClick={() => speakText(word.tts_text)}
            className="mb-3 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800"
          >
            🔊 Listen
          </button>
        </div>

        {/* Show Meaning button (only while the answer is hidden) */}

        {!showAnswer && (
          <div className="text-center">
            <button
              onClick={() => setRevealedWord(word.word)}
              className="px-6 py-3 rounded-full bg-black text-white hover:bg-gray-800"
            >
              Show Meaning
            </button>

            <p className="text-xs text-gray-400 mt-2">or press Space</p>
          </div>
        )}

        {/* Answer: meaning, plural, status buttons and examples */}

        {showAnswer && (
          <>
            <div className="text-center">
              <p className="text-2xl mb-2">{word.english}</p>

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

        {/* Navigation */}

        <div className="flex justify-between mt-4">
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
