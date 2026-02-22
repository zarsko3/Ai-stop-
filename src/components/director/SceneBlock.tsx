"use client";

import { useMemo } from "react";
import { useDirectorStore, buildPrompt, type Scene } from "@/store/directorStore";

// ─── FrameSection ─────────────────────────────────────────────────────────────

interface FrameSectionProps {
  title: string;
  frameLabel: string; // e.g. "S" or "E" chip
  thumbnail: string | null;
  prompt: string;
}

function FrameSection({ title, frameLabel, thumbnail, prompt }: FrameSectionProps) {
  return (
    <div className="flex-1 bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-4 flex flex-col gap-3 min-w-0">
      {/* Frame header */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-neutral-800 text-[9px] font-bold text-neutral-400 uppercase tracking-wide">
          {frameLabel}
        </span>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
          {title}
        </span>
      </div>

      {/* Computed prompt — read-only */}
      <div className="rounded-lg bg-neutral-950/70 border border-neutral-800/50 px-3 py-2.5">
        <p className="text-[11px] text-neutral-500 leading-relaxed font-mono line-clamp-3">
          {prompt}
        </p>
      </div>

      {/* Thumbnail */}
      <div className="w-full aspect-video rounded-lg overflow-hidden border border-neutral-800/50 bg-neutral-950/50 flex items-center justify-center">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-25">
            <svg
              className="w-7 h-7 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="text-[10px] text-neutral-600 tracking-wide">No image yet</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SceneBlock ───────────────────────────────────────────────────────────────

interface SceneBlockProps {
  sceneId: string;
  index: number;
  isOnly: boolean; // disable remove when it's the last scene
}

export function SceneBlock({ sceneId, index, isOnly }: SceneBlockProps) {
  // Targeted subscriptions to minimise re-renders
  const scene = useDirectorStore(
    (s) => s.scenes.find((sc) => sc.id === sceneId) as Scene
  );
  const character = useDirectorStore((s) => s.character);
  const style = useDirectorStore((s) => s.style);
  const updateScene = useDirectorStore((s) => s.updateScene);
  const removeScene = useDirectorStore((s) => s.removeScene);

  const prompt = useMemo(
    () => buildPrompt(character, style, scene.action),
    [character, style, scene.action]
  );

  if (!scene) return null;

  return (
    <article className="bg-neutral-900/40 border border-neutral-800/70 rounded-2xl overflow-hidden">

      {/* ── Scene header bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/50">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-neutral-600 tracking-[0.2em]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-sm font-semibold text-neutral-300 tracking-tight">
            Scene
          </h3>
          <div className="w-px h-3.5 bg-neutral-700/60" />
          <span className="text-[11px] text-neutral-600 italic line-clamp-1 max-w-xs">
            {scene.action.trim() || "Add a scene action below…"}
          </span>
        </div>

        {/* Remove scene */}
        {!isOnly && (
          <button
            onClick={() => removeScene(sceneId)}
            className="p-1.5 rounded-lg text-neutral-700 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Remove scene"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="p-6 space-y-5">

        {/* Scene Action textarea */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600 mb-2">
            Scene Action
          </label>
          <textarea
            value={scene.action}
            onChange={(e) => updateScene(sceneId, { action: e.target.value })}
            placeholder="Describe what happens in this scene — the action, mood, movement, and key story beat…"
            rows={3}
            className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700/40 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Start / End frame split view */}
        <div className="flex gap-4">
          <FrameSection
            title="Start Frame"
            frameLabel="S"
            thumbnail={scene.startFrame.thumbnail}
            prompt={prompt}
          />
          <FrameSection
            title="End Frame"
            frameLabel="E"
            thumbnail={scene.endFrame.thumbnail}
            prompt={prompt}
          />
        </div>
      </div>
    </article>
  );
}
