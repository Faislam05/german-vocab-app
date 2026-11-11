import { SpeakerIcon, speakGerman } from "@/components/ListenButton";
import { Example } from "@/lib/vocabulary";

type ExampleSentencesProps = {
  examples: Example[];
};

// The example sentences in a soft white panel on the card: each one with
// a round listen button, the German sentence and its English translation
// in italics, separated by thin lines in the card's colour.
export default function ExampleSentences({ examples }: ExampleSentencesProps) {
  return (
    <div className="text-left rounded-2xl bg-white/75 border border-white px-3 divide-y divide-[color-mix(in_srgb,var(--card-accent)_15%,transparent)]">
      {examples.map((example, exampleIndex) => (
        <div key={exampleIndex} className="flex items-start gap-2.5 py-1.5">
          <button
            onClick={() => speakGerman(example.de)}
            aria-label="Listen to sentence"
            className="shrink-0 mt-0.5 grid place-items-center w-7 h-7 rounded-full bg-[color-mix(in_srgb,var(--card-accent)_12%,white)] text-(--card-accent) hover:bg-[color-mix(in_srgb,var(--card-accent)_22%,white)] transition-[transform,background-color] duration-150 ease-out active:scale-[0.9]"
          >
            <SpeakerIcon className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <p className="text-sm sm:text-base font-bold leading-5 sm:leading-6">
              {example.de}
            </p>
            <p className="text-[13px] sm:text-sm italic text-pencil leading-4 sm:leading-5">
              {example.en}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
