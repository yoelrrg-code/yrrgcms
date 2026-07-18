"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, Loader2Icon } from "lucide-react";
import { createTheme } from "@/lib/actions/themes";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ImportThemeButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      
      const config = parsed.config || parsed; // Handle either format
      const rawName = parsed.name || file.name.replace(/\.json$/i, "");
      const name = `${rawName} (Imported)`;
      const slug = toSlug(name);
      
      await createTheme({ name, slug, config });
      sileo.success({ title: "Theme imported successfully!" });
      router.refresh();
    } catch (error) {
      console.error("Failed to import theme", error);
      sileo.error({ title: "Invalid theme JSON file" });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="gap-2"
      >
        {isImporting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
        Import Theme
      </Button>
    </div>
  );
}
