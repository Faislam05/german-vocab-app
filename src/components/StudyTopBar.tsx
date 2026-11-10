import Link from "next/link";

type StudyTopBarProps = {
  // e.g. "All words", "Learning", "Mastered"
  filterLabel: string;

  // Card number (starting at 1) and how many cards there are
  position: number;
  total: number;

  isShuffled: boolean;
  onToggleShuffle: () => void;

  revealMode: boolean;
  onToggleRevealMode: () => void;
};

// The shuffle icon (two crossing arrows), drawn with SVG so it looks the
// same on every device.
function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="m15 15 6 6" />
      <path d="M4 4l5 5" />
    </svg>
  );
}

// Top of the Study screen: ← Home, "Learning: 3 of 14", the shuffle
// button and the Flashcard on/off switch, plus the progress bar.
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
  // Small switch-like buttons; "on" is highlighted in marker yellow
  const switchStyle = (isOn: boolean) =>
    `h-8 rounded-lg border transition-[transform,background-color] duration-150 ease-out active:scale-[0.95] ${
      isOn
        ? "bg-marker border-marker-strong text-graphite"
        : "bg-paper border-graphite/15 text-pencil hover:text-graphite"
    }`;

  return (
    <>
      <div className="flex items-center justify-between gap-2 whitespace-nowrap text-xs sm:text-sm mb-2">
        <Link href="/" className="text-pencil hover:text-graphite">
          ← Home
        </Link>

        <span>
          {filterLabel}: <strong>{position}</strong> of {total}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleShuffle}
            aria-pressed={isShuffled}
            aria-label={isShuffled ? "Turn shuffle off" : "Shuffle words"}
            title={isShuffled ? "Shuffle: On" : "Shuffle: Off"}
            className={`w-8 flex items-center justify-center ${switchStyle(isShuffled)}`}
          >
            <ShuffleIcon />
          </button>

          <button
            onClick={onToggleRevealMode}
            aria-pressed={revealMode}
            className={`px-2 ${switchStyle(revealMode)}`}
          >
            Flashcard {revealMode ? "on" : "off"}
          </button>
        </div>
      </div>

      {/* Progress bar */}

      <div className="mb-3 w-full h-1.5 bg-grid rounded-full overflow-hidden">
        <div
          className="h-full bg-marker-strong transition-[width] duration-300 ease-out"
          style={{ width: `${(position / total) * 100}%` }}
        />
      </div>
    </>
  );
}
