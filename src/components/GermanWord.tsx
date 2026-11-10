import { VocabularyCard } from "@/lib/vocabulary";

// Article colours, a common trick for remembering noun genders:
//   der → blue (masculine), die → red (feminine), das → green (neuter)
// Plural-only nouns such as "die Eltern" get amber, because their "die"
// is not feminine.
//
// The class names are written out in full on purpose: Tailwind only
// includes classes it can find as complete words in the code.
const genderColours: Record<string, string> = {
  masculine: "text-blue-600",
  feminine: "text-red-600",
  neuter: "text-green-600",
  plural: "text-amber-600",
};

type GermanWordProps = {
  word: VocabularyCard;
};

// Shows the German word, e.g. "der Beruf", with the article coloured by
// gender. Words without an article (verbs, adjectives, names like
// "Deutschland") are shown unchanged.
export default function GermanWord({ word }: GermanWordProps) {
  const colour = word.gender ? genderColours[word.gender] : undefined;
  const articlePrefix = word.article ? `${word.article} ` : "";

  if (!colour || !articlePrefix || !word.display.startsWith(articlePrefix)) {
    return <>{word.display}</>;
  }

  return (
    <>
      <span className={colour}>{word.article}</span>{" "}
      {word.display.slice(articlePrefix.length)}
    </>
  );
}
