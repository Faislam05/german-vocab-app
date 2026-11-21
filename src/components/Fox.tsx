import Image from "next/image";

// The fox mascot. The images live in public/mascot/ and are made from
// the original ChatGPT PNGs with scripts/prepare-mascot.py.
//
// Each pose's size in pixels (as written by the script), so the image
// keeps its shape at any height.
const POSES = {
  waving: { width: 230, height: 360 },
  celebrating: { width: 294, height: 360 },
  sleeping: { width: 391, height: 360 },
  head: { width: 360, height: 360 }, // the face: logo and profile button
} as const;

export type FoxPose = keyof typeof POSES;

type FoxProps = {
  pose: FoxPose;

  // How tall the fox is on screen, in CSS pixels
  height: number;

  // Optional speech bubble next to the fox's head, e.g. "Super!"
  says?: string;

  // Pop in with a little bounce when it appears
  pop?: boolean;

  className?: string;
};

// The fox is decoration: the text around it already says everything,
// so screen readers skip it (empty alt text).
export default function Fox({
  pose,
  height,
  says,
  pop = false,
  className = "",
}: FoxProps) {
  const size = POSES[pose];
  const width = Math.round((size.width / size.height) * height);

  return (
    <div className={`relative inline-block ${className}`}>
      <Image
        src={`/mascot/fox-${pose}.webp`}
        alt=""
        width={width}
        height={height}
        unoptimized
        className={pop ? "fox-pop" : ""}
        style={{ width, height }}
      />

      {says && (
        <span
          className={`absolute bottom-[92%] left-[66%] whitespace-nowrap rounded-2xl bg-white text-graphite font-serif font-semibold text-lg px-3 py-1 shadow-[0_3px_0_rgba(0,0,0,0.15)] ${
            pop ? "fox-bubble-pop" : ""
          }`}
        >
          {says}
          {/* The bubble's little tail, pointing down at the fox */}
          <span
            className="absolute -bottom-1.5 left-3 w-3 h-3 rotate-45 bg-white"
            aria-hidden="true"
          />
        </span>
      )}
    </div>
  );
}
