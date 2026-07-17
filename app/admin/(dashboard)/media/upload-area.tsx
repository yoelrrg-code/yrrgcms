"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";

export function UploadArea() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }
      router.refresh();
      sileo.success({ title: "File uploaded successfully!" });
    } catch (err: unknown) {
      sileo.error({ title: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:bg-accent/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-1">
        {uploading ? "Uploading..." : "Drag and drop a file"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        or click to select from your computer
      </p>
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        Select File
      </Button>
    </div>
  );
}
