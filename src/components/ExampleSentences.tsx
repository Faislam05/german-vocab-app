import { SpeakerIcon, speakGerman } from "@/components/ListenButton";
import { Example } from "@/lib/vocabulary";

type ExampleSentencesProps = {
  examples: Example[];
};

// The example sentences on a frosted white panel under a small "EXAMPLE
// SENTENCES" heading: each one with a round listen button, the German
// sentence and its English translation in italics, separated by thin
// lines in the word's colour.
export default function ExampleSentences({ examples }: ExampleSentencesProps) {
  return (
    <div className="text-left rounded-2xl bg-white/65 border border-white shadow-[0_4px_14px_color-mix(in_srgb,var(--card-accent)_10%,transparent)] px-3 pt-2.5">
      <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-(--card-accent)">
        Example sentences
        <span
          className="flex-1 h-px bg-[color-mix(in_srgb,var(--card-accent)_20%,transparent)]"
          aria-hidden="true"
        />
      </p>

      <div className="divide-y divide-[color-mix(in_srgb,var(--card-accent)_15%,transparent)]">
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
    </div>
  );
}
