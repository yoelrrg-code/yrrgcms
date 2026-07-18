"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

import { Theme } from "@/lib/db/schema";

export function ExportThemeButton({ theme }: { theme: Theme }) {
  const handleExport = () => {
    const exportData = {
      name: theme.name,
      config: theme.config
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${theme.slug}-theme.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} title="Export Theme">
      <DownloadIcon className="w-4 h-4" />
      <span className="sr-only">Export</span>
    </Button>
  );
}
