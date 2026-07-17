"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, Image as ImageIcon, Check } from "lucide-react";
import { useEffect } from "react";
import { sileo } from "sileo";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  alt: string;
  createdAt: string;
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  trigger: React.ReactNode;
}

export default function MediaPicker({ onSelect, trigger }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) fetchMedia();
  }, [open]);

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    onSelect(url);
    setOpen(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      if (res.ok) {
        await fetchMedia();
        sileo.success({ title: "File uploaded!" });
      } else {
        sileo.error({ title: "Upload failed. Please try again." });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        {/* Upload area */}
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload File"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,application/pdf"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <p className="text-xs text-muted-foreground">
            Click an image to select it.
          </p>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="grid grid-cols-4 gap-3 p-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <ImageIcon className="h-8 w-8 opacity-40" />
              <p className="text-sm">No media yet. Upload your first file.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 p-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.url)}
                  className={`relative group aspect-square rounded-md border overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    selectedUrl === item.url ? "ring-2 ring-primary" : "hover:border-primary"
                  }`}
                  title={item.filename}
                >
                  {item.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                        {item.filename}
                      </span>
                    </div>
                  )}
                  {selectedUrl === item.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.filename}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
