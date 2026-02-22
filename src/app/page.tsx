"use client";

import { DirectorHeader } from "@/components/director/DirectorHeader";
import { Sidebar } from "@/components/director/Sidebar";
import { MainEditor } from "@/components/director/MainEditor";
import { StoryboardPanel } from "@/components/StoryboardPanel";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Top bar */}
      <DirectorHeader />

      {/* Sidebar + scrolling editor */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <MainEditor />
      </div>

      {/* Fixed bottom film-strip */}
      <StoryboardPanel />
    </div>
  );
}
