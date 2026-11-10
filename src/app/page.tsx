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
  examples: Example[];
  article?: string;
  gender?: string;
  plural?: string;
  emoji?: string;
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

  const word = lessonData.vocabulary[index];

  function speakWord() {
    const speech = new SpeechSynthesisUtterance(word.tts_text);
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
    if (!lessonData) return;

    setIndex((index + 1) % lessonData.vocabulary.length);
  }

  function previousWord() {
    if (!lessonData) return;

    setIndex(
      (index - 1 + lessonData.vocabulary.length) %
        lessonData.vocabulary.length
    );
  }

  function formatPartOfSpeech(value: string) {
    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function toggleFavorite() {
    setFavorites((currentFavorites) => {
      let updatedFavorites: string[];

      if (currentFavorites.includes(word.word)) {
        updatedFavorites = currentFavorites.filter(
          (favorite) => favorite !== word.word
        );
      } else {
        updatedFavorites = [...currentFavorites, word.word];
      }

      localStorage.setItem(
        "favorites",
        JSON.stringify(updatedFavorites)
      );

      return updatedFavorites;
    });
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{lessonData.title}</span>
            <span>
              {index + 1} / {lessonData.vocabulary.length}
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${
                  ((index + 1) / lessonData.vocabulary.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <button
          onClick={toggleFavorite}
          className="text-2xl"
          aria-label="Toggle favorite"
        >
          {favorites.includes(word.word) ? "★" : "☆"}
        </button>

        <div className="w-full aspect-[4/3] rounded-2xl mb-6 bg-gray-100 flex items-center justify-center">
          <span className="text-8xl">
            {word.emoji || "📝"}
          </span>
        </div>

        <div className="flex justify-center mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
            {formatPartOfSpeech(word.part_of_speech)}
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-4">
          {word.display}
        </h1>

        <button
          onClick={speakWord}
          className="mb-6 px-4 py-2 rounded-full bg-black text-white"
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

        <div className="text-left space-y-4">
          {word.examples.map((example, exampleIndex) => (
            <div key={exampleIndex}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">
                  {example.de}
                </p>

                <button
                  onClick={() => speakText(example.de)}
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
          ))}
        </div>

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