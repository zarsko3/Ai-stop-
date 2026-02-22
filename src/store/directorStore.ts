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

export interface SceneFrame {
  thumbnail: string | null; // base64 data URL once generated
}

export interface Scene {
  id: string;
  action: string;
  startFrame: SceneFrame;
  endFrame: SceneFrame;
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
  setFrameThumbnail: (
    sceneId: string,
    frameType: "start" | "end",
    thumbnail: string
  ) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeScene(): Scene {
  return {
    id: crypto.randomUUID(),
    action: "",
    startFrame: { thumbnail: null },
    endFrame: { thumbnail: null },
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

export const useDirectorStore = create<DirectorStore>((set) => ({
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

  setFrameThumbnail: (sceneId, frameType, thumbnail) =>
    set((state) => ({
      scenes: state.scenes.map((s) => {
        if (s.id !== sceneId) return s;
        const key = frameType === "start" ? "startFrame" : "endFrame";
        return { ...s, [key]: { thumbnail } };
      }),
    })),
}));
