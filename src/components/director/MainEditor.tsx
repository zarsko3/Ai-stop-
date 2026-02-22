"use client";

import { useDirectorStore } from "@/store/directorStore";
import { SceneBlock } from "./SceneBlock";

export function MainEditor() {
  const scenes = useDirectorStore((s) => s.scenes);
  const addScene = useDirectorStore((s) => s.addScene);

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-neutral-950">
      <div className="max-w-4xl mx-auto px-8 py-10 pb-24">

        {/* ── Page heading ───────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-neutral-200 tracking-tight">
            Script
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Each scene generates a start and end frame for AI video production.
          </p>
        </div>

        {/* ── Scene list ─────────────────────────────────────────── */}
        <div className="space-y-5">
          {scenes.map((scene, index) => (
            <SceneBlock
              key={scene.id}
              sceneId={scene.id}
              index={index}
              isOnly={scenes.length === 1}
            />
          ))}
        </div>

        {/* ── Add Scene button ───────────────────────────────────── */}
        <div className="mt-6">
          <button
            onClick={addScene}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-dashed border-neutral-800 text-neutral-600 hover:text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/50 transition-all group w-full justify-center"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-sm font-medium">Add Scene</span>
          </button>
        </div>
      </div>
    </main>
  );
}
