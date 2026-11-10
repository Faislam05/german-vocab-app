import Link from "next/link";

type StudyTopBarProps = {
  // e.g. "All", "Learning", "Known"
  filterLabel: string;

  // Card number (starting at 1) and how many cards there are
  position: number;
  total: number;

  isShuffled: boolean;
  onToggleShuffle: () => void;

  revealMode: boolean;
  onToggleRevealMode: () => void;
};

// Top of the Study screen: ← Home, "All · 1 / 107", 🔀 shuffle and the
// Flashcard On/Off toggle, plus the progress bar underneath.
//
// It only shows things and reports clicks. The state itself (is shuffle
// on? which card are we on?) lives in StudySession, which passes it in
// as props.
export default function StudyTopBar({
  filterLabel,
  position,
  total,
  isShuffled,
  onToggleShuffle,
  revealMode,
  onToggleRevealMode,
}: StudyTopBarProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 whitespace-nowrap text-xs sm:text-sm mb-3">
        <Link href="/" className="text-gray-500 hover:text-gray-900">
          ← Home
        </Link>

        <span className="px-3 py-1 rounded-full bg-gray-100">
          {filterLabel} · {position} / {total}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleShuffle}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${
              isShuffled ? "bg-black" : "bg-gray-100"
            }`}
            aria-label={isShuffled ? "Turn shuffle off" : "Shuffle words"}
            title={isShuffled ? "Shuffle: On" : "Shuffle: Off"}
          >
            🔀
          </button>

          <button
            onClick={onToggleRevealMode}
            className="text-gray-500 hover:text-gray-900"
          >
            Flashcard: {revealMode ? "On" : "Off"}
          </button>
        </div>
      </div>

      {/* Progress bar */}

      <div className="mb-4">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${(position / total) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
