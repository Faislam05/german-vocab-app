import ReviewSession from "./ReviewSession";

// The Daily review screen lives at /review.
// Everything happens in ReviewSession (a Client Component, because it
// uses state and localStorage).
export default function ReviewPage() {
  return <ReviewSession />;
}
