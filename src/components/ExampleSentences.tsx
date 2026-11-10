import ListenButton from "@/components/ListenButton";
import { Example } from "@/lib/vocabulary";

type ExampleSentencesProps = {
  examples: Example[];
};

// The list of German example sentences, each with its English
// translation and a 🔊 button.
export default function ExampleSentences({ examples }: ExampleSentencesProps) {
  return (
    <div className="text-left text-sm sm:text-base space-y-2">
      {examples.map((example, exampleIndex) => (
        <div key={exampleIndex}>
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">{example.de}</p>

            <ListenButton text={example.de} iconOnly />
          </div>

          <p className="text-gray-500">{example.en}</p>
        </div>
      ))}
    </div>
  );
}
