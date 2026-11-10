"use client";

import { useEffect, useState } from "react";

type Example = {
  de: string;
  en: string;
};

type VocabularyCard = {
  word: string;
  display: string;
  part_of_speech: string;
  english: string;
  cefr: string;
  lesson: number;
  references: number[];
  tts_text: string;
  image_search: string;
  emoji?: string;
  examples: Example[];
  article?: string;
  gender?: string;
  plural?: string;
};

type LessonData = {
  lesson: number;
  title: string;
  cefr: string;
  vocabulary: VocabularyCard[];
};

export default function Home() {
  const [lessonData, setLessonData] = useState<LessonData | null>(null);

  const [index, setIndex] = useState(0);

  const [studyStatus, setStudyStatus] = useState<
    Record<string, string>
  >(() => {
    if (typeof window === "undefined") return {};

    const savedStatus = localStorage.getItem("studyStatus");

    return savedStatus ? JSON.parse(savedStatus) : {};
  });

  const [studyFilter, setStudyFilter] = useState<
    "all" | "learning" | "known"
  >("all");

  useEffect(() => {
    fetch("/data/lektion_01_enriched_with_emojis.json")
      .then((response) => response.json())
      .then((data) => {
        setLessonData(data);
      })
      .catch((error) => {
        console.error("Error loading lesson data:", error);
      });
  }, []);

  let visibleVocabulary = lessonData?.vocabulary ?? [];

  if (studyFilter === "learning") {
    visibleVocabulary = visibleVocabulary.filter(
      (item) => studyStatus[item.word] !== "known"
    );
  }

  if (studyFilter === "known") {
    visibleVocabulary = visibleVocabulary.filter(
      (item) => studyStatus[item.word] === "known"
    );
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (visibleVocabulary.length === 0) return;

      if (event.key === "ArrowRight") {
        setIndex(
          (currentIndex) =>
            (currentIndex + 1) % visibleVocabulary.length
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
  }, [visibleVocabulary.length]);

  if (!lessonData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  const knownCount = lessonData.vocabulary.filter(
    (item) => studyStatus[item.word] === "known"
  ).length;

  const learningCount =
    lessonData.vocabulary.length - knownCount;

  if (visibleVocabulary.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-6">📚</div>

          <h1 className="text-2xl font-bold mb-3">
            No words here
          </h1>

          <p className="text-gray-500 mb-6">
            There are currently no vocabulary words in this filter.
          </p>

          <button
            onClick={() => {
              setStudyFilter("all");
              setIndex(0);
            }}
            className="px-5 py-2 rounded-full bg-black text-white"
          >
            Show All Words
          </button>
        </div>
      </main>
    );
  }

  const safeIndex =
    index >= visibleVocabulary.length ? 0 : index;

  const word = visibleVocabulary[safeIndex];

  function formatPartOfSpeech(value: string) {
    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function speakWord() {
    const speech = new SpeechSynthesisUtterance(
      word.tts_text
    );

    speech.lang = "de-DE";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  function speakText(text: string) {
    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "de-DE";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  function nextWord() {
    setIndex(
      (currentIndex) =>
        (currentIndex + 1) % visibleVocabulary.length
    );
  }

  function previousWord() {
    setIndex(
      (currentIndex) =>
        (currentIndex - 1 + visibleVocabulary.length) %
        visibleVocabulary.length
    );
  }

  function updateStudyStatus(
    status: "learning" | "known"
  ) {
    setStudyStatus((currentStatus) => {
      const updatedStatus = {
        ...currentStatus,
        [word.word]: status,
      };

      localStorage.setItem(
        "studyStatus",
        JSON.stringify(updatedStatus)
      );

      return updatedStatus;
    });
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-8 w-full max-w-md">
        {/* Lesson + progress */}

        <div className="mb-5">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{lessonData.title}</span>

            <span>
              {safeIndex + 1} / {visibleVocabulary.length}
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${
                  ((safeIndex + 1) /
                    visibleVocabulary.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Progress counters */}

        <div className="flex justify-center gap-4 mb-4 text-sm">
          <span className="px-3 py-1 rounded-full bg-gray-100">
            Learning: {learningCount}
          </span>

          <span className="px-3 py-1 rounded-full bg-gray-100">
            Known: {knownCount}
          </span>
        </div>

        {/* Study filters */}

        <div className="flex justify-center gap-2 mb-5">
          <button
            onClick={() => {
              setStudyFilter("all");
              setIndex(0);
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              studyFilter === "all"
                ? "bg-black text-white"
                : "bg-gray-100"
            }`}
          >
            All
          </button>

          <button
            onClick={() => {
              setStudyFilter("learning");
              setIndex(0);
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              studyFilter === "learning"
                ? "bg-black text-white"
                : "bg-gray-100"
            }`}
          >
            Learning
          </button>

          <button
            onClick={() => {
              setStudyFilter("known");
              setIndex(0);
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              studyFilter === "known"
                ? "bg-black text-white"
                : "bg-gray-100"
            }`}
          >
            Known
          </button>
        </div>

        {/* Emoji visual */}

        <div className="w-full aspect-[4/3] rounded-2xl mb-6 bg-gray-100 flex items-center justify-center">
          <span className="text-8xl">
            {word.emoji || "📝"}
          </span>
        </div>

        {/* Part of speech */}

        <div className="flex justify-center mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
            {formatPartOfSpeech(
              word.part_of_speech
            )}
          </span>
        </div>

        {/* Main word */}

        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {word.display}
          </h1>

          <button
            onClick={speakWord}
            className="mb-6 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800"
          >
            🔊 Listen
          </button>

          <p className="text-2xl mb-2">
            {word.english}
          </p>

          {word.plural && (
            <p className="text-gray-500 mb-6">
              Plural: {word.plural}
            </p>
          )}
        </div>

        {/* Learning / Known buttons */}

        <div className="flex justify-center gap-2 mt-6 mb-6">
          <button
            onClick={() =>
              updateStudyStatus("learning")
            }
            className={`px-4 py-2 rounded-full text-sm ${
              (studyStatus[word.word] ||
                "learning") === "learning"
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            Learning
          </button>

          <button
            onClick={() =>
              updateStudyStatus("known")
            }
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

        <div className="text-left space-y-5">
          {word.examples.map(
            (example, exampleIndex) => (
              <div key={exampleIndex}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">
                    {example.de}
                  </p>

                  <button
                    onClick={() =>
                      speakText(example.de)
                    }
                    className="text-lg hover:scale-110 transition-transform"
                    aria-label="Listen to sentence"
                  >
                    🔊
                  </button>
                </div>

                <p className="text-gray-500">
                  {example.en}
                </p>
              </div>
            )
          )}
        </div>

        {/* Navigation */}

        <div className="flex justify-between mt-8">
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