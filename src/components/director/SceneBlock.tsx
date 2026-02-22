"use client";

import { useMemo, useCallback } from "react";
import { useDirectorStore, buildPrompt, type Scene } from "@/store/directorStore";

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── FrameSection ─────────────────────────────────────────────────────────────

interface FrameSectionProps {
  title: string;
  frameLabel: string;
  imageUrl: string | null;
  isGenerating: boolean;
  prompt: string;
  onGenerate: () => void;
}

function FrameSection({
  title,
  frameLabel,
  imageUrl,
  isGenerating,
  prompt,
  onGenerate,
}: FrameSectionProps) {
  const isStart = frameLabel === "S";

  return (
    <div className="flex-1 bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-4 flex flex-col gap-3 min-w-0">

      {/* ── Frame header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[9px] font-bold uppercase tracking-wide ${
              isStart
                ? "bg-blue-950/70 text-blue-400"
                : "bg-violet-950/70 text-violet-400"
            }`}
          >
            {frameLabel}
          </span>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
            {title}
          </span>
        </div>

        {/* Header generate / spinner button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          title={isGenerating ? "Generating…" : imageUrl ? "Regenerate image" : "Generate image"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
            isGenerating
              ? "text-neutral-600 cursor-not-allowed"
              : imageUrl
              ? "text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60"
              : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
          }`}
        >
          {isGenerating ? (
            <SpinnerIcon className="w-3 h-3 animate-spin text-neutral-500" />
          ) : (
            <SparkleIcon className="w-3 h-3" />
          )}
          <span>{isGenerating ? "Generating" : imageUrl ? "Regenerate" : "Generate"}</span>
        </button>
      </div>

      {/* ── Computed prompt — read-only ──────────────────────────── */}
      <div className="rounded-lg bg-neutral-950/70 border border-neutral-800/50 px-3 py-2.5">
        <p className="text-[11px] text-neutral-500 leading-relaxed font-mono line-clamp-3">
          {prompt}
        </p>
      </div>

      {/* ── Thumbnail area ───────────────────────────────────────── */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-neutral-800/50 bg-neutral-950/60">

        {isGenerating ? (
          /* ── Pulsing skeleton loader ── */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900/80">
            {/* Shimmer bars */}
            <div className="w-3/4 space-y-2">
              <div className="h-1.5 rounded-full bg-neutral-800 animate-pulse" />
              <div className="h-1.5 rounded-full bg-neutral-800 animate-pulse w-5/6" style={{ animationDelay: "150ms" }} />
              <div className="h-1.5 rounded-full bg-neutral-800 animate-pulse w-2/3" style={{ animationDelay: "300ms" }} />
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <SpinnerIcon className="w-4 h-4 animate-spin" />
              <span className="text-[11px] font-medium tracking-wide">Generating…</span>
            </div>
          </div>

        ) : imageUrl ? (
          /* ── Generated image ── */
          <>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay: regenerate */}
            <button
              onClick={onGenerate}
              className="absolute inset-0 bg-black/55 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
            >
              <SparkleIcon className="w-5 h-5 text-white" />
              <span className="text-xs text-white font-medium tracking-wide">Regenerate</span>
            </button>
          </>

        ) : (
          /* ── Empty state: primary Generate CTA ── */
          <button
            onClick={onGenerate}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 group hover:bg-neutral-900/40 transition-all"
          >
            <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
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
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
                />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800/70 border border-neutral-700/60 text-neutral-400 group-hover:text-neutral-200 group-hover:border-neutral-600 group-hover:bg-neutral-800 transition-all">
              <SparkleIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Generate Image</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── SceneBlock ───────────────────────────────────────────────────────────────

interface SceneBlockProps {
  sceneId: string;
  index: number;
  isOnly: boolean;
}

export function SceneBlock({ sceneId, index, isOnly }: SceneBlockProps) {
  const scene = useDirectorStore(
    (s) => s.scenes.find((sc) => sc.id === sceneId) as Scene
  );
  const character = useDirectorStore((s) => s.character);
  const style = useDirectorStore((s) => s.style);
  const updateScene = useDirectorStore((s) => s.updateScene);
  const removeScene = useDirectorStore((s) => s.removeScene);
  const generateFrameImage = useDirectorStore((s) => s.generateFrameImage);

  const prompt = useMemo(
    () => buildPrompt(character, style, scene?.action ?? ""),
    [character, style, scene?.action]
  );

  const handleGenerateStart = useCallback(
    () => generateFrameImage(sceneId, "start"),
    [generateFrameImage, sceneId]
  );

  const handleGenerateEnd = useCallback(
    () => generateFrameImage(sceneId, "end"),
    [generateFrameImage, sceneId]
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
            imageUrl={scene.startImageUrl}
            isGenerating={scene.isGeneratingStart}
            prompt={prompt}
            onGenerate={handleGenerateStart}
          />
          <FrameSection
            title="End Frame"
            frameLabel="E"
            imageUrl={scene.endImageUrl}
            isGenerating={scene.isGeneratingEnd}
            prompt={prompt}
            onGenerate={handleGenerateEnd}
          />
        </div>
      </div>
    </article>
  );
}
