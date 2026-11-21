import { ReviewCards } from "@/lib/review";
import { StudyStatus, VocabularyCard, countMastered } from "@/lib/vocabulary";

// Overall progress of a list of words (e.g. a whole level):
// - learned:  words that are in Daily review (learned at least once)
// - mastered: words marked Mastered
export function getProgress(
  words: VocabularyCard[],
  reviewCards: ReviewCards,
  studyStatus: StudyStatus
) {
  const total = words.length;
  const percent = (count: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100);

  const learned = words.filter((word) => reviewCards[word.word]).length;
  const mastered = countMastered(words, studyStatus);

  // Learned but not Mastered yet (the light part of the bar)
  const learnedNotMastered = words.filter(
    (word) => reviewCards[word.word] && studyStatus[word.word] !== "mastered"
  ).length;

  return {
    total,
    learned,
    mastered,
    learnedPercent: percent(learned),
    masteredPercent: percent(mastered),
    lightPercent: total === 0 ? 0 : (learnedNotMastered / total) * 100,
  };
}

export type Progress = ReturnType<typeof getProgress>;

// The two-tone progress bar with its key, used on Home and on the
// Welcome screen. Dark yellow = Mastered, light yellow = learned in
// Daily review but not Mastered yet. Over time light turns into dark.
// `onDark` is for dark backgrounds (e.g. the A1 card on Welcome).
export default function ProgressBar({
  progress,
  onDark = false,
  className = "",
}: {
  progress: Progress;
  onDark?: boolean;
  className?: string;
}) {
  // Built from <span>s (not <div>/<p>) so it can also sit inside a
  // button, like the A1 card on the Welcome screen.
  return (
    <span className={`block ${className}`}>
      <span
        className={`flex w-full h-2 rounded-full overflow-hidden ${
          onDark ? "bg-white/15" : "bg-grid border border-graphite/10"
        }`}
      >
        <span
          className="h-full bg-marker-strong"
          style={{ width: `${progress.masteredPercent}%` }}
        />
        <span
          className="h-full bg-marker"
          style={{ width: `${progress.lightPercent}%` }}
        />
      </span>

      {/* Key for the two colours */}
      <span
        className={`flex items-center gap-1.5 text-xs mt-1.5 ${
          onDark ? "text-paper/80" : "text-pencil"
        }`}
      >
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-marker border border-marker-strong/50" />
        {progress.learnedPercent}% learned
        <span className="mx-1">·</span>
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-marker-strong" />
        {progress.masteredPercent}% mastered
      </span>
    </span>
  );
}
