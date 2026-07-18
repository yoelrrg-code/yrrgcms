"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_DEFINITIONS, type Block, type BlockDefinition } from "@/components/blocks/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MediaPicker from "@/components/admin/MediaPicker/MediaPicker";
import RichTextEditor from "@/components/admin/RichTextEditor/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GripVertical, Pencil, Trash2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { nanoid } from "./nanoid";

// ─── SortableBlockItem ────────────────────────────────────────────────────────

interface SortableBlockItemProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onDelete,
}: SortableBlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const definition = BLOCK_DEFINITIONS.find((d) => d.type === block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border p-3 bg-card transition-colors",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Block info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {definition?.label ?? block.type}
        </p>
        <Badge variant="outline" className="text-xs mt-0.5">
          {block.type}
        </Badge>
      </div>

      {/* Actions */}
      <Button
        type="button"
        variant={isSelected ? "secondary" : "ghost"}
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onSelect}
        title="Edit block"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
        onClick={onDelete}
        title="Delete block"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── PropEditor ──────────────────────────────────────────────────────────────

interface PropEditorProps {
  block: Block;
  onChange: (updatedProps: Record<string, unknown>) => void;
  onClose: () => void;
}

function PropEditor({ block, onChange, onClose }: PropEditorProps) {
  const [localProps, setLocalProps] = useState<Record<string, unknown>>({ ...block.props });

  const handleChange = (key: string, value: unknown) => {
    const updated = { ...localProps, [key]: value };
    setLocalProps(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          Editing: {BLOCK_DEFINITIONS.find((d: BlockDefinition) => d.type === block.type)?.label ?? block.type}
        </h3>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {Object.entries(localProps).map(([key, value]) => {
          const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

          const isImageField =
            typeof value === "string" &&
            (key.toLowerCase().includes("image") && !key.toLowerCase().includes("position") && !key.toLowerCase().includes("alt") ||
              key.toLowerCase().includes("icon") && !key.toLowerCase().includes("position") && !key.toLowerCase().includes("alt") ||
              key.toLowerCase().includes("logo") && !key.toLowerCase().includes("position") && !key.toLowerCase().includes("alt") ||
              key.toLowerCase().includes("avatar") && !key.toLowerCase().includes("position") && !key.toLowerCase().includes("alt") ||
              key.toLowerCase() === "src");

          if (isImageField) {
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <div className="flex gap-2">
                  <Input
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="h-8 text-sm"
                  />
                  <MediaPicker
                    onSelect={(url) => handleChange(key, url)}
                    trigger={
                      <Button type="button" variant="outline" size="sm" className="h-8">
                        Browse
                      </Button>
                    }
                  />
                </div>
              </div>
            );
          }

          // Use RichTextEditor for 'content' key
          if (key === "content") {
            let editorContent = value;
            if (typeof value === "string") {
              try {
                editorContent = JSON.parse(value);
              } catch {
                // If it's a raw string that isn't JSON, just pass the string
              }
            }

            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <div className="border rounded-md">
                  <RichTextEditor
                    content={editorContent}
                    onChange={(val) => handleChange(key, val)}
                  />
                </div>
              </div>
            );
          }

          // Render textarea for long string values
          if (typeof value === "string" && value.length > 80) {
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <Textarea
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={4}
                  className="text-sm font-mono"
                />
              </div>
            );
          }

          // Boolean
          if (typeof value === "boolean") {
            return (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`prop-${key}`}
                  checked={value}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <label htmlFor={`prop-${key}`} className="text-xs font-medium text-muted-foreground">
                  {label}
                </label>
              </div>
            );
          }

          // Number
          if (typeof value === "number") {
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            );
          }

          // Object / array — show JSON editor
          if (typeof value === "object" && value !== null) {
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{label} (JSON)</label>
                <Textarea
                  defaultValue={JSON.stringify(value, null, 2)}
                  onChange={(e) => {
                    try {
                      handleChange(key, JSON.parse(e.target.value));
                    } catch {
                      // ignore invalid JSON while typing
                    }
                  }}
                  rows={5}
                  className="text-xs font-mono"
                />
              </div>
            );
          }

          // Default: string input
          return (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <Input
                value={String(value ?? "")}
                onChange={(e) => handleChange(key, e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BlockEditor ─────────────────────────────────────────────────────────────

export interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedBlock = blocks.find((b: Block) => b.id === selectedId) ?? null;

  // ── DnD ──────────────────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = blocks.findIndex((b: Block) => b.id === active.id);
      const newIndex = blocks.findIndex((b: Block) => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    },
    [blocks, onChange]
  );

  // ── Block operations ───────────────────────────────────────────────────
  const addBlock = (type: string) => {
    const def = BLOCK_DEFINITIONS.find((d: BlockDefinition) => d.type === type);
    if (!def) return;
    const newBlock: Block = {
      id: nanoid(),
      type: type as Block["type"],
      props: { ...(def.defaultProps as Record<string, unknown>) },
    };
    onChange([...blocks, newBlock]);
    setSelectedId(newBlock.id);
    setPaletteOpen(false);
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((b: Block) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateBlockProps = (id: string, props: Record<string, unknown>) => {
    onChange(blocks.map((b: Block) => (b.id === id ? { ...b, props } : b)));
  };

  return (
    <div className="flex gap-4 min-h-[400px]">
      {/* ── Left: block list ─────────────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-2">
        <DndContext
          id="dnd-block-editor"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b: Block) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 flex-1">
              {blocks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-md">
                  No blocks yet. Add one below.
                </p>
              )}
              {blocks.map((block: Block) => (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  isSelected={selectedId === block.id}
                  onSelect={() =>
                    setSelectedId((prev) => (prev === block.id ? null : block.id))
                  }
                  onDelete={() => deleteBlock(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add block button */}
        <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
          <SheetTrigger
            render={<Button type="button" variant="outline" className="w-full mt-2 gap-2" />}
          >
            <Plus className="h-4 w-4" />
            Add Block
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[60vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Choose a Block Type</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {BLOCK_DEFINITIONS.map((def: BlockDefinition) => (
                <button
                  key={def.type}
                  type="button"
                  onClick={() => addBlock(def.type)}
                  className="flex flex-col gap-1 rounded-md border border-border p-3 text-left hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-semibold">{def.label}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {def.description}
                  </span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ── Right: prop editor ───────────────────────────────────────── */}
      <div className="flex-1 border border-border rounded-md p-4 overflow-y-auto">
        {selectedBlock ? (
          <PropEditor
            block={selectedBlock}
            onChange={(props) => updateBlockProps(selectedBlock.id, props)}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Select a block to edit its properties.
          </div>
        )}
      </div>
    </div>
  );
}
