import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HINTS, HintId } from "@/lib/hints";

type HintProps = {
  // Which hint to show (its text comes from HINTS in src/lib/hints.ts)
  id: HintId;

  // Show it now? (Usually: this is the screen's current hint.)
  show: boolean;

  // Where the bubble appears, relative to the thing it points at.
  // (It flips to the other side automatically if there's no room.)
  placement?: "above" | "below";

  // Which edge the bubble lines up with (for small things near an edge)
  align?: "left" | "right" | "stretch";

  onDismiss: () => void; // "Got it"
  onSkipAll: () => void; // "Skip all tips"

  // Extra classes for the wrapper (e.g. grid or flex placement)
  className?: string;

  // The thing the hint points at
  children: React.ReactNode;
};

// Space between the thing and its clear "window" in the blur, and
// between the window and the bubble
const PAD = 6;
const GAP = 12;
const EDGE = 16; // keep the bubble this far from the screen edges
const RADIUS = 16; // roundness of the clear window (matches rounded-2xl)

type Box = { top: number; left: number; width: number; height: number };

// Wraps something on the screen. When `show` is true it puts a
// "spotlight" on it: the rest of the page is blurred and dimmed, the
// thing itself stays sharp, and a mustard speech bubble with the tip
// floats next to it ("Got it", "Skip all tips"). Tapping the blurred
// area or pressing Esc also closes the tip.
//
// The blur and the bubble are drawn at the top level of the page (a
// "portal" into <body>), so they appear above everything, wherever the
// thing sits.
export default function Hint({
  id,
  show,
  placement = "below",
  align = "stretch",
  onDismiss,
  onSkipAll,
  className = "",
  children,
}: HintProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Where the thing is on the screen, and how tall the bubble is
  const [target, setTarget] = useState<Box | null>(null);
  const [bubbleHeight, setBubbleHeight] = useState(0);

  // Measure the thing and follow it while the tip is open
  useLayoutEffect(() => {
    if (!show || !targetRef.current) return;

    const element = targetRef.current;
    element.scrollIntoView({ block: "nearest" });

    // Keep following the thing on every screen frame while the tip is
    // open, so the window and bubble stay in place even when the thing
    // moves (scrolling, resizing, or an animation like the answer
    // sliding in). Only updates when something actually changed.
    let frame = 0;
    let last = "";

    function measure() {
      const rect = element.getBoundingClientRect();
      const height = bubbleRef.current?.offsetHeight ?? 0;
      const key = `${rect.top},${rect.left},${rect.width},${rect.height},${height}`;

      if (key !== last) {
        last = key;
        setTarget({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        setBubbleHeight(height);
      }

      frame = requestAnimationFrame(measure);
    }

    measure();

    return () => cancelAnimationFrame(frame);
  }, [show]);

  // Esc closes the hint
  useEffect(() => {
    if (!show) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onDismiss]);

  const text = HINTS[id].text;
  const lines: readonly string[] = typeof text === "string" ? [text] : text;

  return (
    <div ref={targetRef} className={className}>
      {children}

      {show &&
        target &&
        typeof document !== "undefined" &&
        createPortal(
          <Spotlight
            target={target}
            bubbleHeight={bubbleHeight}
            bubbleRef={bubbleRef}
            placement={placement}
            align={align}
            lines={lines}
            onDismiss={onDismiss}
            onSkipAll={onSkipAll}
          />,
          document.body
        )}
    </div>
  );
}

// The blur around the thing, its outline, and the bubble
function Spotlight({
  target,
  bubbleHeight,
  bubbleRef,
  placement,
  align,
  lines,
  onDismiss,
  onSkipAll,
}: {
  target: Box;
  bubbleHeight: number;
  bubbleRef: React.RefObject<HTMLDivElement | null>;
  placement: "above" | "below";
  align: "left" | "right" | "stretch";
  lines: readonly string[];
  onDismiss: () => void;
  onSkipAll: () => void;
}) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // The clear "window" in the blur: the thing plus a little space
  const hole = {
    top: target.top - PAD,
    left: target.left - PAD,
    right: target.left + target.width + PAD,
    bottom: target.top + target.height + PAD,
  };

  // The bubble's width and left edge (kept inside the screen)
  const width =
    align === "stretch"
      ? Math.min(Math.max(target.width, 260), screenWidth - 2 * EDGE)
      : Math.min(288, screenWidth - 2 * EDGE);
  const wantedLeft =
    align === "right"
      ? target.left + target.width - width
      : align === "left"
        ? target.left
        : target.left + target.width / 2 - width / 2;
  const left = Math.max(EDGE, Math.min(wantedLeft, screenWidth - EDGE - width));

  // Above or below; flip if it would not fit on the screen
  const fitsBelow = hole.bottom + GAP + bubbleHeight <= screenHeight - EDGE;
  const fitsAbove = hole.top - GAP - bubbleHeight >= EDGE;
  const side =
    placement === "below"
      ? fitsBelow || !fitsAbove
        ? "below"
        : "above"
      : fitsAbove || !fitsBelow
        ? "above"
        : "below";
  const top =
    side === "below" ? hole.bottom + GAP : hole.top - GAP - bubbleHeight;

  // The little arrow points at the thing (its middle, or near its edge)
  const pointAt =
    align === "right"
      ? target.left + target.width - 28
      : align === "left"
        ? target.left + 28
        : target.left + target.width / 2;
  const arrowLeft = Math.max(16, Math.min(pointAt - left, width - 16));

  // One blurred, dimmed layer over the whole screen, with a rounded
  // hole cut out around the thing (an SVG path with two shapes: the
  // screen, and the rounded window; "evenodd" makes the window a hole).
  // Clicks go through the hole, so the thing itself still works.
  const r = RADIUS;
  const x = hole.left;
  const y = hole.top;
  const w = hole.right - hole.left;
  const h = hole.bottom - hole.top;
  const cutOut =
    `M0 0H${screenWidth}V${screenHeight}H0Z ` +
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}` +
    `V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
    `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

  return (
    <>
      <div
        className="hint-fade fixed inset-0 z-[60] bg-graphite/25 backdrop-blur-[3px]"
        style={{ clipPath: `path(evenodd, "${cutOut}")` }}
        onClick={onDismiss}
      />

      {/* A mustard outline around the window */}
      <div
        className="hint-fade fixed z-[61] rounded-2xl ring-2 ring-marker-strong pointer-events-none"
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.right - hole.left,
          height: hole.bottom - hole.top,
        }}
        aria-hidden="true"
      />

      {/* The bubble (hidden until its height is known, so it never jumps) */}
      <div
        ref={bubbleRef}
        role="dialog"
        aria-live="polite"
        aria-label="Tip"
        className="hint-pop fixed z-[62] rounded-2xl bg-marker-strong text-graphite p-3.5 text-left font-sans text-sm shadow-[0_8px_28px_rgba(46,50,56,0.25)]"
        style={{
          top,
          left,
          width,
          visibility: bubbleHeight ? "visible" : "hidden",
        }}
      >
        <span
          className={`absolute w-3 h-3 rotate-45 bg-marker-strong -translate-x-1/2 ${
            side === "below" ? "-top-1.5" : "-bottom-1.5"
          }`}
          style={{ left: arrowLeft }}
          aria-hidden="true"
        />

        <p className="text-xs font-extrabold text-black mb-1">Tip</p>

        <div className="space-y-1.5 leading-snug">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <button
            onClick={onSkipAll}
            className="text-xs text-graphite/70 hover:text-graphite underline underline-offset-2"
          >
            Skip all tips
          </button>

          <button
            onClick={onDismiss}
            className="rounded-full bg-graphite text-white font-extrabold px-4 py-1.5 text-sm shadow-[0_3px_0_rgba(0,0,0,0.35)] transition-[transform,box-shadow] duration-100 ease-out active:translate-y-[3px] active:shadow-none"
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
}
