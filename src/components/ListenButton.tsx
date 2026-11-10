// Reads German text aloud with the browser's built-in speech synthesis.
function speakGerman(text: string) {
  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "de-DE";

  window.speechSynthesis.cancel(); // stop anything already playing
  window.speechSynthesis.speak(speech);
}

type ListenButtonProps = {
  // The German text to read aloud
  text: string;

  // true = small 🔊 icon only (used next to example sentences)
  // false (default) = black "🔊 Listen" pill button
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
        className={`text-lg hover:scale-110 transition-transform ${className}`}
        aria-label="Listen to sentence"
      >
        🔊
      </button>
    );
  }

  return (
    <button
      onClick={() => speakGerman(text)}
      className={`px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 ${className}`}
    >
      🔊 Listen
    </button>
  );
}
