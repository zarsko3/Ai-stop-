"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { useCommentNavigation } from "@/hooks/useCommentNavigation";
import { useWorkflowStore } from "@/store/workflowStore";
import { SceneNodeData, CharacterNodeData, StyleNodeData } from "@/types";

type SceneNodeType = Node<SceneNodeData, "scene">;

export function SceneNode({ id, data, selected }: NodeProps<SceneNodeType>) {
  const nodeData = data;
  const commentNavigation = useCommentNavigation(id);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  // Resolve upstream character and style data from connected nodes
  const { characterData, styleData } = useMemo(() => {
    const characterEdge = edges.find(
      (e) => e.target === id && e.targetHandle === "character-in"
    );
    const styleEdge = edges.find(
      (e) => e.target === id && e.targetHandle === "style-in"
    );

    const charNode = characterEdge
      ? nodes.find((n) => n.id === characterEdge.source)
      : null;
    const styleNode = styleEdge
      ? nodes.find((n) => n.id === styleEdge.source)
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
  }, [id, nodes, edges]);

  // Recompute and persist the combined prompt whenever any dependency changes
  useEffect(() => {
    const parts = [
      characterData?.baseDescription,
      nodeData.actionPrompt,
      styleData?.lighting,
      styleData?.cameraShot,
      styleData?.vibe,
    ].filter((s): s is string => typeof s === "string" && s.trim() !== "");

    const computed = parts.join(", ");
    if (computed !== nodeData.computedPrompt) {
      updateNodeData(id, { computedPrompt: computed });
    }
  }, [
    id,
    characterData?.baseDescription,
    styleData?.lighting,
    styleData?.cameraShot,
    styleData?.vibe,
    nodeData.actionPrompt,
    nodeData.computedPrompt,
    updateNodeData,
  ]);

  const handleActionPromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { actionPrompt: e.target.value });
    },
    [id, updateNodeData]
  );

  const hasCharacter = characterData !== null;
  const hasStyle = styleData !== null;

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
      {/* Character input handle (top-left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="character-in"
        style={{ top: "35%" }}
        className="!bg-rose-500 !w-3 !h-3"
        title="Character input"
      />

      {/* Style input handle (bottom-left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="style-in"
        style={{ top: "65%" }}
        className="!bg-purple-500 !w-3 !h-3"
        title="Style input"
      />

      <div className="flex flex-col gap-3">
        {/* Connection status */}
        <div className="flex gap-1.5 flex-wrap">
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${
              hasCharacter
                ? "text-rose-300 border-rose-700 bg-rose-900/30"
                : "text-neutral-500 border-neutral-700"
            }`}
          >
            {hasCharacter ? "✓ Character" : "No Character"}
          </span>
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${
              hasStyle
                ? "text-purple-300 border-purple-700 bg-purple-900/30"
                : "text-neutral-500 border-neutral-700"
            }`}
          >
            {hasStyle ? "✓ Style" : "No Style"}
          </span>
        </div>

        {/* Action prompt */}
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

        {/* Computed prompt (read-only preview) */}
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

      {/* Prompt output handle (text type — connects to nanoBanana, llmGenerate, etc.) */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        data-handletype="text"
        className="!bg-emerald-500 !w-3 !h-3"
        title="Prompt output (text)"
      />
    </BaseNode>
  );
}
