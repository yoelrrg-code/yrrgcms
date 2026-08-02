"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService } from "@/lib/actions/services";
import { Service } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MediaPicker from "@/components/admin/MediaPicker/MediaPicker";

interface PackItem {
  id?: string;
  name?: string;
  sessionCount?: number;
  totalPrice?: number;
  discountPercent?: number;
  validityDays?: number;
}

interface SubscriptionItem {
  id?: string;
  name?: string;
  sessionsPerPeriod?: number;
  interval?: string;
  price?: number;
}

interface ServicePricing {
  singleSession?: {
    durationMinutes?: number;
    price?: number;
    currency?: string;
  };
  packs?: PackItem[];
  subscriptions?: SubscriptionItem[];
}

interface ServiceFormProps {
  initialService?: Service;
}

export function ServiceForm({ initialService }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialPricing = (initialService?.pricingOptions as ServicePricing | null | undefined) || {
    singleSession: { durationMinutes: 45, price: 30, currency: "USD" },
    packs: [
      { id: "p1", name: "Pack of 3 sessions", sessionCount: 3, totalPrice: 75, discountPercent: 16, validityDays: 90 },
      { id: "p2", name: "Pack of 6 sessions", sessionCount: 6, totalPrice: 129, discountPercent: 28, validityDays: 180 },
    ],
    subscriptions: [
      { id: "s1", name: "Pack of 3 sessions per month", sessionsPerPeriod: 3, interval: "monthly", price: 75 },
      { id: "s2", name: "Pack of 4 sessions per month", sessionsPerPeriod: 4, interval: "monthly", price: 79 },
    ]
  };

  const [title, setTitle] = useState(initialService?.title || "");
  const [slug, setSlug] = useState(initialService?.slug || "");
  const [shortDescription, setShortDescription] = useState(initialService?.shortDescription || "");
  const [mainImage, setMainImage] = useState(initialService?.mainImage || "");
  const [status, setStatus] = useState<"draft" | "active" | "inactive">(initialService?.status || "active");
  const [durationMinutes, setDurationMinutes] = useState(initialService?.durationMinutes || 45);
  const [bufferTimeMinutes, setBufferTimeMinutes] = useState(initialService?.bufferTimeMinutes || 15);

  const [singlePrice, setSinglePrice] = useState(initialPricing.singleSession?.price || 30);
  const [currency, setCurrency] = useState(initialPricing.singleSession?.currency || "USD");
  const [packs, setPacks] = useState<PackItem[]>(initialPricing.packs || []);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(initialPricing.subscriptions || []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialService) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const addPack = () => {
    setPacks([...packs, { id: `p_${Date.now()}`, name: "New Pack", sessionCount: 3, totalPrice: 60, validityDays: 60 }]);
  };

  const removePack = (index: number) => {
    setPacks(packs.filter((_, i) => i !== index));
  };

  const addSubscription = () => {
    setSubscriptions([...subscriptions, { id: `s_${Date.now()}`, name: "Monthly Subscription", sessionsPerPeriod: 4, interval: "monthly", price: 70 }]);
  };

  const removeSubscription = (index: number) => {
    setSubscriptions(subscriptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        slug,
        shortDescription,
        mainImage,
        status,
        durationMinutes: Number(durationMinutes),
        bufferTimeMinutes: Number(bufferTimeMinutes),
        pricingOptions: {
          singleSession: { durationMinutes: Number(durationMinutes), price: Number(singlePrice), currency },
          packs,
          subscriptions,
        },
      };

      if (initialService) {
        await updateService(initialService.id, payload);
      } else {
        await createService(payload as Parameters<typeof createService>[0]);
      }

      router.push("/admin/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{initialService ? "Edit Service" : "New Service"}</h1>
          <Badge variant={status === "active" ? "default" : status === "draft" ? "outline" : "secondary"} className="capitalize">
            {status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/services")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save Service"}
          </Button>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="e.g. Cryotherapy & Mindful Breathing"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="cryotherapy-breathing"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /{slug || "…"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Short service summary..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* PRICING MODALITIES */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing Modalities & Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 1. Single Session */}
              <div className="p-4 border rounded-md space-y-3 bg-muted/30">
                <h3 className="font-semibold text-sm">1. Single Session (Base Price)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Unit Price</Label>
                    <Input type="number" value={singlePrice} onChange={(e) => setSinglePrice(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD, EUR, CLP" />
                  </div>
                </div>
              </div>

              {/* 2. Session Packs */}
              <div className="p-4 border rounded-md space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">2. Package Options / Packs</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addPack}>
                    <Plus className="mr-1 size-3" /> Add Pack
                  </Button>
                </div>
                {packs.map((pack, index) => (
                  <div key={pack.id || index} className="grid grid-cols-4 gap-2 items-center border p-2 rounded bg-background">
                    <Input placeholder="Pack name" value={pack.name} onChange={(e) => {
                      const updated = [...packs];
                      updated[index].name = e.target.value;
                      setPacks(updated);
                    }} />
                    <Input type="number" placeholder="Sessions Count" value={pack.sessionCount} onChange={(e) => {
                      const updated = [...packs];
                      updated[index].sessionCount = Number(e.target.value);
                      setPacks(updated);
                    }} />
                    <Input type="number" placeholder="Total Price" value={pack.totalPrice} onChange={(e) => {
                      const updated = [...packs];
                      updated[index].totalPrice = Number(e.target.value);
                      setPacks(updated);
                    }} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePack(index)} className="text-destructive justify-self-end">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* 3. Subscriptions */}
              <div className="p-4 border rounded-md space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">3. Recurring Subscriptions</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addSubscription}>
                    <Plus className="mr-1 size-3" /> Add Subscription
                  </Button>
                </div>
                {subscriptions.map((sub, index) => (
                  <div key={sub.id || index} className="grid grid-cols-4 gap-2 items-center border p-2 rounded bg-background">
                    <Input placeholder="Plan name" value={sub.name} onChange={(e) => {
                      const updated = [...subscriptions];
                      updated[index].name = e.target.value;
                      setSubscriptions(updated);
                    }} />
                    <Input type="number" placeholder="Sessions/month" value={sub.sessionsPerPeriod} onChange={(e) => {
                      const updated = [...subscriptions];
                      updated[index].sessionsPerPeriod = Number(e.target.value);
                      setSubscriptions(updated);
                    }} />
                    <Input type="number" placeholder="Monthly price" value={sub.price} onChange={(e) => {
                      const updated = [...subscriptions];
                      updated[index].price = Number(e.target.value);
                      setSubscriptions(updated);
                    }} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSubscription(index)} className="text-destructive justify-self-end">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          {/* Status Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "active" | "inactive")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Time & Durations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Duration & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="durationMinutes">Session Duration (min)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bufferTimeMinutes">Buffer between sessions (min)</Label>
                <Input
                  id="bufferTimeMinutes"
                  type="number"
                  value={bufferTimeMinutes}
                  onChange={(e) => setBufferTimeMinutes(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Main Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mainImage">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="mainImage"
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                    placeholder="https://..."
                  />
                  <MediaPicker
                    onSelect={(url) => setMainImage(url)}
                    trigger={
                      <Button type="button" variant="outline">
                        Browse
                      </Button>
                    }
                  />
                </div>
              </div>
              {mainImage && (
                <div className="relative aspect-video rounded-md overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mainImage} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
