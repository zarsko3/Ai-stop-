"use client";

import { useCallback } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { useCommentNavigation } from "@/hooks/useCommentNavigation";
import { useWorkflowStore } from "@/store/workflowStore";
import { StyleNodeData } from "@/types";

type StyleNodeType = Node<StyleNodeData, "style">;

const STYLE_FIELDS: Array<{
  key: keyof Pick<StyleNodeData, "lighting" | "cameraShot" | "vibe">;
  label: string;
  placeholder: string;
}> = [
  {
    key: "lighting",
    label: "Lighting",
    placeholder: "e.g. golden hour, hard rim light, overcast...",
  },
  {
    key: "cameraShot",
    label: "Camera Shot",
    placeholder: "e.g. low angle wide shot, extreme close-up...",
  },
  {
    key: "vibe",
    label: "Vibe",
    placeholder: "e.g. cinematic, gritty neo-noir, dreamlike...",
  },
];

export function StyleNode({ id, data, selected }: NodeProps<StyleNodeType>) {
  const nodeData = data;
  const commentNavigation = useCommentNavigation(id);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleChange = useCallback(
    (field: keyof Pick<StyleNodeData, "lighting" | "cameraShot" | "vibe">) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { [field]: e.target.value });
      },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      id={id}
      title="Style"
      customTitle={nodeData.customTitle}
      comment={nodeData.comment}
      onCustomTitleChange={(title) => updateNodeData(id, { customTitle: title || undefined })}
      onCommentChange={(comment) => updateNodeData(id, { comment: comment || undefined })}
      selected={selected}
      commentNavigation={commentNavigation ?? undefined}
    >
      <div className="flex flex-col gap-3">
        {STYLE_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
              {label}
            </label>
            <input
              type="text"
              value={nodeData[key]}
              onChange={handleChange(key)}
              placeholder={placeholder}
              className="nodrag nopan w-full p-2 text-xs text-neutral-100 border border-neutral-700 rounded bg-neutral-900/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-600/60 placeholder:text-neutral-500"
            />
          </div>
        ))}
      </div>

      {/* Style output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="style-out"
        className="!bg-purple-500 !w-3 !h-3"
        title="Style output"
      />
    </BaseNode>
  );
}
