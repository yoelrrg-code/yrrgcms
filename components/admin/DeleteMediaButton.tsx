"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMedia } from "@/lib/actions/media";
import { sileo } from "sileo";

interface DeleteMediaButtonProps {
  mediaId: string;
  filename: string;
}

export function DeleteMediaButton({ mediaId, filename }: DeleteMediaButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    sileo.action({
      title: `Delete file "${filename}"?`,
      description: "This action will permanently delete the file from storage and database.",
      button: {
        title: "Confirm Delete",
        onClick: async () => {
          setIsDeleting(true);
          try {
            await deleteMedia(mediaId);
            sileo.success({
              title: "Media Deleted",
              description: `File "${filename}" was removed successfully.`,
            });
            router.refresh();
          } catch (err) {
            sileo.error({
              title: "Error",
              description: err instanceof Error ? err.message : "Failed to delete file.",
            });
            setIsDeleting(false);
          }
        },
      },
    });
  };

  return (
    <Button
      type="button"
      size="icon"
      onClick={handleDeleteClick}
      disabled={isDeleting}
      className="size-8 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-80 text-white shadow-xs border border-rose-500/30 transition-colors"
      title={isDeleting ? "Deleting file..." : "Delete media file"}
    >
      {isDeleting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </Button>
  );
}
