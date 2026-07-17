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
import RichTextEditor from "@/components/admin/RichTextEditor/RichTextEditor";
import MediaPicker from "@/components/admin/MediaPicker/MediaPicker";
import { createPost, updatePost, publishPost } from "@/lib/actions/posts";
import type { Post } from "@/lib/db/schema";
import { ImageIcon } from "lucide-react";

// Slug generator
function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface PostEditorProps {
  post?: Post | null;
  categories: Category[];
  tags: Tag[];
}

export default function PostEditor({ post, categories, tags }: PostEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featuredImageUrl ?? "");
  const [content, setContent] = useState<any>(post?.content ?? null);
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState((post?.seo as any)?.title ?? "");
  const [seoDescription, setSeoDescription] = useState((post?.seo as any)?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post) setSlug(toSlug(val));
  };

  const buildPayload = () => ({
    title,
    slug,
    excerpt,
    featuredImageUrl: featuredImageUrl || undefined,
    content,
    status,
    seo: { title: seoTitle, description: seoDescription },
  });

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (post) {
          await updatePost(post.id, buildPayload());
          router.refresh();
        } else {
          const newPost = await createPost(buildPayload());
          router.push(`/posts/${newPost.id}`);
        }
      } catch (err: any) {
        setError(err?.message ?? "An error occurred.");
      }
    });
  };

  const handlePublish = () => {
    if (!post) return handleSave();
    setError(null);
    startTransition(async () => {
      try {
        await updatePost(post.id, buildPayload());
        await publishPost(post.id);
        router.refresh();
      } catch (err: any) {
        setError(err?.message ?? "An error occurred.");
      }
    });
  };

  const toggleMultiselect = (
    id: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) => {
    setSelected(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    );
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
          <h1 className="text-xl font-semibold">{post ? "Edit Post" : "New Post"}</h1>
          <Badge variant={status === "published" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/posts")}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Post title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="post-slug">Slug</Label>
                <Input
                  id="post-slug"
                  value={slug}
                  onChange={(e) => setSlug(toSlug(e.target.value))}
                  placeholder="post-slug"
                />
                <p className="text-xs text-muted-foreground">/blog/{slug || "…"}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of the post"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredImageUrl}
                  alt="Featured"
                  className="w-full max-h-48 object-cover rounded-md border border-border"
                />
              )}
              <div className="flex gap-2">
                <Input
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://…"
                  className="flex-1"
                />
                <MediaPicker
                  onSelect={(url) => setFeaturedImageUrl(url)}
                  trigger={
                    <Button type="button" variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Rich text editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor content={content} onChange={setContent} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">No categories yet.</p>
                )}
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={() =>
                        toggleMultiselect(cat.id, selectedCategoryIds, setSelectedCategoryIds)
                      }
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags yet.</p>
                )}
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      toggleMultiselect(tag.id, selectedTagIds, setSelectedTagIds)
                    }
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="post-seo-title">Meta Title</Label>
                <Input
                  id="post-seo-title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Overrides post title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="post-seo-description">Meta Description</Label>
                <Textarea
                  id="post-seo-description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
