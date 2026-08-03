"use client";

import { useState } from "react";
import { saveGlobal } from "@/lib/actions/globals";
import { sileo } from "sileo";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, CreditCard, Building2, Wallet } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker/MediaPicker";
import RichTextEditor from "@/components/admin/RichTextEditor/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HeaderConfig = {
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
};

type SocialLink = {
  label: string;
  url: string;
};

type FooterColumn = {
  title: string;
  type?: "links" | "menu" | "richText";
  links: { label: string; url: string }[];
  menuId?: string;
  richText?: unknown;
};

type FooterConfig = {
  copyright: string;
  socialLinks: SocialLink[];
  columns: FooterColumn[];
};

type SeoConfig = {
  title?: string;
  description?: string;
  ogImage?: string;
  favicon?: string;
};

export type BankTransferConfig = {
  bankName: string;
  cbuAlias: string;
  accountHolder: string;
  accountNumber?: string;
  accountType?: string;
  instructions?: string;
};

export type CustomPaymentMethod = {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  enabled: boolean;
};

export type PaymentMethodsConfig = {
  bankTransferEnabled?: boolean;
  bankTransfer?: BankTransferConfig;
  customMethods?: CustomPaymentMethod[];
};

export default function GlobalsClient({
  initialHeader,
  initialFooter,
  initialSeo,
  initialPaymentMethods,
  initialMenus,
}: {
  initialHeader: Partial<HeaderConfig> | null;
  initialFooter: Partial<FooterConfig> | null;
  initialSeo: Partial<SeoConfig> | null;
  initialPaymentMethods?: Partial<PaymentMethodsConfig> | null;
  initialMenus?: { id: string; name: string; location: string }[];
}) {
  const router = useRouter();
  const [header, setHeader] = useState<HeaderConfig>(initialHeader || {});
  const [footer, setFooter] = useState<FooterConfig>({
    copyright: "",
    socialLinks: [],
    columns: [],
    ...(initialFooter || {}),
  });
  const [seo, setSeo] = useState<SeoConfig>(initialSeo || {});
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsConfig>({
    bankTransferEnabled: initialPaymentMethods?.bankTransferEnabled ?? true,
    bankTransfer: {
      bankName: initialPaymentMethods?.bankTransfer?.bankName ?? "Banco Central",
      cbuAlias: initialPaymentMethods?.bankTransfer?.cbuAlias ?? "00000031000847291048 / YRRG.CMS.PAGOS",
      accountHolder: initialPaymentMethods?.bankTransfer?.accountHolder ?? "YRRG CMS Inc.",
      accountNumber: initialPaymentMethods?.bankTransfer?.accountNumber ?? "",
      accountType: initialPaymentMethods?.bankTransfer?.accountType ?? "",
      instructions: initialPaymentMethods?.bankTransfer?.instructions ?? "",
    },
    customMethods: initialPaymentMethods?.customMethods ?? [],
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (
    key: "header" | "footer" | "seo_defaults" | "payment_methods",
    data: Record<string, unknown>
  ) => {
    setSaving(true);
    try {
      await saveGlobal(key, data);
      router.refresh();
      sileo.success({ title: "Settings saved!" });
    } catch (err) {
      console.error(err);
      sileo.error({ title: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const addCustomPaymentMethod = () => {
    const newMethod: CustomPaymentMethod = {
      id: `method_${Date.now()}`,
      name: "New Payment Method",
      description: "",
      instructions: "",
      enabled: true,
    };
    setPaymentMethods({
      ...paymentMethods,
      customMethods: [...(paymentMethods.customMethods || []), newMethod],
    });
  };

  const updateCustomMethod = (id: string, updated: Partial<CustomPaymentMethod>) => {
    setPaymentMethods({
      ...paymentMethods,
      customMethods: (paymentMethods.customMethods || []).map((m) =>
        m.id === id ? { ...m, ...updated } : m
      ),
    });
  };

  const removeCustomMethod = (id: string) => {
    setPaymentMethods({
      ...paymentMethods,
      customMethods: (paymentMethods.customMethods || []).filter((m) => m.id !== id),
    });
  };

  return (
    <Tabs defaultValue="header" className="space-y-5">
      <TabsList className="py-6 px-3 bg-gray-200 dark:bg-gray-800">
        <TabsTrigger value="header">Header</TabsTrigger>
        <TabsTrigger value="footer">Footer</TabsTrigger>
        <TabsTrigger value="seo">SEO Defaults</TabsTrigger>
        <TabsTrigger value="payments" className="gap-1.5">
          <CreditCard className="h-4 w-4" /> Payment Methods
        </TabsTrigger>
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
            <Label>Site Description</Label>
            <Textarea
              value={header.siteDescription || ""}
              onChange={(e) => setHeader({ ...header, siteDescription: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <div className="flex gap-2">
              <Input
                value={header.logoUrl || ""}
                onChange={(e) => setHeader({ ...header, logoUrl: e.target.value })}
              />
              <MediaPicker
                onSelect={(url) => setHeader({ ...header, logoUrl: url })}
                trigger={<Button type="button" variant="outline">Browse</Button>}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA Text</Label>
              <Input
                value={header.ctaText || ""}
                onChange={(e) => setHeader({ ...header, ctaText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CTA URL</Label>
              <Input
                value={header.ctaUrl || ""}
                onChange={(e) => setHeader({ ...header, ctaUrl: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={() => handleSave("header", header)} disabled={saving} className="w-fit">
            Save Header Settings
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
          <div className="space-y-2">
            <Label>Social Links</Label>
            {footer.socialLinks.map((link: SocialLink, idx: number) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder="Platform (e.g. Twitter)"
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
                    const newLinks = footer.socialLinks.filter((_: unknown, i: number) => i !== idx);
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
            {footer.columns.map((col: FooterColumn, colIdx: number) => (
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
                      const newCols = footer.columns.filter((_: unknown, i: number) => i !== colIdx);
                      setFooter({ ...footer, columns: newCols });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Select
                    value={col.type || "links"}
                    onValueChange={(val) => {
                      if (!val) return;
                      const newCols = [...footer.columns];
                      newCols[colIdx].type = val as "links" | "menu" | "richText";
                      setFooter({ ...footer, columns: newCols });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Column Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="links">Custom Links</SelectItem>
                      <SelectItem value="menu">Navigation Menu</SelectItem>
                      <SelectItem value="richText">Rich Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {col.type === "menu" && (
                  <div className="space-y-2">
                    <Label>Select Menu</Label>
                    <Select
                      value={col.menuId || ""}
                      onValueChange={(val) => {
                        const newCols = [...footer.columns];
                        newCols[colIdx].menuId = val || undefined;
                        setFooter({ ...footer, columns: newCols });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a menu" />
                      </SelectTrigger>
                      <SelectContent>
                        {initialMenus?.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} ({m.location})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {col.type === "richText" && (
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <RichTextEditor
                      content={col.richText}
                      onChange={(val) => {
                        const newCols = [...footer.columns];
                        newCols[colIdx].richText = val;
                        setFooter({ ...footer, columns: newCols });
                      }}
                    />
                  </div>
                )}

                {(!col.type || col.type === "links") && (
                  <div className="space-y-2">
                    <Label>Links</Label>
                    {col.links.map((link: { label: string; url: string }, linkIdx: number) => (
                      <div key={linkIdx} className="flex gap-2">
                        <Input
                          placeholder="Label"
                          value={link.label}
                          onChange={(e) => {
                            const newCols = [...footer.columns];
                            newCols[colIdx].links[linkIdx].label = e.target.value;
                            setFooter({ ...footer, columns: newCols });
                          }}
                        />
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => {
                            const newCols = [...footer.columns];
                            newCols[colIdx].links[linkIdx].url = e.target.value;
                            setFooter({ ...footer, columns: newCols });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newCols = [...footer.columns];
                            newCols[colIdx].links = newCols[colIdx].links.filter(
                              (_: unknown, i: number) => i !== linkIdx
                            );
                            setFooter({ ...footer, columns: newCols });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCols = [...footer.columns];
                        newCols[colIdx].links.push({ label: "", url: "" });
                        setFooter({ ...footer, columns: newCols });
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Link
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => handleSave("footer", footer)} disabled={saving} className="w-fit">
          Save Footer Settings
        </Button>
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
            <div className="flex gap-2">
              <Input
                value={seo.ogImage || ""}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
              />
              <MediaPicker
                onSelect={(url) => setSeo({ ...seo, ogImage: url })}
                trigger={<Button type="button" variant="outline">Browse</Button>}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Favicon URL</Label>
            <div className="flex gap-2">
              <Input
                value={seo.favicon || ""}
                onChange={(e) => setSeo({ ...seo, favicon: e.target.value })}
              />
              <MediaPicker
                onSelect={(url) => setSeo({ ...seo, favicon: url })}
                trigger={<Button type="button" variant="outline">Browse</Button>}
              />
            </div>
          </div>
          <Button onClick={() => handleSave("seo_defaults", seo)} disabled={saving} className="w-fit">
            Save SEO Defaults
          </Button>
        </div>
      </TabsContent>

      {/* PAYMENT METHODS TAB */}
      <TabsContent value="payments" className="space-y-6 max-w-4xl">
        {/* Bank Transfer Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Bank Transfer Information
              </CardTitle>
              <CardDescription>
                Configure the bank details shown to customers when opting for bank transfer payments.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="bt-enabled" className="text-sm font-medium">Enable</Label>
              <Switch
                id="bt-enabled"
                checked={paymentMethods.bankTransferEnabled}
                onCheckedChange={(val: boolean) =>
                  setPaymentMethods({ ...paymentMethods, bankTransferEnabled: val })
                }
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={paymentMethods.bankTransfer?.bankName || ""}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      bankTransfer: {
                        ...paymentMethods.bankTransfer!,
                        bankName: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Central Bank"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-holder">Account Holder</Label>
                <Input
                  id="account-holder"
                  value={paymentMethods.bankTransfer?.accountHolder || ""}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      bankTransfer: {
                        ...paymentMethods.bankTransfer!,
                        accountHolder: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. YRRG CMS Inc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cbu-alias">Routing / CBU / Alias</Label>
                <Input
                  id="cbu-alias"
                  value={paymentMethods.bankTransfer?.cbuAlias || ""}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      bankTransfer: {
                        ...paymentMethods.bankTransfer!,
                        cbuAlias: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. 00000031000847291048 / YRRG.CMS.PAYMENTS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number (Optional)</Label>
                <Input
                  id="account-number"
                  value={paymentMethods.bankTransfer?.accountNumber || ""}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      bankTransfer: {
                        ...paymentMethods.bankTransfer!,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. 123-456789/0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bt-instructions">Instructions for Customer</Label>
              <Textarea
                id="bt-instructions"
                rows={2}
                value={paymentMethods.bankTransfer?.instructions || ""}
                onChange={(e) =>
                  setPaymentMethods({
                    ...paymentMethods,
                    bankTransfer: {
                      ...paymentMethods.bankTransfer!,
                      instructions: e.target.value,
                    },
                  })
                }
                placeholder="e.g. Please attach payment proof with order reference after transfer."
              />
            </div>

            {/* Live Card Preview matching design */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 space-y-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <h4 className="font-semibold text-base text-foreground">
                Bank Transfer Information:
              </h4>
              <div className="space-y-2 text-sm text-foreground/90">
                <p><span className="font-medium">Bank:</span> {paymentMethods.bankTransfer?.bankName || "—"}</p>
                <p><span className="font-medium">CBU / Alias:</span> {paymentMethods.bankTransfer?.cbuAlias || "—"}</p>
                <p><span className="font-medium">Account Holder:</span> {paymentMethods.bankTransfer?.accountHolder || "—"}</p>
                {paymentMethods.bankTransfer?.accountNumber && (
                  <p><span className="font-medium">Account Number:</span> {paymentMethods.bankTransfer.accountNumber}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom / Additional Payment Methods */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Additional Payment Methods
              </CardTitle>
              <CardDescription>
                Add custom payment gateways or manual payment instructions (PayPal, MercadoPago, Crypto, cash, etc.).
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addCustomPaymentMethod} className="gap-2">
              <Plus className="h-4 w-4" /> Add Payment Method
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(!paymentMethods.customMethods || paymentMethods.customMethods.length === 0) ? (
              <p className="text-sm text-muted-foreground italic py-4 text-center border rounded-md">
                No custom payment methods added yet. Click &quot;Add Payment Method&quot; above to create one.
              </p>
            ) : (
              paymentMethods.customMethods.map((method) => (
                <div key={method.id} className="p-4 border rounded-md space-y-4 bg-background">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <Input
                        value={method.name}
                        onChange={(e) => updateCustomMethod(method.id, { name: e.target.value })}
                        placeholder="Method Name (e.g. MercadoPago / PayPal)"
                        className="font-semibold"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`enable-${method.id}`} className="text-xs">Enabled</Label>
                        <Switch
                          id={`enable-${method.id}`}
                          checked={method.enabled}
                          onCheckedChange={(val: boolean) => updateCustomMethod(method.id, { enabled: val })}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Short Description</Label>
                      <Input
                        value={method.description || ""}
                        onChange={(e) => updateCustomMethod(method.id, { description: e.target.value })}
                        placeholder="e.g. Pay via credit card or digital wallet."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Instructions / Payment Link</Label>
                      <Input
                        value={method.instructions || ""}
                        onChange={(e) => updateCustomMethod(method.id, { instructions: e.target.value })}
                        placeholder="e.g. https://mercadopago.com/link or email account"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Button
          type="button"
          onClick={() => handleSave("payment_methods", paymentMethods as unknown as Record<string, unknown>)}
          disabled={saving}
          className="w-fit"
        >
          {saving ? "Saving Payment Settings…" : "Save Payment Methods"}
        </Button>
      </TabsContent>
    </Tabs>
  );
}
