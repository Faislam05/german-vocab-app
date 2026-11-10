import ListenButton from "@/components/ListenButton";
import { Example } from "@/lib/vocabulary";

type ExampleSentencesProps = {
  examples: Example[];
};

// The list of German example sentences, each with its English
// translation and a listen button. The yellow line on the left is like
// a highlighter mark in the margin of a notebook.
export default function ExampleSentences({ examples }: ExampleSentencesProps) {
  return (
    <div className="text-left text-sm sm:text-base space-y-2 border-l-2 border-marker-strong pl-3">
      {examples.map((example, exampleIndex) => (
        <div key={exampleIndex}>
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">{example.de}</p>

            <ListenButton text={example.de} iconOnly />
          </div>

          <p className="text-pencil">{example.en}</p>
        </div>
      ))}
    </div>
  );
}
