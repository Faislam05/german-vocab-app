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

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    const savedFavorites = localStorage.getItem("favorites");

    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);

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

  if (!lessonData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading vocabulary...</p>
      </main>
    );
  }

  const visibleVocabulary = showFavoritesOnly
    ? lessonData.vocabulary.filter((item) =>
        favorites.includes(item.word)
      )
    : lessonData.vocabulary;

  // Nothing has been favorited yet
  if (visibleVocabulary.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-6">☆</div>

          <h1 className="text-2xl font-bold mb-3">
            No favorites yet
          </h1>

          <p className="text-gray-500 mb-6">
            Star some vocabulary words first, then you can
            review them here.
          </p>

          <button
            onClick={() => {
              setShowFavoritesOnly(false);
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

  const word = visibleVocabulary[index];

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

  function toggleFavorite() {
    setFavorites((currentFavorites) => {
      let updatedFavorites: string[];

      if (currentFavorites.includes(word.word)) {
        updatedFavorites = currentFavorites.filter(
          (favorite) => favorite !== word.word
        );
      } else {
        updatedFavorites = [
          ...currentFavorites,
          word.word,
        ];
      }

      localStorage.setItem(
        "favorites",
        JSON.stringify(updatedFavorites)
      );

      return updatedFavorites;
    });
  }

  function toggleFavoritesView() {
    setShowFavoritesOnly((currentValue) => !currentValue);
    setIndex(0);
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-8 w-full max-w-md">
        {/* Lesson + progress */}

        <div className="mb-5">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{lessonData.title}</span>

            <span>
              {index + 1} / {visibleVocabulary.length}
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${
                  ((index + 1) /
                    visibleVocabulary.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Favorites controls */}

        <div className="flex items-center justify-between mb-5">
          <button
            onClick={toggleFavoritesView}
            className="px-3 py-1.5 rounded-full bg-gray-100 text-sm hover:bg-gray-200"
          >
            {showFavoritesOnly
              ? "Show All"
              : `★ Favorites (${favorites.length})`}
          </button>

          <button
            onClick={toggleFavorite}
            className="text-3xl hover:scale-110 transition-transform"
            aria-label="Toggle favorite"
          >
            {favorites.includes(word.word) ? "★" : "☆"}
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
            {formatPartOfSpeech(word.part_of_speech)}
          </span>
        </div>

        {/* Word */}

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

        {/* Example sentences */}

        <div className="text-left space-y-5 mt-6">
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