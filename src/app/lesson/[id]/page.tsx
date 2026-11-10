import LessonOverview from "./LessonOverview";

// The lesson page lives at /lesson/2 (one lesson) or /lesson/all.
//
// The folder name [id] means "any value here": Next.js passes it in as
// params.id. In this Next.js version params is a Promise, so it is read
// with await. The page itself is drawn by LessonOverview (a Client
// Component, because it uses state and localStorage).
export default async function LessonPage({ params }: PageProps<"/lesson/[id]">) {
  const { id } = await params;

  return <LessonOverview lessonId={id} />;
}
