import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CharacterState {
  image: string | null; // base64 data URL
  description: string;
}

export interface StyleState {
  lighting: string;
  camera: string;
  vibe: string;
}

export interface Scene {
  id: string;
  action: string;
  // Generated images (base64 data URLs returned from the API)
  startImageUrl: string | null;
  endImageUrl: string | null;
  // Async generation flags
  isGeneratingStart: boolean;
  isGeneratingEnd: boolean;
}

interface DirectorStore {
  projectName: string;
  character: CharacterState;
  style: StyleState;
  scenes: Scene[];

  setProjectName: (name: string) => void;
  updateCharacter: (partial: Partial<CharacterState>) => void;
  updateStyle: (partial: Partial<StyleState>) => void;
  addScene: () => void;
  updateScene: (id: string, partial: Partial<Pick<Scene, "action">>) => void;
  removeScene: (id: string) => void;
  generateFrameImage: (sceneId: string, frameType: "start" | "end") => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeScene(): Scene {
  return {
    id: crypto.randomUUID(),
    action: "",
    startImageUrl: null,
    endImageUrl: null,
    isGeneratingStart: false,
    isGeneratingEnd: false,
  };
}

/**
 * Computes the combined prompt for a scene from global character/style state
 * and the scene-level action text.
 */
export function buildPrompt(
  character: CharacterState,
  style: StyleState,
  action: string
): string {
  const parts: string[] = [];
  if (character.description.trim()) parts.push(character.description.trim());
  if (style.vibe.trim()) parts.push(style.vibe.trim());
  if (style.lighting.trim()) parts.push(`Lighting: ${style.lighting.trim()}`);
  if (style.camera.trim()) parts.push(`Camera: ${style.camera.trim()}`);
  if (action.trim()) parts.push(action.trim());
  return parts.join(". ") || "No prompt configured yet.";
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDirectorStore = create<DirectorStore>((set, get) => ({
  projectName: "Untitled Project",
  character: { image: null, description: "" },
  style: { lighting: "", camera: "", vibe: "" },
  scenes: [makeScene()],

  setProjectName: (name) => set({ projectName: name }),

  updateCharacter: (partial) =>
    set((state) => ({ character: { ...state.character, ...partial } })),

  updateStyle: (partial) =>
    set((state) => ({ style: { ...state.style, ...partial } })),

  addScene: () =>
    set((state) => ({ scenes: [...state.scenes, makeScene()] })),

  updateScene: (id, partial) =>
    set((state) => ({
      scenes: state.scenes.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    })),

  removeScene: (id) =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== id),
    })),

  generateFrameImage: async (sceneId, frameType) => {
    const { character, style, scenes } = get();
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    const generatingKey =
      frameType === "start" ? "isGeneratingStart" : "isGeneratingEnd";

    // ── Mark generating ────────────────────────────────────────────────────
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === sceneId ? { ...s, [generatingKey]: true } : s
      ),
    }));

    try {
      const prompt = buildPrompt(character, style, scene.action);

      // Build the request body.  Pass the character reference image when
      // available so the model can apply FaceID / image-to-image guidance.
      const body: Record<string, unknown> = {
        prompt,
        model: "nano-banana",
        aspectRatio: "16:9",
      };

      if (character.image) {
        body.images = [character.image];
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as {
        success: boolean;
        image?: string;
        error?: string;
      };

      if (!res.ok || !data.success || !data.image) {
        throw new Error(data.error ?? "Generation failed — no image returned");
      }

      // ── Persist result ─────────────────────────────────────────────────
      const imageKey = frameType === "start" ? "startImageUrl" : "endImageUrl";
      set((state) => ({
        scenes: state.scenes.map((s) =>
          s.id === sceneId
            ? { ...s, [imageKey]: data.image!, [generatingKey]: false }
            : s
        ),
      }));
    } catch (_err) {
      // Clear the loading flag; the placeholder remains empty so users can retry
      set((state) => ({
        scenes: state.scenes.map((s) =>
          s.id === sceneId ? { ...s, [generatingKey]: false } : s
        ),
      }));
    }
  },
}));
