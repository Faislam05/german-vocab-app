import ExampleSentences from "@/components/ExampleSentences";
import GermanWord from "@/components/GermanWord";
import ListenButton from "@/components/ListenButton";
import { VocabularyCard, formatPartOfSpeech } from "@/lib/vocabulary";

// Styles shared by the Study and Daily review screens.

// The flashcard: a white sheet lying on the squared paper
export const cardStyle =
  "bg-white rounded-2xl border border-graphite/10 shadow-[0_1px_2px_rgba(46,50,56,0.06),0_8px_24px_rgba(46,50,56,0.08)] w-full max-w-md sm:max-w-lg";

// Small press feedback for buttons
export const pressable =
  "transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]";

// The German word gets a yellow highlighter stroke behind its lower half
const highlighter =
  "px-1 box-decoration-clone bg-[linear-gradient(transparent_58%,var(--color-marker)_58%)]";

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
};

// The content of one flashcard: emoji, the question, the answer (meaning,
// plural) and the example sentences. The screen around it decides what
// happens when you answer; this component only shows the word.
export default function WordCard({
  word,
  isEnglishToGerman,
  showAnswer,
  onReveal,
  actions,
}: WordCardProps) {
  // e.g. "Verb", "Question Word"
  const partOfSpeech = formatPartOfSpeech(word.part_of_speech);

  return (
    <>
      {/* Emoji visual. German → English: hidden until revealed, since it
          hints at the meaning. English → German: always shown as a hint. */}

      <div className="w-full h-14 sm:h-20 rounded-xl mb-2 bg-paper border border-grid flex items-center justify-center">
        <span className="text-4xl sm:text-6xl">
          {showAnswer || isEnglishToGerman ? word.emoji || "📝" : "❓"}
        </span>
      </div>

      {/* Question: the German word (DE → EN) or the English meaning (EN → DE) */}

      <div className="text-center">
        {isEnglishToGerman ? (
          <>
            {/* Same size as the English meaning in German → English, so
                the German word is always the biggest thing on the card */}
            <h1 className="text-2xl mb-1">{word.english}</h1>

            <p className="text-sm text-pencil mb-3">{partOfSpeech}</p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight mb-2">
              <span className={highlighter}>
                <GermanWord word={word} />
              </span>
            </h1>

            {/* Part of speech and Listen on one row, to save space */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-sm text-pencil">{partOfSpeech}</span>
              <ListenButton text={word.tts_text} />
            </div>
          </>
        )}
      </div>

      {/* Reveal button (only while the answer is hidden) */}

      {!showAnswer && onReveal && (
        <div className="text-center mt-1">
          <button
            onClick={onReveal}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-graphite text-paper font-semibold hover:bg-black ${pressable}`}
          >
            {isEnglishToGerman ? "Show German" : "Show meaning"}

            {/* Key hint, only on computers (phones have no Space key) */}
            <kbd className="hidden pointer-fine:inline px-1.5 py-0.5 rounded border border-paper/30 text-xs font-sans font-normal text-paper/80">
              Space
            </kbd>
          </button>
        </div>
      )}

      {/* Answer: the other side of the card, plural, actions and examples */}

      {showAnswer && (
        <div className="reveal-fade">
          <div className="text-center">
            {isEnglishToGerman ? (
              <>
                <p className="font-serif text-3xl sm:text-4xl font-semibold leading-tight mb-2">
                  <span className={highlighter}>
                    <GermanWord word={word} />
                  </span>
                </p>

                {/* Listen is only shown now, since it would speak the answer */}
                <ListenButton text={word.tts_text} className="mb-2" />
              </>
            ) : (
              <p className="text-2xl mb-1">{word.english}</p>
            )}

            {/* Always shown (N/A when there is none), so every card has
                the same layout */}
            <p className="text-pencil">Plural: {word.plural || "N/A"}</p>
          </div>

          {actions ?? <div className="h-3" />}

          <ExampleSentences examples={word.examples} />
        </div>
      )}
    </>
  );
}
