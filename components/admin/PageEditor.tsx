"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BlockEditor from "@/components/admin/BlockEditor/BlockEditor";
import MediaPicker from "@/components/admin/MediaPicker/MediaPicker";
import { createPage, updatePage, publishPage } from "@/lib/actions/pages";
import type { Block } from "@/components/blocks/definitions";
import type { Page } from "@/lib/db/schema";

import PageAIAssistantModal from "@/components/admin/BlockEditor/PageAIAssistantModal";

// Slug generator helper
function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface PageEditorProps {
  page?: Page | null;
}

export default function PageEditor({ page }: PageEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [status, setStatus] = useState<"draft" | "published">(page?.status ?? "draft");
  const [revalidate, setRevalidate] = useState(page?.revalidate ?? 60);
  const [blocks, setBlocks] = useState<Block[]>(
    (page?.blocks as Block[] | null) ?? []
  );
  const seo = page?.seo as { title?: string; description?: string; ogImage?: string; noIndex?: boolean } | null;
  const [seoTitle, setSeoTitle] = useState(seo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(seo?.description ?? "");
  const [seoOgImage, setSeoOgImage] = useState(seo?.ogImage ?? "");
  const [noIndex, setNoIndex] = useState(seo?.noIndex ?? false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!page) setSlug(toSlug(val));
  };

  const buildPayload = () => ({
    title,
    slug,
    status,
    revalidate: Number(revalidate),
    blocks,
    seo: { title: seoTitle, description: seoDescription, ogImage: seoOgImage, noIndex },
  });

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (page) {
          await updatePage(page.id, buildPayload());
          router.refresh();
        } else {
          const newPage = await createPage(buildPayload());
          router.push(`/admin/pages/${newPage.id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  const handlePublish = () => {
    if (!page) return handleSave();
    setError(null);
    startTransition(async () => {
      try {
        await updatePage(page.id, buildPayload());
        await publishPage(page.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{page ? "Edit Page" : "New Page"}</h1>
          <Badge variant={status === "published" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <PageAIAssistantModal
            onInsertBlocks={(newBlocks) => setBlocks((prev) => [...prev, ...newBlocks])}
            onSetSeo={(title, desc) => {
              if (!seoTitle) setSeoTitle(title);
              if (!seoDescription) setSeoDescription(desc);
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/pages")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save Draft"}
          </Button>
          <Button type="button" onClick={handlePublish} disabled={isPending}>
            {isPending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Main fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Page Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Page title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(toSlug(e.target.value))}
                  placeholder="page-slug"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /{slug || "…"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Block Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as "draft" | "published")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revalidate">Revalidate (seconds)</Label>
                <Input
                  id="revalidate"
                  type="number"
                  min={0}
                  value={revalidate}
                  onChange={(e) => setRevalidate(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  0 = on-demand only
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="seoTitle">Meta Title</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Overrides page title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Brief page description"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>OG Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={seoOgImage}
                    onChange={(e) => setSeoOgImage(e.target.value)}
                    placeholder="https://..."
                  />
                  <MediaPicker
                    onSelect={(url) => setSeoOgImage(url)}
                    trigger={
                      <Button type="button" variant="outline">
                        Browse
                      </Button>
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="noIndex"
                  checked={noIndex}
                  onChange={(e) => setNoIndex(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="noIndex" className="cursor-pointer">
                  No-index (hide from search engines)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
