"use client";

import { useState } from "react";
import { saveGlobal } from "@/lib/actions/globals";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

export default function GlobalsClient({
  initialHeader,
  initialFooter,
  initialSeo,
}: {
  initialHeader: any;
  initialFooter: any;
  initialSeo: any;
}) {
  const router = useRouter();
  const [header, setHeader] = useState(initialHeader);
  const [footer, setFooter] = useState({
    copyright: "",
    socialLinks: [],
    columns: [],
    ...initialFooter,
  });
  const [seo, setSeo] = useState(initialSeo);
  const [saving, setSaving] = useState(false);

  const handleSave = async (key: "header" | "footer" | "seo_defaults", data: any) => {
    setSaving(true);
    try {
      await saveGlobal(key, data);
      router.refresh();
      alert("Settings saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Tabs defaultValue="header" className="space-y-4">
      <TabsList>
        <TabsTrigger value="header">Header</TabsTrigger>
        <TabsTrigger value="footer">Footer</TabsTrigger>
        <TabsTrigger value="seo">SEO Defaults</TabsTrigger>
      </TabsList>

      <TabsContent value="header" className="space-y-4 max-w-2xl">
        <div className="grid gap-4 p-4 border rounded-md bg-card">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input
              value={header.siteName || ""}
              onChange={(e) => setHeader({ ...header, siteName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              value={header.logoUrl || ""}
              onChange={(e) => setHeader({ ...header, logoUrl: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>CTA Button Text</Label>
            <Input
              value={header.ctaText || ""}
              onChange={(e) => setHeader({ ...header, ctaText: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>CTA Button URL</Label>
            <Input
              value={header.ctaUrl || ""}
              onChange={(e) => setHeader({ ...header, ctaUrl: e.target.value })}
            />
          </div>
          <Button onClick={() => handleSave("header", header)} disabled={saving} className="w-fit">
            Save Header
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="footer" className="space-y-6">
        <div className="grid gap-4 p-4 border rounded-md bg-card max-w-2xl">
          <div className="space-y-2">
            <Label>Copyright Text</Label>
            <Input
              value={footer.copyright || ""}
              onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>Social Links</Label>
            {footer.socialLinks.map((link: any, idx: number) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder="Label (e.g. Twitter)"
                  value={link.label}
                  onChange={(e) => {
                    const newLinks = [...footer.socialLinks];
                    newLinks[idx].label = e.target.value;
                    setFooter({ ...footer, socialLinks: newLinks });
                  }}
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...footer.socialLinks];
                    newLinks[idx].url = e.target.value;
                    setFooter({ ...footer, socialLinks: newLinks });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newLinks = footer.socialLinks.filter((_: any, i: number) => i !== idx);
                    setFooter({ ...footer, socialLinks: newLinks });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFooter({
                  ...footer,
                  socialLinks: [...footer.socialLinks, { label: "", url: "" }],
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Social Link
            </Button>
          </div>
        </div>

        <div className="grid gap-4 p-4 border rounded-md bg-card">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Footer Columns</Label>
            <Button
              variant="outline"
              onClick={() =>
                setFooter({
                  ...footer,
                  columns: [...footer.columns, { title: "New Column", links: [] }],
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {footer.columns.map((col: any, colIdx: number) => (
              <div key={colIdx} className="space-y-4 p-4 border rounded bg-background">
                <div className="flex items-center gap-2">
                  <Input
                    value={col.title}
                    onChange={(e) => {
                      const newCols = [...footer.columns];
                      newCols[colIdx].title = e.target.value;
                      setFooter({ ...footer, columns: newCols });
                    }}
                    placeholder="Column Title"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newCols = footer.columns.filter((_: any, i: number) => i !== colIdx);
                      setFooter({ ...footer, columns: newCols });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {col.links.map((link: any, linkIdx: number) => (
                    <div key={linkIdx} className="flex gap-2">
                      <Input
                        value={link.label}
                        placeholder="Label"
                        className="h-8 text-sm"
                        onChange={(e) => {
                          const newCols = [...footer.columns];
                          newCols[colIdx].links[linkIdx].label = e.target.value;
                          setFooter({ ...footer, columns: newCols });
                        }}
                      />
                      <Input
                        value={link.url}
                        placeholder="URL"
                        className="h-8 text-sm"
                        onChange={(e) => {
                          const newCols = [...footer.columns];
                          newCols[colIdx].links[linkIdx].url = e.target.value;
                          setFooter({ ...footer, columns: newCols });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const newCols = [...footer.columns];
                          newCols[colIdx].links = newCols[colIdx].links.filter(
                            (_: any, i: number) => i !== linkIdx
                          );
                          setFooter({ ...footer, columns: newCols });
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs h-8"
                    onClick={() => {
                      const newCols = [...footer.columns];
                      newCols[colIdx].links.push({ label: "", url: "" });
                      setFooter({ ...footer, columns: newCols });
                    }}
                  >
                    <Plus className="mr-2 h-3 w-3" /> Add Link
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => handleSave("footer", footer)} disabled={saving} className="w-fit mt-4">
            Save Footer
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="seo" className="space-y-4 max-w-2xl">
        <div className="grid gap-4 p-4 border rounded-md bg-card">
          <div className="space-y-2">
            <Label>Default Meta Title</Label>
            <Input
              value={seo.title || ""}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Default Meta Description</Label>
            <Textarea
              value={seo.description || ""}
              onChange={(e) => setSeo({ ...seo, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Default OG Image URL</Label>
            <Input
              value={seo.ogImage || ""}
              onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Favicon URL</Label>
            <Input
              value={seo.favicon || ""}
              onChange={(e) => setSeo({ ...seo, favicon: e.target.value })}
            />
          </div>
          <Button onClick={() => handleSave("seo_defaults", seo)} disabled={saving} className="w-fit">
            Save SEO Defaults
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
