import { useEffect, useRef, useState } from "react";
import ExampleSentences from "@/components/ExampleSentences";
import GermanWord from "@/components/GermanWord";
import { SpeakerIcon, speakGerman } from "@/components/ListenButton";
import { VocabularyCard, formatPartOfSpeech } from "@/lib/vocabulary";

// Styles shared by the Study and Daily review screens.

// The card's shape: rounded corners and a soft shadow. Its look (white
// frame, coloured body) is added with cardFrame() below.
export const cardStyle =
  "overflow-clip rounded-[28px] shadow-[0_1px_2px_rgba(46,50,56,0.08),0_10px_28px_rgba(46,50,56,0.12)] w-full max-w-md sm:max-w-lg";

// Small press feedback for buttons
export const pressable =
  "transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]";

// Every card has a colour theme, like a trading card: the gender colour
// for nouns (der navy, die maroon, das dark green, plural dark amber),
// yellow for all other words. The colours themselves are in globals.css
// (.theme-masculine, .theme-feminine, …).
function cardTheme(word: VocabularyCard) {
  switch (word.gender) {
    case "masculine":
      return "theme-masculine";
    case "feminine":
      return "theme-feminine";
    case "neuter":
      return "theme-neuter";
    case "plural":
      return "theme-plural";
    default:
      return "theme-other";
  }
}

// The card's look: a thick white frame around a plain background in the
// word's colour (the "card-art" class in globals.css).
// Without a word (e.g. "No words here") it is plain cream paper.
export function cardFrame(word?: VocabularyCard) {
  return word
    ? `card-art ${cardTheme(word)} border-[10px] sm:border-[12px] border-white ring-1 ring-graphite/10`
    : "cardstock border border-graphite/10";
}

// Text sizes for the word, largest first. If the word doesn't fit in
// the pill, it steps down to the next size (see WordPill).
const WORD_SIZES = [
  "text-2xl sm:text-3xl",
  "text-xl sm:text-2xl",
  "text-lg sm:text-xl",
  "text-base sm:text-lg", // only a few very long words on small phones
];
const SMALL_SIZES = [
  "text-lg sm:text-2xl",
  "text-base sm:text-xl",
  "text-sm sm:text-lg",
];

// The word in a white pill. With `listen`, a speaker button sits inside
// the pill on the left (only for German text). `heading` makes the text
// the page's main heading (the question of the card).
//
// Every pill has the same width (the card minus a space on each side),
// so cards look alike and there is always room on the left for
// `beside` (e.g. the fox after "Again"). The word is centred in it.
// Long words get smaller text: the pill checks whether the word sticks
// out, or needs more lines than `maxLines`, and if so steps down a size. (Each word gets its own pill, see `key` below, so every
// word starts again at the largest size.)
function WordPill({
  children,
  listen,
  heading = false,
  small = false,
  maxLines = 2,
  beside,
}: {
  children: React.ReactNode;
  listen?: string;
  heading?: boolean;
  small?: boolean; // smaller text, for the English question (EN → DE)
  maxLines?: number; // more lines than this: smaller text
  beside?: React.ReactNode; // shown in the space to the left of the pill
}) {
  const Text = heading ? "h1" : "span";
  const sizes = small ? SMALL_SIZES : WORD_SIZES;

  // Which text size is used (0 = the largest)
  // (typed for both the <h1> and the <span> it can be)
  const textRef = useRef<HTMLHeadingElement & HTMLSpanElement>(null);
  const [sizeStep, setSizeStep] = useState(0);

  // Checked whenever the word's size changes (ResizeObserver), so also
  // again right after stepping down a size
  useEffect(() => {
    const text = textRef.current;
    if (!text) return;

    const observer = new ResizeObserver(() => {
      const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
      const sticksOut = text.scrollWidth > text.clientWidth + 1;
      const tooManyLines = text.offsetHeight > lineHeight * (maxLines + 0.5);

      if (sticksOut || tooManyLines) {
        setSizeStep((step) => Math.min(step + 1, sizes.length - 1));
      }
    });
    observer.observe(text);
    return () => observer.disconnect();
  }, [sizes.length, maxLines]);

  return (
    <div className="flex justify-center mb-1.5">
      <div className="relative flex items-center gap-2.5 w-[calc(100%-5.5rem)] pl-1.5 pr-5 py-1.5 rounded-full bg-white border-2 border-[color-mix(in_srgb,var(--card-accent)_30%,transparent)] shadow-sm">
        {/* Something in the space left of the pill (never takes clicks).
            Lined up with the pill's top, so anything above it (like the
            fox's speech bubble) stays above the pill, even when a long
            word makes the pill two lines tall. */}
        {beside && (
          <div className="absolute right-full top-0 mr-0.5 w-max pointer-events-none">
            {beside}
          </div>
        )}

        {listen ? (
          <>
            <button
              onClick={() => speakGerman(listen)}
              aria-label="Listen"
              className={`shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-(--card-accent) text-white hover:opacity-90 ${pressable}`}
            >
              <SpeakerIcon className="w-5 h-5" />
            </button>
            <span className="shrink-0 w-0.5 h-7 rounded-full bg-[color-mix(in_srgb,var(--card-accent)_25%,transparent)]" />
          </>
        ) : (
          <span className="w-3" />
        )}

        <Text
          ref={textRef}
          className={`flex-1 min-w-0 text-center leading-tight ${
            small ? "font-sans font-bold" : "font-serif font-semibold"
          } ${sizes[sizeStep]}`}
        >
          {children}
        </Text>
      </div>
    </div>
  );
}

type WordCardProps = {
  word: VocabularyCard;

  // true = the card asks with English, the German word is the answer
  isEnglishToGerman: boolean;

  // true = the answer side is visible
  showAnswer: boolean;

  // If given, a "Show meaning" button is drawn while the answer is hidden.
  // (Daily review draws its own button at the bottom instead.)
  onReveal?: () => void;

  // Extra buttons shown under the answer, e.g. the Learning / Mastered
  // switch on the Study screen
  actions?: React.ReactNode;

  // Something shown just to the left of the word, e.g. the fox saying
  // "Kein Problem!" in Daily review
  besideWord?: React.ReactNode;
};

// The content of one flashcard: the picture (emoji), the word, its type,
// the answer (meaning, plural) and the example sentences. The screen
// around it decides what happens when you answer; this component only
// shows the word.
export default function WordCard({
  word,
  isEnglishToGerman,
  showAnswer,
  onReveal,
  actions,
  besideWord,
}: WordCardProps) {
  // e.g. "Verb", "Question Word"
  const partOfSpeech = formatPartOfSpeech(word.part_of_speech);

  // German → English: the picture is hidden until revealed, since it
  // hints at the meaning. English → German: always shown as a hint.
  const picture = showAnswer || isEnglishToGerman ? word.emoji || "📝" : "❓";

  return (
    <>
      {/* The picture: a big emoji on a soft white spotlight, and the
          level badge (A1). Smaller on short screens. */}

      <div className="relative h-20 sm:h-24 [@media(max-height:700px)]:h-16 mb-2 flex items-center justify-center">
        <div className="absolute w-20 h-20 sm:w-24 sm:h-24 [@media(max-height:700px)]:w-16 [@media(max-height:700px)]:h-16 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.9),rgb(255_255_255/0)_70%)]" />

        <span className="relative text-5xl sm:text-6xl [@media(max-height:700px)]:text-4xl drop-shadow-sm">
          {picture}
        </span>

        {/* Level badge */}
        <span className="absolute right-0 top-0 grid place-items-center w-11 h-11 rounded-full bg-(--card-accent) text-white text-sm font-extrabold">
          <span className="absolute inset-1 rounded-full border border-dashed border-white/60" />
          {word.cefr || "A1"}
        </span>
      </div>

      {/* Question: the German word (DE → EN) or the English meaning (EN → DE) */}

      {isEnglishToGerman ? (
        <WordPill key={word.word} heading small beside={besideWord}>
          {word.english}
        </WordPill>
      ) : (
        <WordPill
          key={word.word}
          listen={word.tts_text}
          heading
          beside={besideWord}
        >
          <GermanWord word={word} />
        </WordPill>
      )}

      {/* English → German, once revealed: the German word in its own pill */}

      {isEnglishToGerman && showAnswer && (
        <div className="reveal-fade">
          <WordPill key={word.word} listen={word.tts_text} maxLines={1}>
            <GermanWord word={word} />
          </WordPill>
        </div>
      )}

      {/* Chips: the word type (dark) and, once revealed, the meaning
          (light) */}

      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1.5">
        <span className="px-3 py-0.5 rounded-full bg-(--card-accent) text-white text-sm font-bold">
          {partOfSpeech}
        </span>

        {showAnswer && !isEnglishToGerman && (
          <span className="reveal-fade px-3.5 py-0.5 rounded-full bg-white/85 border border-white text-base font-bold">
            {word.english}
          </span>
        )}
      </div>

      {/* The plural, always on its own line under the chips (N/A when
          there is none), so every card has the same layout */}

      {showAnswer && (
        <div className="reveal-fade flex justify-center mb-2">
          <span className="px-3 py-0.5 rounded-full bg-white/60 text-sm text-pencil font-semibold">
            Plural: {word.plural || "N/A"}
          </span>
        </div>
      )}

      {/* Reveal button (only while the answer is hidden) */}

      {!showAnswer && onReveal && (
        <div className="text-center mt-2">
          <button
            onClick={onReveal}
            className="btn-primary inline-flex items-center gap-2 px-7 py-2.5"
          >
            {isEnglishToGerman ? "Show German" : "Show meaning"}

            {/* Key hint, only on computers (phones have no Space key) */}
            <kbd className="hidden pointer-fine:inline px-1.5 py-0.5 rounded border border-paper/30 text-xs font-sans font-normal text-paper/80">
              Space
            </kbd>
          </button>
        </div>
      )}

      {/* Answer: actions (e.g. Learning / Mastered) and examples */}

      {showAnswer && (
        <div className="reveal-fade">
          {actions ?? <div className="h-1" />}

          <ExampleSentences examples={word.examples} />
        </div>
      )}
    </>
  );
}
