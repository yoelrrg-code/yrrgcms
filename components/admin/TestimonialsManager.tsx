"use client";

import { Testimonial, NewTestimonial } from "@/lib/db/schema";
import { useState } from "react";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "@/lib/actions/testimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Edit2, Trash2, Quote, User as UserIcon, Sparkles, Upload } from "lucide-react";
import { sileo } from "sileo";
import MediaPicker from "@/components/admin/MediaPicker/MediaPicker";

interface TestimonialsManagerProps {
  initialTestimonials: Testimonial[];
}

export function TestimonialsManager({ initialTestimonials }: TestimonialsManagerProps) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEditingItem(null);
    setName("");
    setRole("");
    setAvatarUrl("");
    setContent("");
    setRating(5);
    setIsFeatured(false);
    setOrder(0);
  };

  const handleOpenModal = (item?: Testimonial) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setRole(item.role || "");
      setAvatarUrl(item.avatarUrl || "");
      setContent(item.content);
      setRating(item.rating);
      setIsFeatured(item.isFeatured);
      setOrder(item.order);
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      sileo.error({ title: "Validation Error", description: "Name and content are required fields." });
      return;
    }

    setLoading(true);

    const payload: NewTestimonial = {
      name,
      role: role.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      content,
      rating,
      isFeatured,
      order: Number(order) || 0,
    };

    if (editingItem) {
      const res = await updateTestimonial(editingItem.id, payload);
      setLoading(false);
      if (res.success && res.data) {
        setItems(items.map((it) => (it.id === editingItem.id ? res.data : it)));
        setIsOpen(false);
        resetForm();
        sileo.success({ title: "Updated", description: "Testimonial updated successfully." });
      } else {
        sileo.error({ title: "Error", description: res.error || "Failed to update testimonial." });
      }
    } else {
      const res = await createTestimonial(payload);
      setLoading(false);
      if (res.success && res.data) {
        setItems([...items, res.data]);
        setIsOpen(false);
        resetForm();
        sileo.success({ title: "Created", description: "Testimonial created successfully." });
      } else {
        sileo.error({ title: "Error", description: res.error || "Failed to create testimonial." });
      }
    }
  };

  const handleDelete = (id: string) => {
    sileo.action({
      title: "Delete Testimonial?",
      description: "Are you sure you want to permanently remove this testimonial?",
      button: {
        title: "Confirm Delete",
        onClick: async () => {
          const res = await deleteTestimonial(id);
          if (res.success) {
            setItems(items.filter((it) => it.id !== id));
            sileo.success({ title: "Deleted", description: "Testimonial deleted successfully." });
          } else {
            sileo.error({ title: "Error", description: res.error || "Failed to delete testimonial." });
          }
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Client Testimonials</h2>
          <p className="text-sm text-muted-foreground">Manage customer feedback, quotes and ratings displayed across your site.</p>
        </div>

        <Button onClick={() => handleOpenModal()} className="font-semibold gap-2">
          <Plus className="size-4" /> Add Testimonial
        </Button>
      </div>

      {/* ITEMS GRID */}
      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-muted-foreground space-y-3">
            <Quote className="size-10 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-base">No testimonials added yet</p>
            <p className="text-xs">&quot;Click &quot;Add Testimonial&quot; to create your first client review.&quot;</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="relative overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.avatarUrl} alt={item.name} className="size-10 rounded-full object-cover border" />
                    ) : (
                      <div className="size-10 rounded-full bg-muted border flex items-center justify-center text-muted-foreground">
                        <UserIcon className="size-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                      {item.role && <p className="text-xs text-muted-foreground">{item.role}</p>}
                    </div>
                  </div>

                  {item.isFeatured && (
                    <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                      <Sparkles className="size-3" /> Featured
                    </Badge>
                  )}
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < item.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-xs text-muted-foreground italic line-clamp-4">&quot;{item.content}&quot;</p>
              </CardContent>

              {/* CARD FOOTER ACTIONS */}
              <div className="p-4 pt-0 border-t mt-auto flex items-center justify-between bg-muted/20">
                <span className="text-[11px] font-medium text-muted-foreground">Order: #{item.order}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenModal(item)}>
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Testimonial" : "Create Testimonial"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Author Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Jenkins" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Role / Company</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Founder at Acme Inc" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Avatar Image</label>
              <div className="flex items-center gap-3 p-2 border rounded-lg bg-muted/20">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar preview" className="size-12 rounded-full object-cover border" />
                ) : (
                  <div className="size-12 rounded-full bg-muted border flex items-center justify-center text-muted-foreground">
                    <UserIcon className="size-6" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <MediaPicker
                    onSelect={(url) => setAvatarUrl(url)}
                    trigger={
                      <Button type="button" variant="outline" size="sm" className="gap-2 text-xs">
                        <Upload className="size-3.5" /> {avatarUrl ? "Change Avatar" : "Upload / Select Avatar"}
                      </Button>
                    }
                  />
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatarUrl("")}
                      className="h-6 text-[11px] text-destructive justify-start p-0 hover:bg-transparent"
                    >
                      Remove avatar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Testimonial Content *</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the client feedback quote here..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Rating (1-5)</label>
                <div className="flex items-center gap-1 border rounded-lg p-2 bg-background">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className={`size-5 cursor-pointer transition-all ${
                        i < rating ? "fill-amber-400 text-amber-400 scale-110" : "fill-muted text-muted-foreground/30 hover:text-amber-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Display Order</label>
                <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={0} />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isFeatured" className="text-xs font-semibold cursor-pointer">
                  Featured
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingItem ? "Update Testimonial" : "Create Testimonial"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
