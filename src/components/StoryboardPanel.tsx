"use client";

import { useState } from "react";
import { useDirectorStore, type Scene } from "@/store/directorStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilmFrame {
  id: string;
  sceneIndex: number;
  frameType: "Start" | "End";
  frameLabel: string;
  thumbnail: string | null;
  sceneAction: string;
}

// ─── Pure helper ─────────────────────────────────────────────────────────────

function buildFilmFrames(scenes: Scene[]): FilmFrame[] {
  return scenes.flatMap((scene, index) => [
    {
      id: `${scene.id}-start`,
      sceneIndex: index,
      frameType: "Start" as const,
      frameLabel: `${String(index + 1).padStart(2, "0")}S`,
      thumbnail: scene.startFrame.thumbnail,
      sceneAction: scene.action,
    },
    {
      id: `${scene.id}-end`,
      sceneIndex: index,
      frameType: "End" as const,
      frameLabel: `${String(index + 1).padStart(2, "0")}E`,
      thumbnail: scene.endFrame.thumbnail,
      sceneAction: scene.action,
    },
  ]);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StoryboardPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const scenes = useDirectorStore((s) => s.scenes);
  const frames = buildFilmFrames(scenes);

  const generatedCount = frames.filter((f) => f.thumbnail !== null).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="pointer-events-auto bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/60 shadow-[0_-8px_40px_rgba(0,0,0,0.6)]">

        {/* ── Header bar (always visible) ──────────────────────── */}
        <div className="flex items-center h-9 px-5 gap-3 border-b border-neutral-800/40">

          {/* Toggle + title */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-200 transition-colors group"
            aria-label={isOpen ? "Collapse storyboard" : "Expand storyboard"}
          >
            <svg
              className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>

            {/* Clapperboard icon */}
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
                d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-.375a1.125 1.125 0 011.125-1.125H3m0 0h.375m-.375 0H3m0 0V9m0 0h.375M3 9H2.625A1.125 1.125 0 011.5 7.875V4.125A1.125 1.125 0 012.625 3H21.375A1.125 1.125 0 0122.5 4.125v3.75A1.125 1.125 0 0121.375 9H21m0 0H3m18 0h.375M21 9v9.375M21 18.375A1.125 1.125 0 0119.875 19.5H18m3-1.125v.375A1.125 1.125 0 0119.875 19.5m0 0H18m1.875-1.125H18m0 0H6m12 0V9"
              />
            </svg>

            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase">
              Storyboard
            </span>

            {/* Frame count chips */}
            <div className="flex items-center gap-1 ml-0.5">
              <span className="px-1.5 py-px rounded-full bg-neutral-800/80 border border-neutral-700/60 text-[9px] font-mono text-neutral-400">
                {frames.length}
              </span>
              {generatedCount > 0 && (
                <span className="px-1.5 py-px rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[9px] font-mono text-emerald-500">
                  {generatedCount} rendered
                </span>
              )}
            </div>
          </button>

          <div className="flex-1" />

          {/* Scene count info */}
          <span className="text-[10px] text-neutral-700 font-mono">
            {scenes.length} scene{scenes.length !== 1 ? "s" : ""} · {frames.length} frames
          </span>
        </div>

        {/* ── Collapsible film-strip ────────────────────────────── */}
        <div
          className={`overflow-hidden transition-[height] duration-300 ease-in-out ${
            isOpen ? "h-[152px]" : "h-0"
          }`}
        >
          <div className="flex items-center h-[152px] px-5 gap-1">
            {frames.length === 0 ? (
              <div className="flex-1 flex items-center justify-center opacity-40">
                <p className="text-[11px] text-neutral-600 italic">
                  Add scenes to build your storyboard.
                </p>
              </div>
            ) : (
              <div
                className="flex-1 overflow-x-auto overflow-y-hidden"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}
              >
                <div className="flex gap-2 h-full items-center pr-2">
                  {frames.map((frame) => (
                    <FilmFrameCard key={frame.id} frame={frame} />
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

// ─── FilmFrameCard ────────────────────────────────────────────────────────────

function FilmFrameCard({ frame }: { frame: FilmFrame }) {
  const isStart = frame.frameType === "Start";

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-default select-none group">
      {/* Thumbnail */}
      <div
        className={`relative w-[88px] h-[88px] rounded-lg overflow-hidden border bg-neutral-900 transition-all duration-200 group-hover:scale-[1.03] ${
          frame.thumbnail
            ? "border-white/10 group-hover:border-white/20"
            : "border-neutral-800/60 group-hover:border-neutral-700/60"
        }`}
      >
        {frame.thumbnail ? (
          <img
            src={frame.thumbnail}
            alt={`Scene ${frame.sceneIndex + 1} ${frame.frameType}`}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable={false}
          />
        ) : (
          /* Empty slot */
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
        )}

        {/* Frame label badge — top left */}
        <div className="absolute top-1 left-1 px-1.5 py-px rounded bg-black/70 text-[8px] font-mono text-neutral-300 leading-none tabular-nums">
          {frame.frameLabel}
        </div>

        {/* Start / End chip — bottom right */}
        <div
          className={`absolute bottom-1 right-1 px-1.5 py-px rounded text-[8px] leading-none uppercase tracking-wide font-medium ${
            isStart
              ? "bg-blue-950/80 text-blue-400"
              : "bg-violet-950/80 text-violet-400"
          }`}
        >
          {frame.frameType}
        </div>
      </div>

      {/* Caption */}
      <p className="w-[88px] text-[9px] text-neutral-700 text-center leading-snug line-clamp-2 group-hover:text-neutral-500 transition-colors">
        {frame.sceneAction.trim() || `Scene ${frame.sceneIndex + 1}`}
      </p>
    </div>
  );
}
