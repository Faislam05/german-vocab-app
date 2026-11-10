// Reads German text aloud with the browser's built-in speech synthesis.
function speakGerman(text: string) {
  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "de-DE";

  window.speechSynthesis.cancel(); // stop anything already playing
  window.speechSynthesis.speak(speech);
}

// A small speaker icon, drawn with SVG so it looks the same on every
// device (emoji icons look different on iPhone, Android and Mac).
function SpeakerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

type ListenButtonProps = {
  // The German text to read aloud
  text: string;

  // true = small speaker icon only (used next to example sentences)
  // false (default) = "Listen" button with the icon
  iconOnly?: boolean;

  // Extra Tailwind classes, e.g. for spacing ("mb-3")
  className?: string;
};

export default function ListenButton({
  text,
  iconOnly = false,
  className = "",
}: ListenButtonProps) {
  if (iconOnly) {
    return (
      <button
        onClick={() => speakGerman(text)}
        className={`shrink-0 p-1.5 -m-1 rounded-lg text-pencil hover:text-graphite hover:bg-grid transition-[transform,color] duration-150 ease-out active:scale-[0.9] ${className}`}
        aria-label="Listen to sentence"
      >
        <SpeakerIcon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => speakGerman(text)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-graphite/15 bg-paper hover:bg-grid transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] ${className}`}
    >
      <SpeakerIcon className="w-4 h-4" />
      Listen
    </button>
  );
}
