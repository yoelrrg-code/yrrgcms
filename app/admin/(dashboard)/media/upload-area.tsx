"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";

export function UploadArea() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadFileName(file.name);
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
      setUploadFileName("");
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
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ${
        uploading
          ? "border-indigo-500/60 bg-indigo-500/5 dark:bg-indigo-950/20 shadow-md"
          : isDragging
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-border bg-card hover:bg-accent/40"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!uploading) setIsDragging(true);
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
        disabled={uploading}
      />

      {uploading ? (
        <div className="flex flex-col items-center justify-center space-y-3 py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-foreground animate-pulse">
              Uploading {uploadFileName || "file"}...
            </h3>
            <p className="text-xs text-muted-foreground">
              Please wait while the media file is being uploaded and processed.
            </p>
          </div>
          {/* Animated Progress Bar */}
          <div className="w-56 h-1.5 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full overflow-hidden relative mt-2">
            <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-[shimmer_1.5s_infinite] -translate-x-full w-full" style={{
              animation: "slideProgress 1.4s ease-in-out infinite"
            }} />
          </div>
          <style jsx>{`
            @keyframes slideProgress {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      ) : (
        <>
          <div className="p-3 bg-muted rounded-2xl mb-3 text-muted-foreground">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            Drag and drop a media file
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            or click to select from your device
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl font-bold gap-2 text-xs"
          >
            Select File
          </Button>
        </>
      )}
    </div>
  );
}
