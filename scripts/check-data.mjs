// Checks every lesson file for mistakes before you study with it.
//
// Run with:  npm run check-data
//
// It reads public/data/lessons.json, checks every chapter has its titles,
// opens each lesson file listed there ("file": null = not added yet),
// and reports problems such as unknown part-of-speech labels, nouns with
// a missing or wrong gender, missing fields, or duplicate words.
// It exits with an error code if anything is wrong, so it can also be
// used in automated checks later.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// Folder to check (default: the app's data folder). Another folder can be
// given for testing:  node scripts/check-data.mjs some/other/folder
const DATA_DIR = process.argv[2] ?? "public/data";

// Must match the "Part of Speech Labels" table in PROJECT_CONTEXT.md
const ALLOWED_LABELS = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "question_word",
  "preposition",
  "conjunction",
  "possessive",
  "pronoun",
  "particle",
];

// Which gender each article can go with
const ARTICLE_GENDERS = {
  der: ["masculine"],
  die: ["feminine", "plural"],
  das: ["neuter"],
};

const REQUIRED_FIELDS = ["word", "display", "part_of_speech", "english", "tts_text", "examples"];

const problems = [];
const warnings = [];

// Words marked with a "review_note" in the lesson file: things to check
// against the textbook later. Delete the note once a word is checked.
const toCheck = [];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (error) {
    problems.push(`${path}: cannot be read as JSON (${error.message})`);
    return null;
  }
}

// 1. The lesson index
const index = readJson(join(DATA_DIR, "lessons.json"));
const entries = index?.lessons ?? [];
if (index && !Array.isArray(index.lessons)) {
  problems.push(`lessons.json: must contain a "lessons" list`);
}

// 2. Each chapter listed in the index
let wordTotal = 0;
let lessonsAdded = 0;
for (const entry of entries) {
  // Every chapter needs its titles (shown on the Home screen)
  for (const field of ["lesson", "title", "chapter", "chapter_en"]) {
    if (entry[field] === undefined || entry[field] === null || entry[field] === "") {
      problems.push(`lessons.json: Lektion ${entry.lesson ?? "?"} is missing "${field}"`);
    }
  }

  // "file": null means the words are not added yet — nothing more to check
  if (entry.file === null) continue;

  const path = join(DATA_DIR, entry.file ?? "");
  const name = entry.file ?? "(missing file name)";

  if (!entry.file || !existsSync(path)) {
    problems.push(`lessons.json: Lektion ${entry.lesson} points to "${name}", which does not exist`);
    continue;
  }

  const lesson = readJson(path);
  if (!lesson) continue;
  lessonsAdded++;

  if (lesson.lesson !== entry.lesson) {
    problems.push(`${name}: says lesson ${lesson.lesson}, but lessons.json lists it as lesson ${entry.lesson}`);
  }
  if (!Array.isArray(lesson.vocabulary) || lesson.vocabulary.length === 0) {
    problems.push(`${name}: has no vocabulary`);
    continue;
  }

  const seen = new Set();
  for (const item of lesson.vocabulary) {
    const label = `${name}: "${item.display ?? item.word ?? "?"}"`;
    wordTotal++;

    for (const field of REQUIRED_FIELDS) {
      if (item[field] === undefined || item[field] === null || item[field] === "") {
        problems.push(`${label} is missing "${field}"`);
      }
    }

    if (item.part_of_speech && !ALLOWED_LABELS.includes(item.part_of_speech)) {
      problems.push(`${label} has unknown label "${item.part_of_speech}" (allowed: ${ALLOWED_LABELS.join(", ")})`);
    }

    if (seen.has(item.word)) {
      problems.push(`${label} appears more than once in this lesson`);
    }
    seen.add(item.word);

    if (item.lesson !== undefined && item.lesson !== lesson.lesson) {
      problems.push(`${label} has lesson ${item.lesson}, but the file is lesson ${lesson.lesson}`);
    }

    if (item.article) {
      const allowed = ARTICLE_GENDERS[item.article];
      if (!allowed) {
        problems.push(`${label} has unknown article "${item.article}"`);
      } else if (!item.gender) {
        problems.push(`${label} has article "${item.article}" but no gender`);
      } else if (!allowed.includes(item.gender)) {
        problems.push(`${label}: article "${item.article}" does not match gender "${item.gender}"`);
      }
      if (item.display && !item.display.startsWith(`${item.article} `)) {
        problems.push(`${label}: display should start with its article "${item.article}"`);
      }
    } else if (item.part_of_speech === "noun" && item.gender) {
      problems.push(`${label} has gender "${item.gender}" but no article`);
    }

    if (Array.isArray(item.examples)) {
      if (item.examples.length === 0) warnings.push(`${label} has no example sentences`);
      for (const example of item.examples) {
        if (!example.de || !example.en) problems.push(`${label} has an example without "de" or "en"`);
      }
    }

    if (!item.emoji) warnings.push(`${label} has no emoji (📝 will be shown)`);

    if (item.review_note) {
      toCheck.push(`Lektion ${lesson.lesson}, "${item.display ?? item.word}" (p. ${(item.references ?? []).join(", ")}): ${item.review_note}`);
    }
  }
}

// 3. Lesson files that exist but are not listed in lessons.json
const listed = new Set(entries.map((entry) => entry.file));
for (const file of readdirSync(DATA_DIR)) {
  if (file.endsWith("_enriched_with_emojis.json") && !listed.has(file)) {
    warnings.push(`${file} exists but is not listed in lessons.json, so the app won't show it`);
  }
}

// 4. Report
console.log(`Checked ${entries.length} chapters (${lessonsAdded} lesson(s) added), ${wordTotal} words.`);
for (const warning of warnings) console.log(`  ⚠️  ${warning}`);
for (const problem of problems) console.log(`  ❌ ${problem}`);

if (toCheck.length > 0) {
  console.log(`\n📝 Words to check against the textbook (${toCheck.length}):`);
  for (const item of toCheck) console.log(`  - ${item}`);
  console.log("");
}

if (problems.length > 0) {
  console.log(`\n${problems.length} problem(s) found. Please fix them before studying.`);
  process.exit(1);
}
console.log(warnings.length > 0 ? "No problems (see warnings above)." : "✅ All lesson data looks good.");
