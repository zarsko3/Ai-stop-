"use client";

import { useRef, type ChangeEvent } from "react";
import { useDirectorStore } from "@/store/directorStore";

// ─── Field helpers ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-4 flex items-center gap-2">
      {children}
    </h2>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium text-neutral-500 mb-1.5 tracking-wide">
      {children}
    </p>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600/30 transition-all"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const character = useDirectorStore((s) => s.character);
  const style = useDirectorStore((s) => s.style);
  const updateCharacter = useDirectorStore((s) => s.updateCharacter);
  const updateStyle = useDirectorStore((s) => s.updateStyle);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      updateCharacter({ image: ev.target?.result as string });
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <aside className="w-72 shrink-0 border-r border-neutral-800/70 bg-neutral-950 flex flex-col overflow-y-auto">
      <div className="p-5 space-y-8">

        {/* ── Character ──────────────────────────────────────────── */}
        <section>
          <SectionHeading>
            {/* Person icon */}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Character
          </SectionHeading>

          {/* Reference image */}
          <div className="mb-4">
            <Label>Reference Image</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="relative w-full aspect-square rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/60 hover:border-neutral-600 transition-all group"
              title="Upload character reference image"
            >
              {character.image ? (
                <>
                  <img
                    src={character.image}
                    alt="Character reference"
                    className="w-full h-full object-cover"
                  />
                  {/* Replace overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white font-medium">Replace</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40 group-hover:opacity-70 transition-opacity">
                  <svg className="w-8 h-8 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-[11px] text-neutral-500">Upload reference</span>
                </div>
              )}
            </button>
          </div>

          {/* Physical description */}
          <div>
            <Label>Physical Description</Label>
            <textarea
              value={character.description}
              onChange={(e) => updateCharacter({ description: e.target.value })}
              placeholder="A woman with long red hair, early 30s, wearing a dark trench coat..."
              rows={4}
              className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600/30 transition-all resize-none leading-relaxed"
            />
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-neutral-800/60" />

        {/* ── Style ──────────────────────────────────────────────── */}
        <section>
          <SectionHeading>
            {/* Sparkle / wand icon */}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Style
          </SectionHeading>

          <div className="space-y-4">
            <div>
              <Label>Lighting</Label>
              <TextInput
                value={style.lighting}
                onChange={(v) => updateStyle({ lighting: v })}
                placeholder="Golden hour, soft diffused..."
              />
            </div>

            <div>
              <Label>Camera</Label>
              <TextInput
                value={style.camera}
                onChange={(v) => updateStyle({ camera: v })}
                placeholder="35mm, wide angle, close-up..."
              />
            </div>

            <div>
              <Label>Vibe</Label>
              <TextInput
                value={style.vibe}
                onChange={(v) => updateStyle({ vibe: v })}
                placeholder="Cinematic noir, vibrant, moody..."
              />
            </div>
          </div>
        </section>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </aside>
  );
}
