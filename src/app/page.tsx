"use client";

import { useState } from "react";

export default function Home() {
  const words = [
    {
      display: "der Monat",
      english: "month",
      plural: "die Monate",
      examples: [
        {
          de: "Der Monat hat vier Wochen.",
          en: "The month has four weeks.",
        },
        {
          de: "Ich bleibe einen Monat hier.",
          en: "I am staying here for one month.",
        },
        {
          de: "Nächsten Monat fahre ich nach Berlin.",
          en: "Next month I am going to Berlin.",
        },
      ],
    },
    {
      display: "der Beruf",
      english: "profession",
      plural: "die Berufe",
      examples: [
        {
          de: "Mein Beruf ist interessant.",
          en: "My profession is interesting.",
        },
        {
          de: "Was sind Sie von Beruf?",
          en: "What is your profession?",
        },
        {
          de: "Er sucht einen neuen Beruf.",
          en: "He is looking for a new profession.",
        },
      ],
    },
    {
      display: "die Straße",
      english: "street",
      plural: "die Straßen",
      examples: [
        {
          de: "Die Straße ist sehr lang.",
          en: "The street is very long.",
        },
        {
          de: "Ich wohne in dieser Straße.",
          en: "I live on this street.",
        },
        {
          de: "Wie heißt diese Straße?",
          en: "What is this street called?",
        },
      ],
    },
  ];

  const [index, setIndex] = useState(0);

  const word = words[index];

  function speakWord() {
    const speech = new SpeechSynthesisUtterance(word.display);
    speech.lang = "de-DE";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  function nextWord() {
    setIndex((index + 1) % words.length);
  }

  function previousWord() {
    setIndex((index - 1 + words.length) % words.length);
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
        <p className="text-sm text-gray-500 mb-2">
          Lektion 1
        </p>

        <p className="text-sm text-gray-400 mb-4">
          {index + 1} / {words.length}
        </p>

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

        <p className="text-gray-500 mb-6">
          Plural: {word.plural}
        </p>

        <div className="text-left space-y-4">
          {word.examples.map((example, exampleIndex) => (
            <div key={exampleIndex}>
              <p className="font-semibold">
                {example.de}
              </p>

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