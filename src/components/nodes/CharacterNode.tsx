"use client";

import { useCallback, useRef } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { useCommentNavigation } from "@/hooks/useCommentNavigation";
import { useWorkflowStore } from "@/store/workflowStore";
import { CharacterNodeData } from "@/types";

type CharacterNodeType = Node<CharacterNodeData, "character">;

export function CharacterNode({ id, data, selected }: NodeProps<CharacterNodeType>) {
  const nodeData = data;
  const commentNavigation = useCommentNavigation(id);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
        alert("Unsupported format. Use PNG, JPG, or WebP.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Image too large. Maximum size is 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        updateNodeData(id, { referenceImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    },
    [id, updateNodeData]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleRemoveImage = useCallback(() => {
    updateNodeData(id, { referenceImage: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [id, updateNodeData]);

  return (
    <BaseNode
      id={id}
      title="Character"
      customTitle={nodeData.customTitle}
      comment={nodeData.comment}
      onCustomTitleChange={(title) => updateNodeData(id, { customTitle: title || undefined })}
      onCommentChange={(comment) => updateNodeData(id, { comment: comment || undefined })}
      selected={selected}
      commentNavigation={commentNavigation ?? undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col gap-2">
        {/* Reference image */}
        <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
          Reference Image
        </span>

        {nodeData.referenceImage ? (
          <div className="relative group">
            <img
              src={nodeData.referenceImage}
              alt="Character reference"
              className="w-full h-28 object-contain rounded border border-neutral-700"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full h-24 border border-dashed border-neutral-600 rounded flex flex-col items-center justify-center cursor-pointer hover:border-rose-600/60 hover:bg-rose-950/20 transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-[10px] text-neutral-400 mt-1">Drop or click</span>
          </div>
        )}

        {/* Description */}
        <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide mt-1">
          Description
        </span>
        <textarea
          value={nodeData.baseDescription}
          onChange={(e) => updateNodeData(id, { baseDescription: e.target.value })}
          placeholder="e.g. a tall warrior with silver armor and a flowing red cape..."
          className="nodrag nopan nowheel w-full min-h-[72px] p-2 text-xs leading-relaxed text-neutral-100 border border-neutral-700 rounded bg-neutral-900/50 resize-none focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-600/60 placeholder:text-neutral-500"
        />
      </div>

      {/* Character output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="character-out"
        className="!bg-rose-500 !w-3 !h-3"
        title="Character output"
      />
    </BaseNode>
  );
}
