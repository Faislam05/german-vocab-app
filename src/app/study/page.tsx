import { Suspense } from "react";
import StudySession from "./StudySession";

// The Study screen lives at /study?filter=all|learning|known
//
// StudySession reads the filter from the URL with useSearchParams().
// Next.js requires a <Suspense> boundary around components that do
// this, so the page can still be built ahead of time.
export default function StudyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading vocabulary...</p>
        </main>
      }
    >
      <StudySession />
    </Suspense>
  );
}
