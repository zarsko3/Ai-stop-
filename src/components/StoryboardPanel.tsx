"use client";

import { useCallback, useState } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import {
  NanoBananaNodeData,
  AnnotationNodeData,
  ImageInputNodeData,
  VideoFrameGrabNodeData,
  WorkflowNode,
} from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoryboardFrame {
  nodeId: string;
  nodeType: string;
  image: string;
  label: string;
}

// ─── Pure helpers (module-level, stable references) ──────────────────────────

/**
 * Returns a human-readable label for a node's storyboard card.
 * Priority: customTitle → inputPrompt / actionPrompt → type name.
 */
function getFrameLabel(node: WorkflowNode): string {
  const d = node.data as Record<string, unknown>;

  if (typeof d.customTitle === "string" && d.customTitle.trim())
    return d.customTitle.trim();

  if (typeof d.inputPrompt === "string" && d.inputPrompt.trim())
    return d.inputPrompt.trim();

  if (typeof d.actionPrompt === "string" && d.actionPrompt.trim())
    return d.actionPrompt.trim();

  const fallbacks: Record<string, string> = {
    nanoBanana: "Generated Image",
    annotation: "Annotation",
    imageInput: "Image Input",
    videoFrameGrab: "Frame Grab",
  };
  return fallbacks[node.type ?? ""] ?? "Image";
}

/**
 * Walks the nodes array and collects all frames that have a rendered output
 * image.  Results are sorted by canvas x-position so the strip reads
 * left-to-right just like the workflow.
 */
function extractFrames(nodes: WorkflowNode[]): StoryboardFrame[] {
  const bucket: Array<{ frame: StoryboardFrame; x: number }> = [];

  for (const node of nodes) {
    let image: string | null | undefined;

    switch (node.type) {
      case "nanoBanana":
        image = (node.data as NanoBananaNodeData).outputImage;
        break;
      case "annotation":
        image = (node.data as AnnotationNodeData).outputImage;
        break;
      case "imageInput":
        image = (node.data as ImageInputNodeData).image;
        break;
      case "videoFrameGrab":
        image = (node.data as VideoFrameGrabNodeData).outputImage;
        break;
    }

    if (!image) continue;

    bucket.push({
      frame: {
        nodeId: node.id,
        nodeType: node.type!,
        image,
        label: getFrameLabel(node),
      },
      x: node.position.x,
    });
  }

  return bucket.sort((a, b) => a.x - b.x).map((b) => b.frame);
}

/**
 * Custom Zustand equality function (module-level = stable reference).
 *
 * Triggers a React re-render only when frame count, IDs, images, labels, or
 * canvas sort-order change.  Pure position updates from canvas dragging return
 * `true` (equal) so the component stays idle during drag.
 */
function framesEqual(prev: StoryboardFrame[], next: StoryboardFrame[]): boolean {
  if (prev.length !== next.length) return false;
  return prev.every(
    (p, i) =>
      p.nodeId === next[i].nodeId &&
      p.image  === next[i].image  &&
      p.label  === next[i].label
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StoryboardPanel() {
  const [isOpen, setIsOpen] = useState(false);

  // Optimised subscription: re-renders only when frame DATA changes, not on
  // every canvas pan/zoom/drag (which updates node x/y but not image data).
  const frames = useWorkflowStore(
    useCallback((state) => extractFrames(state.nodes), []),
    framesEqual
  );

  const handleExport = useCallback(() => {
    const payload = frames.map((f) => ({
      nodeId:   f.nodeId,
      nodeType: f.nodeType,
      label:    f.label,
      image:    f.image,
    }));
    // eslint-disable-next-line no-console
    console.group(
      "%c[StoryboardPanel] Export Storyboard",
      "color:#10b981;font-weight:bold;font-size:13px;"
    );
    // eslint-disable-next-line no-console
    console.log(`${frames.length} frame(s):`, payload);
    payload.forEach((f, i) => {
      // eslint-disable-next-line no-console
      console.log(`  Frame ${i + 1} — ${f.label}`, f.image.slice(0, 80) + "…");
    });
    // eslint-disable-next-line no-console
    console.groupEnd();
  }, [frames]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">

      {/* ── Glassmorphism panel ────────────────────────────────────────── */}
      <div className="pointer-events-auto bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-800/60 shadow-[0_-8px_40px_rgba(0,0,0,0.55)]">

        {/* ── Header bar (always visible) ─────────────────────────────── */}
        <div className="flex items-center h-9 px-4 gap-3 border-b border-neutral-800/40">

          {/* Toggle + title */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100 transition-colors group"
            aria-label={isOpen ? "Collapse storyboard" : "Expand storyboard"}
          >
            {/* Chevron */}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isOpen ? "rotate-0" : "rotate-180"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>

            {/* Clapperboard icon */}
            <svg
              className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375
                   19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-.375a1.125
                   1.125 0 011.125-1.125H3m0 0h.375m-.375 0H3m0 0V9m0 0h.375M3
                   9H2.625A1.125 1.125 0 011.5 7.875V4.125A1.125 1.125 0
                   012.625 3H21.375A1.125 1.125 0 0122.5 4.125v3.75A1.125
                   1.125 0 0121.375 9H21m0 0H3m18 0h.375M21 9v9.375M21
                   18.375A1.125 1.125 0 0119.875 19.5H18m3-1.125v.375A1.125
                   1.125 0 0119.875 19.5m0 0H18m1.875-1.125H18m0 0H6m12 0V9"
              />
            </svg>

            <span className="text-[11px] font-medium tracking-wide uppercase">
              Storyboard
            </span>

            {/* Frame count badge */}
            {frames.length > 0 && (
              <span className="px-1.5 py-px rounded-full bg-neutral-800 border border-neutral-700 text-[9px] font-mono text-neutral-300 group-hover:border-neutral-600 transition-colors">
                {frames.length}
              </span>
            )}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={frames.length === 0}
            title={
              frames.length === 0
                ? "No frames to export yet"
                : `Export ${frames.length} frame${frames.length !== 1 ? "s" : ""} to console`
            }
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-700/60 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600 hover:bg-neutral-800/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-neutral-700/60 disabled:hover:text-neutral-400"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0
                   0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wide">
              Export
            </span>
          </button>
        </div>

        {/* ── Collapsible body ────────────────────────────────────────── */}
        <div
          className={`overflow-hidden transition-[height] duration-300 ease-in-out ${
            isOpen ? "h-[148px]" : "h-0"
          }`}
        >
          <div className="flex items-center h-[148px] px-4 gap-4">

            {frames.length === 0 ? (
              /* ── Empty state ─────────────────────────────────────────── */
              <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-50">
                <svg
                  className="w-8 h-8 text-neutral-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159
                       5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182
                       0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5
                       1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0
                       001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375
                       .375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <p className="text-[11px] text-neutral-500 italic text-center max-w-xs">
                  Run some image nodes to populate the storyboard.
                </p>
              </div>
            ) : (
              /* ── Film-strip scroll area ──────────────────────────────── */
              <div
                className="flex-1 overflow-x-auto overflow-y-hidden"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
              >
                <div className="flex gap-3 h-full items-center pr-2">
                  {frames.map((frame, index) => (
                    <FrameCard key={frame.nodeId} frame={frame} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FrameCard ────────────────────────────────────────────────────────────────

interface FrameCardProps {
  frame: StoryboardFrame;
  index: number;
}

function FrameCard({ frame, index }: FrameCardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 group shrink-0 cursor-default select-none">
      {/* Thumbnail */}
      <div className="relative w-[84px] h-[84px] rounded-lg overflow-hidden border border-white/[0.08] group-hover:border-white/20 ring-0 group-hover:ring-1 ring-white/10 bg-neutral-900 transition-all duration-200">
        <img
          src={frame.image}
          alt={frame.label}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          draggable={false}
        />

        {/* Subtle top-left frame number */}
        <div className="absolute top-1 left-1 px-1 py-px rounded bg-black/60 text-[9px] font-mono text-neutral-300 leading-none tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Node type chip (bottom-right) */}
        <div className="absolute bottom-1 right-1 px-1 py-px rounded bg-black/60 text-[8px] text-neutral-400 leading-none uppercase tracking-wide">
          {NODE_TYPE_SHORT[frame.nodeType] ?? frame.nodeType}
        </div>
      </div>

      {/* Scene label */}
      <p className="w-[84px] text-[9px] text-neutral-500 text-center leading-snug line-clamp-2 group-hover:text-neutral-300 transition-colors">
        {frame.label}
      </p>
    </div>
  );
}

// Short display names for the node-type chip
const NODE_TYPE_SHORT: Record<string, string> = {
  nanoBanana:    "gen",
  annotation:    "annot",
  imageInput:    "input",
  videoFrameGrab:"frame",
};
