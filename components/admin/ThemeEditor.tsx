"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Theme } from "@/lib/db/schema";
import { updateTheme } from "@/lib/actions/themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaveIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { sileo } from "sileo";

type HeadingConfig = {
  color?: string;
  padding?: string;
};

type ThemeConfig = {
  colors?: Record<string, string>;
  layout?: Record<string, string>;
  header?: Record<string, string | number>;
  footer?: Record<string, string>;
  button?: Record<string, string>;
  typography?: {
    paragraphColor?: string;
    paragraphPadding?: string;
    h1?: HeadingConfig;
    h2?: HeadingConfig;
    h3?: HeadingConfig;
    h4?: HeadingConfig;
    h5?: HeadingConfig;
    h6?: HeadingConfig;
  };
};

export function ThemeEditor({ theme }: { theme: Theme }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(theme.name);
  
  // Provide defaults in case config is empty or missing properties
  const config = (theme.config as ThemeConfig) || {};
  const colors = config.colors || {};
  const layout = config.layout || {};
  const header = config.header || {};
  const footer = config.footer || {};
  const buttonConfig = config.button || {};
  const typography = config.typography || {};
  
  // Colors
  const [primaryColor, setPrimaryColor] = useState(colors.primary || "#000000");
  const [secondaryColor, setSecondaryColor] = useState(colors.secondary || "#4b5563");
  const [backgroundColor, setBackgroundColor] = useState(colors.background || "#ffffff");
  const [textColor, setTextColor] = useState(colors.text || "#1a1a1a");
  const [linkColor, setLinkColor] = useState(colors.link || "#2563eb");
  const [menuLinkColor, setMenuLinkColor] = useState(colors.menuLink || "#4b5563");
  
  // Layout
  const [buttonStyle, setButtonStyle] = useState(layout.buttonStyle || "primary");
  const [contentPadding, setContentPadding] = useState(layout.contentPadding || "2rem 1rem");

  // Button
  const [btnBg, setBtnBg] = useState(buttonConfig.background || "");
  const [btnText, setBtnText] = useState(buttonConfig.text || "");
  const [btnHover, setBtnHover] = useState(buttonConfig.hover || "");
  const [btnPadding, setBtnPadding] = useState(buttonConfig.padding || "0.5rem 1rem");
  const [btnRadius, setBtnRadius] = useState(buttonConfig.radius || "0.375rem");

  // Typography
  const [pColor, setPColor] = useState(typography.paragraphColor || "");
  const [pPadding, setPPadding] = useState(typography.paragraphPadding || "");
  const [h1, setH1] = useState<HeadingConfig>(typography.h1 || { color: "", padding: "" });
  const [h2, setH2] = useState<HeadingConfig>(typography.h2 || { color: "", padding: "" });
  const [h3, setH3] = useState<HeadingConfig>(typography.h3 || { color: "", padding: "" });
  const [h4, setH4] = useState<HeadingConfig>(typography.h4 || { color: "", padding: "" });
  const [h5, setH5] = useState<HeadingConfig>(typography.h5 || { color: "", padding: "" });
  const [h6, setH6] = useState<HeadingConfig>(typography.h6 || { color: "", padding: "" });

  // Header
  const [headerBackground, setHeaderBackground] = useState(header.background || "#ffffff");
  const [headerTransparency, setHeaderTransparency] = useState(header.transparency ?? 0.95);
  const [headerBlur, setHeaderBlur] = useState(header.blur ?? 8);
  const [headerPadding, setHeaderPadding] = useState(header.padding || "0");

  // Footer
  const [footerBackground, setFooterBackground] = useState(footer.background || "#f3f4f6");
  const [footerTextColor, setFooterTextColor] = useState(footer.textColor || "");
  const [footerPadding, setFooterPadding] = useState(footer.padding || "3rem 0");

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const updatedConfig = {
        ...config,
        colors: {
          ...colors,
          primary: primaryColor,
          secondary: secondaryColor,
          background: backgroundColor,
          text: textColor,
          link: linkColor,
          menuLink: menuLinkColor,
        },
        layout: {
          ...layout,
          buttonStyle,
          contentPadding,
        },
        button: {
          ...buttonConfig,
          background: btnBg,
          text: btnText,
          hover: btnHover,
          padding: btnPadding,
          radius: btnRadius,
        },
        typography: {
          ...typography,
          paragraphColor: pColor,
          paragraphPadding: pPadding,
          h1, h2, h3, h4, h5, h6,
        },
        header: {
          ...header,
          background: headerBackground,
          transparency: Number(headerTransparency),
          blur: Number(headerBlur),
          padding: headerPadding,
        },
        footer: {
          ...footer,
          background: footerBackground,
          textColor: footerTextColor,
          padding: footerPadding,
        }
      };

      await updateTheme(theme.id, {
        name,
        config: updatedConfig,
      });

      sileo.success({ title: "Theme saved successfully!" });
      router.refresh();
    } catch (error) {
      console.error(error);
      sileo.error({ title: "Failed to save theme" });
    } finally {
      setIsSaving(false);
    }
  };

  const renderHeadingEditor = (tag: string, state: HeadingConfig, setState: (v: HeadingConfig) => void) => (
    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between border-b pb-4 last:border-0 last:pb-0">
      <div className="w-full sm:w-16 font-mono font-bold uppercase">{tag}</div>
      <div className="w-full sm:w-auto flex-1 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2 flex items-center gap-2">
          <Label className="w-16">Color</Label>
          <div className="flex gap-2 items-center flex-1">
            <input type="color" value={state.color || "#000000"} onChange={(e) => setState({ ...state, color: e.target.value })} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
            <Button variant="outline" size="sm" onClick={() => setState({ ...state, color: "" })}>Clear</Button>
          </div>
        </div>
        <div className="w-full sm:w-1/2 flex items-center gap-2">
          <Label className="w-16">Padding</Label>
          <Input placeholder="e.g. 0 0 1rem 0" value={state.padding || ""} onChange={(e) => setState({ ...state, padding: e.target.value })} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/themes" className={buttonVariants({ variant: "outline", size: "icon" })}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Theme</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customize colors and settings for &quot;{theme.name}&quot;
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <SaveIcon className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic information about this theme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Theme Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
            <CardDescription>Adjust the main colors used in the frontend layout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" id="primaryColor" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" id="secondaryColor" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="backgroundColor">Background</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" id="backgroundColor" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="textColor">Text Color</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" id="textColor" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="linkColor">Link Color</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" id="linkColor" value={linkColor} onChange={(e) => setLinkColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="menuLinkColor">Menu Link Color</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" id="menuLinkColor" value={menuLinkColor} onChange={(e) => setMenuLinkColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Button Settings</CardTitle>
            <CardDescription>Custom styling for primary action buttons.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={btnBg || "#000000"} onChange={(e) => setBtnBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                  <Button variant="outline" size="sm" onClick={() => setBtnBg("")}>Theme Default</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={btnText || "#ffffff"} onChange={(e) => setBtnText(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                  <Button variant="outline" size="sm" onClick={() => setBtnText("")}>Theme Default</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hover Background</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={btnHover || "#000000"} onChange={(e) => setBtnHover(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                  <Button variant="outline" size="sm" onClick={() => setBtnHover("")}>Theme Default</Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Padding</Label>
                <Input value={btnPadding} onChange={(e) => setBtnPadding(e.target.value)} placeholder="e.g. 0.5rem 1rem" />
              </div>
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Input value={btnRadius} onChange={(e) => setBtnRadius(e.target.value)} placeholder="e.g. 0.375rem or 9999px" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Global Layout</CardTitle>
            <CardDescription>Configure padding and default component styles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Button Style (Legacy Reference)</Label>
              <Select value={buttonStyle} onValueChange={(val) => setButtonStyle(val || "primary")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentPadding">Main Content Padding</Label>
              <Input
                id="contentPadding"
                value={contentPadding}
                onChange={(e) => setContentPadding(e.target.value)}
                placeholder="e.g. 2rem 1rem"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Typography Settings</CardTitle>
            <CardDescription>Detailed controls for paragraphs and heading tags.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paragraph Text Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={pColor || "#000000"} onChange={(e) => setPColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                  <Button variant="outline" size="sm" onClick={() => setPColor("")}>Theme Default</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Paragraph Padding</Label>
                <Input placeholder="e.g. 0 0 1rem 0" value={pPadding} onChange={(e) => setPPadding(e.target.value)} />
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">Headings (H1 - H6)</h3>
              {renderHeadingEditor("H1", h1, setH1)}
              {renderHeadingEditor("H2", h2, setH2)}
              {renderHeadingEditor("H3", h3, setH3)}
              {renderHeadingEditor("H4", h4, setH4)}
              {renderHeadingEditor("H5", h5, setH5)}
              {renderHeadingEditor("H6", h6, setH6)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Header Settings</CardTitle>
            <CardDescription>Adjust the appearance of the top navigation header.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="headerBackground">Background Color</Label>
              <input type="color" id="headerBackground" value={headerBackground} onChange={(e) => setHeaderBackground(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headerTransparency">Background Transparency (0 to 1)</Label>
              <Input
                id="headerTransparency"
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={headerTransparency}
                onChange={(e) => setHeaderTransparency(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headerBlur">Backdrop Blur (px)</Label>
              <Input
                id="headerBlur"
                type="number"
                min="0"
                max="50"
                value={headerBlur}
                onChange={(e) => setHeaderBlur(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headerPadding">Header Padding</Label>
              <Input
                id="headerPadding"
                value={headerPadding}
                onChange={(e) => setHeaderPadding(e.target.value)}
                placeholder="e.g. 0 1rem"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Footer Settings</CardTitle>
            <CardDescription>Adjust the appearance of the site footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="footerBackground">Background Color</Label>
              <input type="color" id="footerBackground" value={footerBackground} onChange={(e) => setFooterBackground(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="footerTextColor">Paragraph Text Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" id="footerTextColor" value={footerTextColor || "#000000"} onChange={(e) => setFooterTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                <Button variant="outline" size="sm" onClick={() => setFooterTextColor("")}>Theme Default</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerPadding">Footer Padding</Label>
              <Input
                id="footerPadding"
                value={footerPadding}
                onChange={(e) => setFooterPadding(e.target.value)}
                placeholder="e.g. 3rem 0"
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
