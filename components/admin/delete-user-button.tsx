"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/lib/actions/users";
import { sileo } from "sileo";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  className?: string;
}

export function DeleteUserButton({ userId, userName, className }: DeleteUserButtonProps) {
  const router = useRouter();

  const handleDeleteClick = () => {
    sileo.action({
      title: `Delete user "${userName}"?`,
      description: "This action is permanent and cannot be undone. The user's account will be removed, but their authored content will remain.",
      button: {
        title: "Confirm Delete",
        onClick: async () => {
          try {
            await deleteUser(userId);
            sileo.success({
              title: "User Deleted",
              description: `User "${userName}" was removed successfully.`,
            });
            router.refresh();
          } catch (err) {
            sileo.error({
              title: "Error",
              description: err instanceof Error ? err.message : "Failed to delete user.",
            });
          }
        },
      },
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDeleteClick}
      className={`h-10 text-xs gap-1.5 rounded-md ${className || ""}`}
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </Button>
  );
}
