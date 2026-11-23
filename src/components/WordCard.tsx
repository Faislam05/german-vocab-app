import ExampleSentences from "@/components/ExampleSentences";
import { SpeakerIcon, speakGerman } from "@/components/ListenButton";
import { VocabularyCard, formatPartOfSpeech } from "@/lib/vocabulary";

// Styles shared by the Study and Daily review screens.

// The card's shape: rounded corners and a soft shadow. Its look (frosted
// glass) is added with cardFrame() below.
export const cardStyle =
  "overflow-clip rounded-[28px] w-full max-w-md sm:max-w-lg";

// Small press feedback for buttons
export const pressable =
  "transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]";

// Every word has a colour theme: the gender colour for nouns (der blue,
// die red, das green, plural-only purple), yellow for all other words.
// The colours themselves are in globals.css (.theme-masculine, …).
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

// The card's look: frosted glass with a soft glow in the word's colour
// (see .card-frost in globals.css). Without a word (e.g. "No words
// here") the glow is grey.
export function cardFrame(word?: VocabularyCard) {
  return word ? `card-frost ${cardTheme(word)}` : "card-frost";
}

// Splits "der Fernsehapparat" into the article and the word. Words
// without an article (verbs, adjectives, names like "Deutschland") have
// an empty article.
function splitArticle(word: VocabularyCard) {
  const prefix = word.article ? `${word.article} ` : "";

  if (!prefix || !word.display.startsWith(prefix)) {
    return { article: "", rest: word.display };
  }
  return { article: word.article!, rest: word.display.slice(prefix.length) };
}

// The card shows only the first meaning, e.g. "to hear; to listen" →
// "to hear". An explanation after it, in brackets or after a dash, is
// returned separately so it can be shown smaller: "your (informal
// singular)" → "your" + "(informal singular)". (All meanings stay in
// the word data.)
export function shortMeaning(english: string) {
  const first = english.split(";")[0].trim();
  const match = first.match(/^(.+?)\s*((?:\(|— ).*)$/);

  return match
    ? { main: match[1], note: match[2] }
    : { main: first, note: "" };
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

  // Something shown for a moment over the picture, e.g. the fox saying
  // "Kein Problem!" in Daily review. It never takes clicks.
  overPicture?: React.ReactNode;
};

// The content of one flashcard:
// 1. a dark "word card" with the same lines for every word, so it is
//    always the same size:
//      line 1: the article (empty if there is none) and a speaker
//      line 2: the word, the same size for every word
//      line 3: the meaning
//      rows:   word type and plural
//    and on the right the level and a big picture (emoji).
//    English → German uses the same lines: the meaning is the question,
//    lines 1 and 2 stay empty until revealed.
// 2. under it: the reveal button, or the example sentences
// The screen around it decides what happens when you answer; this
// component only shows the word.
export default function WordCard({
  word,
  isEnglishToGerman,
  showAnswer,
  onReveal,
  overPicture,
}: WordCardProps) {
  // e.g. "Verb", "Question Word"
  const partOfSpeech = formatPartOfSpeech(word.part_of_speech);
  const { article, rest } = splitArticle(word);
  const meaning = shortMeaning(word.english);

  // German → English: the picture is hidden until revealed, since it
  // hints at the meaning. English → German: always shown as a hint.
  const picture = showAnswer || isEnglishToGerman ? word.emoji || "📝" : "❓";

  const germanVisible = !isEnglishToGerman || showAnswer;
  const meaningVisible = isEnglishToGerman || showAnswer;

  // Fades in when it appears (only when it is the revealed answer)
  const revealGerman = isEnglishToGerman ? "reveal-fade" : "";
  const revealMeaning = isEnglishToGerman ? "" : "reveal-fade";

  return (
    <>
      {/* ---------- 1. The dark word card ---------- */}

      <div className="relative rounded-3xl bg-graphite text-white p-3 sm:p-5 mb-3 shadow-[0_8px_24px_rgba(46,50,56,0.22)]">
        <div className="flex gap-3">
          {/* Left: the coloured bar and the lines */}
          <div className="flex-1 min-w-0 flex gap-2.5">
            <span
              className="shrink-0 w-1 rounded-full bg-(--card-accent) ring-1 ring-white/15"
              aria-hidden="true"
            />

            <div className="flex-1 min-w-0">
              {/* Line 1: the article and the speaker */}
              <div className="h-8 flex items-center gap-2">
                {germanVisible && (
                  <div className={`flex items-center gap-2 ${revealGerman}`}>
                    {article && (
                      <span className="h-7 px-2.5 rounded-full bg-(--card-accent) ring-1 ring-white/15 font-serif font-semibold text-base leading-7">
                        {article}
                      </span>
                    )}
                    <button
                      onClick={() => speakGerman(word.tts_text)}
                      aria-label="Listen"
                      className={`grid place-items-center w-8 h-8 rounded-full bg-(--card-accent) ring-1 ring-white/15 hover:brightness-110 ${pressable}`}
                    >
                      <SpeakerIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Line 2: the word. Every word has the same size: the
                  size at which the longest word still fits on one line */}
              <h1 className="h-9 mt-0.5 font-serif font-semibold text-2xl sm:text-3xl leading-9 whitespace-nowrap">
                {germanVisible ? (
                  <span className={`block ${revealGerman}`}>{rest}</span>
                ) : (
                  // Placeholder for the hidden German word
                  <>
                    <span
                      className="block w-3/5 h-full border-b-2 border-dashed border-white/20"
                      aria-hidden="true"
                    />
                    <span className="sr-only">German word hidden</span>
                  </>
                )}
              </h1>

              {/* Line 3: the meaning (room for two lines) */}
              <p className="h-12 mt-0.5 text-[17px] leading-6 line-clamp-2">
                {meaningVisible && (
                  <span className={`italic text-white/80 ${revealMeaning}`}>
                    {meaning.main}
                    {meaning.note && (
                      <span className="text-sm text-white/50">
                        {" "}
                        {meaning.note}
                      </span>
                    )}
                  </span>
                )}
              </p>

              {/* Rows: the word type, and the plural (N/A when there is
                  none), which shows once revealed */}
              <dl className="mt-2 text-sm">
                <div className="flex items-baseline gap-2 py-1 border-b border-white/10">
                  <dt className="w-[66px] shrink-0 whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-white/50">
                    Word type
                  </dt>
                  <dd className="font-semibold truncate">{partOfSpeech}</dd>
                </div>

                <div className="flex items-baseline gap-2 py-1 border-b border-white/10">
                  <dt className="w-[66px] shrink-0 whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-white/50">
                    Plural
                  </dt>
                  <dd className="font-semibold truncate">
                    {showAnswer ? (
                      <span className="reveal-fade inline-block">
                        {word.plural || "N/A"}
                      </span>
                    ) : (
                      // keeps the row's height while it is empty
                      <span className="invisible">–</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right: the level and a big picture */}
          <div className="relative shrink-0 w-[84px] sm:w-28 flex flex-col items-center gap-2">
            <span className="self-end px-2 py-0.5 rounded-full bg-(--card-accent) ring-1 ring-white/15 text-xs font-extrabold">
              {word.cefr || "A1"}
            </span>

            <span className="relative flex-1 w-full grid place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <span
                className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgb(255_255_255/0.14),rgb(255_255_255/0)_70%)]"
                aria-hidden="true"
              />
              <span className="relative text-6xl leading-none drop-shadow-md">
                {picture}
              </span>
            </span>

            {/* Shown for a moment over the picture (e.g. the fox) */}
            {overPicture && (
              <div className="absolute -inset-1 pointer-events-none">
                {overPicture}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- 2. Under the word card ---------- */}

      {/* Reveal button (only while the answer is hidden) */}

      {!showAnswer && onReveal && (
        <div className="text-center mt-1">
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

      {/* Answer: the example sentences */}

      {showAnswer && (
        <div className="reveal-fade">
          <ExampleSentences examples={word.examples} />
        </div>
      )}
    </>
  );
}
