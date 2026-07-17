"use client";

import { use, useState, useEffect } from "react";
import { sileo } from "sileo";
import { getFormById, updateForm } from "@/lib/actions/forms";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

type FieldType = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

type FormType = {
  id: string;
  name: string;
  notifyEmail: string | null;
  successMessage: string | null;
  fields: FieldType[];
};

function SortableField({
  field,
  updateField,
  removeField,
}: {
  field: FieldType;
  updateField: (id: string, updates: Partial<FieldType>) => void;
  removeField: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Field Type</Label>
            <Select
              value={field.type}
              onValueChange={(val) => updateField(field.id, { type: val || "text" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="select">Select (Dropdown)</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="radio">Radio Buttons</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Placeholder</Label>
            <Input
              value={field.placeholder || ""}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <input type="checkbox" className="h-4 w-4"
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
              id={`req-${field.id}`}
            />
            <Label htmlFor={`req-${field.id}`}>Required</Label>
          </div>
        </div>

        {(field.type === "select" || field.type === "radio") && (
          <div className="space-y-2">
            <Label>Options (comma separated)</Label>
            <Input
              value={field.options?.join(", ") || ""}
              onChange={(e) =>
                updateField(field.id, {
                  options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="Option 1, Option 2, Option 3"
            />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => removeField(field.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [form, setForm] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFormById(id).then((data) => {
      if (data) {
        setForm({
          id: data.id,
          name: data.name,
          notifyEmail: data.notifyEmail,
          successMessage: data.successMessage,
          fields: (data.fields as FieldType[]) || [],
        });
      }
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
  if (!form) return <div className="p-8">Form not found.</div>;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setForm((prev: FormType | null) => {
        if (!prev) return prev;
        const oldIndex = prev.fields.findIndex((f: FieldType) => f.id === active.id);
        const newIndex = prev.fields.findIndex((f: FieldType) => f.id === over.id);
        return {
          ...prev,
          fields: arrayMove(prev.fields, oldIndex, newIndex),
        };
      });
    }
  };

  const addField = () => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      type: "text",
      label: "New Field",
      placeholder: "",
      required: false,
    };
    setForm((prev: FormType | null) => prev ? ({
      ...prev,
      fields: [...(prev.fields || []), newField],
    }) : prev);
  };

  const updateField = (fieldId: string, updates: Partial<FieldType>) => {
    setForm((prev: FormType | null) => prev ? ({
      ...prev,
      fields: prev.fields.map((f: FieldType) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    }) : prev);
  };

  const removeField = (fieldId: string) => {
    setForm((prev: FormType | null) => prev ? ({
      ...prev,
      fields: prev.fields.filter((f: FieldType) => f.id !== fieldId),
    }) : prev);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateForm(form.id, {
        name: form.name,
        notifyEmail: form.notifyEmail ?? undefined,
        successMessage: form.successMessage ?? undefined,
        fields: form.fields,
      });
      router.refresh();
      sileo.success({ title: "Form saved successfully!" });
    } catch (err) {
      console.error(err);
      sileo.error({ title: "Failed to save form" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Link href="/admin/forms" title="Back to forms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Form</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Form"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 p-4 border rounded-md bg-card">
        <div className="space-y-2">
          <Label>Form Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Notify Email</Label>
          <Input
            type="email"
            value={form.notifyEmail || ""}
            onChange={(e) => setForm({ ...form, notifyEmail: e.target.value })}
            placeholder="admin@example.com"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Success Message</Label>
          <Textarea
            value={form.successMessage || ""}
            onChange={(e) => setForm({ ...form, successMessage: e.target.value })}
            placeholder="Thank you! We'll be in touch."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Form Fields</h2>
          <Button variant="outline" onClick={addField}>
            <Plus className="mr-2 h-4 w-4" /> Add Field
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={form.fields?.map((f: FieldType) => f.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {form.fields?.map((field: FieldType) => (
              <SortableField
                key={field.id}
                field={field}
                updateField={updateField}
                removeField={removeField}
              />
            ))}
          </SortableContext>
        </DndContext>

        {(!form.fields || form.fields.length === 0) && (
          <div className="text-center p-8 border border-dashed rounded-md text-muted-foreground">
            No fields yet. Click &quot;Add Field&quot; to start building your form.
          </div>
        )}
      </div>
    </div>
  );
}
