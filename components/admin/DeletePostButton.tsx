"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/lib/actions/posts";
import { sileo } from "sileo";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
  className?: string;
  iconOnly?: boolean;
}

export function DeletePostButton({
  postId,
  postTitle,
  className,
  iconOnly = true,
}: DeletePostButtonProps) {
  const router = useRouter();

  const handleDelete = () => {
    sileo.action({
      title: `¿Eliminar "${postTitle}"?`,
      description: "Esta acción es permanente y no se puede deshacer.",
      button: {
        title: "Confirmar eliminación",
        onClick: async () => {
          try {
            await deletePost(postId);
            sileo.success({
              title: "Post eliminado",
              description: `El post "${postTitle}" fue eliminado correctamente.`,
            });
            router.refresh();
          } catch (err) {
            sileo.error({
              title: "Error al eliminar",
              description: err instanceof Error ? err.message : "No se pudo eliminar el post.",
            });
          }
        },
      },
    });
  };

  return (
    <Button
      type="button"
      size={iconOnly ? "icon" : "sm"}
      onClick={handleDelete}
      className={`size-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-xs border border-rose-500/30 transition-colors shrink-0 ${className || ""}`}
      title="Eliminar post"
    >
      <Trash2 className="size-4" />
      {!iconOnly && <span>Eliminar</span>}
    </Button>
  );
}
