"use client";

import { useDirectorStore } from "@/store/directorStore";

export function DirectorHeader() {
  const projectName = useDirectorStore((s) => s.projectName);
  const setProjectName = useDirectorStore((s) => s.setProjectName);
  const sceneCount = useDirectorStore((s) => s.scenes.length);

  return (
    <header className="h-12 shrink-0 bg-neutral-900/80 border-b border-neutral-800/70 flex items-center px-6 gap-4 backdrop-blur-sm z-10">
      {/* Branding */}
      <div className="flex items-center gap-2.5">
        {/* Film slate icon */}
        <svg
          className="w-5 h-5 text-neutral-400"
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
        <span className="text-sm font-semibold text-neutral-200 tracking-tight">
          AI Video Studio
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-neutral-700/60" />

      {/* Editable project name */}
      <input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="text-sm text-neutral-400 bg-transparent border-none outline-none focus:text-neutral-200 w-52 transition-colors placeholder-neutral-700"
        placeholder="Untitled Project"
        spellCheck={false}
      />

      <div className="flex-1" />

      {/* Meta info */}
      <div className="flex items-center gap-4 text-[11px] text-neutral-600">
        <span className="font-mono">
          {sceneCount} scene{sceneCount !== 1 ? "s" : ""}
        </span>
        <span className="w-px h-3.5 bg-neutral-800" />
        <span>AI Video Studio Beta</span>
      </div>
    </header>
  );
}
