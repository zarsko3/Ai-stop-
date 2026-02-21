"use client";

import { useCallback, useEffect } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { useCommentNavigation } from "@/hooks/useCommentNavigation";
import { useWorkflowStore } from "@/store/workflowStore";
import { SceneNodeData, CharacterNodeData, StyleNodeData } from "@/types";

type SceneNodeType = Node<SceneNodeData, "scene">;

// ---------------------------------------------------------------------------
// Module-level equality function — stable reference, never recreated.
//
// Zustand calls this on every store update to decide whether to trigger a
// React re-render.  We compare only the TEXT and IMAGE DATA fields of the
// connected character/style nodes.  Because React Flow stores node X/Y in the
// same nodes array, a plain `nodes` subscription re-renders on every drag.
// This function ignores position changes entirely.
// ---------------------------------------------------------------------------
function connectedDataEqual(
  prev: { characterData: CharacterNodeData | null; styleData: StyleNodeData | null },
  next: { characterData: CharacterNodeData | null; styleData: StyleNodeData | null }
): boolean {
  return (
    prev.characterData?.baseDescription === next.characterData?.baseDescription &&
    prev.characterData?.referenceImage  === next.characterData?.referenceImage  &&
    prev.styleData?.lighting   === next.styleData?.lighting   &&
    prev.styleData?.cameraShot === next.styleData?.cameraShot &&
    prev.styleData?.vibe       === next.styleData?.vibe
  );
}

export function SceneNode({ id, data, selected }: NodeProps<SceneNodeType>) {
  const nodeData = data;
  const commentNavigation = useCommentNavigation(id);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  // ---------------------------------------------------------------------------
  // Optimized store subscription
  //
  // A single selector traverses edges → nodes for THIS node's connections and
  // returns only the data fields we care about.  The custom equality function
  // `connectedDataEqual` ensures React only re-renders when actual character /
  // style DATA changes — not when any node is dragged on the canvas.
  // ---------------------------------------------------------------------------
  const { characterData, styleData } = useWorkflowStore(
    useCallback(
      (state) => {
        const characterEdge = state.edges.find(
          (e) => e.target === id && e.targetHandle === "character-in"
        );
        const styleEdge = state.edges.find(
          (e) => e.target === id && e.targetHandle === "style-in"
        );

        const charNode = characterEdge
          ? state.nodes.find((n) => n.id === characterEdge.source)
          : null;
        const styleNode = styleEdge
          ? state.nodes.find((n) => n.id === styleEdge.source)
          : null;

        return {
          characterData:
            charNode?.type === "character"
              ? (charNode.data as CharacterNodeData)
              : null,
          styleData:
            styleNode?.type === "style"
              ? (styleNode.data as StyleNodeData)
              : null,
        };
      },
      [id]
    ),
    connectedDataEqual
  );

  // ---------------------------------------------------------------------------
  // Derived values — recompute and persist whenever upstream data or the
  // local action prompt changes.  A guard prevents unnecessary store writes
  // (and the update loop they would cause).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const textParts = [
      characterData?.baseDescription,
      nodeData.actionPrompt,
      styleData?.lighting,
      styleData?.cameraShot,
      styleData?.vibe,
    ].filter((s): s is string => typeof s === "string" && s.trim() !== "");

    const nextPrompt = textParts.join(", ");
    const nextImage  = characterData?.referenceImage ?? null;

    if (nextPrompt !== nodeData.computedPrompt || nextImage !== nodeData.referenceImage) {
      updateNodeData(id, { computedPrompt: nextPrompt, referenceImage: nextImage });
    }
  }, [
    id,
    characterData?.baseDescription,
    characterData?.referenceImage,
    styleData?.lighting,
    styleData?.cameraShot,
    styleData?.vibe,
    nodeData.actionPrompt,
    nodeData.computedPrompt,
    nodeData.referenceImage,
    updateNodeData,
  ]);

  const handleActionPromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { actionPrompt: e.target.value });
    },
    [id, updateNodeData]
  );

  const hasCharacter   = characterData !== null;
  const hasStyle       = styleData !== null;
  const hasImage       = nodeData.referenceImage !== null;

  return (
    <BaseNode
      id={id}
      title="Scene"
      customTitle={nodeData.customTitle}
      comment={nodeData.comment}
      onCustomTitleChange={(title) => updateNodeData(id, { customTitle: title || undefined })}
      onCommentChange={(comment) => updateNodeData(id, { comment: comment || undefined })}
      selected={selected}
      commentNavigation={commentNavigation ?? undefined}
    >
      {/* ── Input handles (left side) ───────────────────────────────────── */}
      <Handle
        type="target"
        position={Position.Left}
        id="character-in"
        style={{ top: "35%" }}
        className="!bg-rose-500 !w-3 !h-3"
        title="Character input"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="style-in"
        style={{ top: "65%" }}
        className="!bg-purple-500 !w-3 !h-3"
        title="Style input"
      />

      <div className="flex flex-col gap-3">

        {/* ── Connection status badges + reference image thumbnail ───────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Character badge — shows thumbnail when an image is available */}
          {hasCharacter && hasImage ? (
            <div className="flex items-center gap-1.5">
              <img
                src={nodeData.referenceImage!}
                alt="Character ref"
                className="w-6 h-6 rounded object-cover border border-rose-700/60 shrink-0"
              />
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border text-rose-300 border-rose-700 bg-rose-900/30">
                ✓ Character
              </span>
            </div>
          ) : (
            <span
              className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${
                hasCharacter
                  ? "text-rose-300 border-rose-700 bg-rose-900/30"
                  : "text-neutral-500 border-neutral-700"
              }`}
            >
              {hasCharacter ? "✓ Character" : "No Character"}
            </span>
          )}

          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${
              hasStyle
                ? "text-purple-300 border-purple-700 bg-purple-900/30"
                : "text-neutral-500 border-neutral-700"
            }`}
          >
            {hasStyle ? "✓ Style" : "No Style"}
          </span>

          {/* Image-attached badge for the image-out handle */}
          {hasImage && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border text-amber-300 border-amber-700 bg-amber-900/30">
              🖼 Image
            </span>
          )}
        </div>

        {/* ── Action prompt ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
            Action
          </label>
          <textarea
            value={nodeData.actionPrompt}
            onChange={handleActionPromptChange}
            placeholder="e.g. running in the rain, looking at the horizon..."
            className="nodrag nopan nowheel w-full min-h-[60px] p-2 text-xs leading-relaxed text-neutral-100 border border-neutral-700 rounded bg-neutral-900/50 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-600/60 placeholder:text-neutral-500"
          />
        </div>

        {/* ── Computed prompt preview (read-only) ──────────────────────────── */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
            Computed Prompt
          </label>
          <div className="p-2 rounded border border-neutral-700/60 bg-neutral-900/30 min-h-[52px]">
            {nodeData.computedPrompt ? (
              <p className="text-[10px] text-emerald-300 leading-relaxed break-words whitespace-pre-wrap">
                {nodeData.computedPrompt}
              </p>
            ) : (
              <p className="text-[10px] text-neutral-600 italic">
                Connect Character and Style nodes, then add an action...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Output handles (right side) ─────────────────────────────────── */}

      {/* Text prompt → nanoBanana / llmGenerate */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        style={{ top: "38%" }}
        data-handletype="text"
        className="!bg-emerald-500 !w-3 !h-3"
        title="Prompt output (text)"
      />

      {/* Character reference image → nanoBanana / generate nodes for FaceID/ControlNet */}
      <Handle
        type="source"
        position={Position.Right}
        id="image-out"
        style={{ top: "68%" }}
        data-handletype="image"
        className="!bg-amber-400 !w-3 !h-3"
        title="Reference image output"
      />
    </BaseNode>
  );
}
