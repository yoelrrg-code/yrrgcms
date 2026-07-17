"use client";

import { use, useState, useEffect } from "react";
import { getMenuById, saveMenuItems } from "@/lib/actions/menus";
import { getPages } from "@/lib/actions/pages";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableMenuItem({
  item,
  updateItem,
  removeItem,
  pages,
  allItems,
}: {
  item: any;
  updateItem: (id: string, updates: any) => void;
  removeItem: (id: string) => void;
  pages: any[];
  allItems: any[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const possibleParents = allItems.filter(
    (i) => i.id !== item.id && !i.parentId // Simple 1-level deep nesting limit for safety, or any
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-4 p-4 mb-4 border rounded-md bg-card relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab pt-2 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={item.label}
              onChange={(e) => updateItem(item.id, { label: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Parent Item (Nesting)</Label>
            <Select
              value={item.parentId || "none"}
              onValueChange={(val) =>
                updateItem(item.id, { parentId: val === "none" ? null : val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No parent (Top Level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (Top Level)</SelectItem>
                {possibleParents.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>URL (External)</Label>
            <Input
              value={item.url || ""}
              onChange={(e) =>
                updateItem(item.id, { url: e.target.value, pageId: null })
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Or Link to Page</Label>
            <Select
              value={item.pageId || "none"}
              onValueChange={(val) =>
                updateItem(item.id, {
                  pageId: val === "none" ? null : val,
                  url: null,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {pages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Target</Label>
            <Select
              value={item.target || "_self"}
              onValueChange={(val) => updateItem(item.id, { target: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">Same Window (_self)</SelectItem>
                <SelectItem value="_blank">New Window (_blank)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => removeItem(item.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function MenuBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [menu, setMenu] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getMenuById(id), getPages()]).then(([menuData, pagesData]) => {
      if (menuData) {
        setMenu(menuData);
        // Sort items by order so DND displays them correctly initially
        const sorted = (menuData.items || []).sort((a: any, b: any) => a.order - b.order);
        // Convert to client-friendly format
        setItems(sorted.map((i: any) => ({ ...i, id: i.id || Math.random().toString(36).substr(2, 9) })));
      }
      setPages(pagesData || []);
      setLoading(false);
    });
  }, [id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) return <div className="p-8">Loading...</div>;
  if (!menu) return <div className="p-8">Menu not found.</div>;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const addItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      label: "New Link",
      url: null,
      pageId: null,
      parentId: null,
      target: "_self",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (itemId: string, updates: any) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i))
    );
  };

  const removeItem = (itemId: string) => {
    // Also remove children of this item
    setItems((prev) => prev.filter((i) => i.id !== itemId && i.parentId !== itemId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // items array is in visual order, so we just use their index as the new 'order'
      const payload = items.map((item, index) => ({
        label: item.label,
        url: item.url,
        pageId: item.pageId,
        parentId: item.parentId,
        order: index,
        target: item.target,
      }));
      await saveMenuItems(menu.id, payload);
      router.refresh();
      alert("Menu saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save menu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" >
            <Link href="/menus">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Menu Items</h1>
            <p className="text-muted-foreground">
              {menu.name} ({menu.location})
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Menu"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Menu Structure</h2>
          <Button variant="outline" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" /> Add Link
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableMenuItem
                key={item.id}
                item={item}
                updateItem={updateItem}
                removeItem={removeItem}
                pages={pages}
                allItems={items}
              />
            ))}
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
          <div className="text-center p-8 border border-dashed rounded-md text-muted-foreground">
            No items yet. Click "Add Link" to start building your menu.
          </div>
        )}
      </div>
    </div>
  );
}
