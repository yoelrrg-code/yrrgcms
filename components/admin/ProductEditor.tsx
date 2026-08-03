"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
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
import { createProduct, updateProduct, publishProduct, ProductWithCategories } from "@/lib/actions/products";
import type { productTypeEnum, productStatusEnum } from "@/lib/db/schema";
import { ImageIcon, Upload } from "lucide-react";

type ProductType = (typeof productTypeEnum.enumValues)[number];
type ProductStatus = (typeof productStatusEnum.enumValues)[number];

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

interface ProductEditorProps {
  product?: ProductWithCategories | null;
  categories?: Category[];
}

export default function ProductEditor({ product, categories = [] }: ProductEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const parseInitialDescription = (raw: string | undefined | null) => {
    if (!raw) return "";
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState<unknown>(
    parseInitialDescription(product?.description)
  );
  const [price, setPrice] = useState<number>(product?.price ?? 0);
  const [currency, setCurrency] = useState(product?.currency ?? "USD");
  const [type, setType] = useState<ProductType>(product?.type ?? "VIRTUAL_COURSE");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "DRAFT");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [downloadUrl, setDownloadUrl] = useState(product?.downloadUrl ?? "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categories?.map((c) => c.categoryId) ?? []
  );
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!product) setSlug(toSlug(val));
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const buildPayload = () => ({
    title,
    slug,
    description: typeof description === "string" ? description : JSON.stringify(description),
    price: Number(price),
    currency,
    type,
    status,
    imageUrl: imageUrl || undefined,
    downloadUrl: downloadUrl || undefined,
    categoryIds: selectedCategoryIds,
  });

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, buildPayload());
          router.refresh();
        } else {
          const newProd = await createProduct(buildPayload());
          router.push(`/admin/products/${newProd.id}`);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  const handlePublish = () => {
    if (!product) return handleSave();
    setError(null);
    startTransition(async () => {
      try {
        await updateProduct(product.id, buildPayload());
        await publishProduct(product.id);
        setStatus("PUBLISHED");
        router.refresh();
      } catch (err: unknown) {
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
          <h1 className="text-xl font-semibold">{product ? "Edit Product" : "New Product"}</h1>
          <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
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
              <CardTitle className="text-base">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="product-title">Title</Label>
                <Input
                  id="product-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Product title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-slug">Slug</Label>
                <Input
                  id="product-slug"
                  value={slug}
                  onChange={(e) => setSlug(toSlug(e.target.value))}
                  placeholder="product-slug"
                />
                <p className="text-xs text-muted-foreground">/courses/{slug || "…"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={(val) => setCurrency(val ?? "USD")}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="CLP">CLP ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {type === "DIGITAL_DOWNLOAD" && (
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="download-url">Download URL / File Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="download-url"
                      value={downloadUrl}
                      onChange={(e) => setDownloadUrl(e.target.value)}
                      placeholder="https://vercel-blob.com/my-digital-asset.zip"
                      className="flex-1"
                    />
                    <MediaPicker
                      onSelect={(url) => setDownloadUrl(url)}
                      trigger={
                        <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5">
                          <Upload className="h-4 w-4" /> Upload File
                        </Button>
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Direct download link or upload file. Sent automatically to customers via email when payment is approved.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Featured"
                  className="w-full max-h-48 object-cover rounded-md border border-border"
                />
              )}
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…"
                  className="flex-1"
                />
                <MediaPicker
                  onSelect={(url) => setImageUrl(url)}
                  trigger={
                    <Button type="button" variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Rich text editor / Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description & Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={description}
                onChange={(val) => setDescription(val)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as ProductStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status">
                      {status === "PUBLISHED" ? "Published" : "Draft"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-type">Product Type</Label>
                <Select value={type} onValueChange={(val) => setType(val as ProductType)}>
                  <SelectTrigger id="product-type">
                    <SelectValue placeholder="Select type">
                      {type === "VIRTUAL_COURSE"
                        ? "Virtual Course (LMS)"
                        : type === "DIGITAL_DOWNLOAD"
                        ? "Digital Download"
                        : "Physical Product"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIRTUAL_COURSE">Virtual Course (LMS)</SelectItem>
                    <SelectItem value="DIGITAL_DOWNLOAD">Digital Download</SelectItem>
                    <SelectItem value="PHYSICAL">Physical Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Multiple Categories Checkbox Card */}
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
                      onChange={() => toggleCategory(cat.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
