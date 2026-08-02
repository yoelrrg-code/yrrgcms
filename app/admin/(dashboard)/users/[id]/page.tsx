import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserById } from "@/lib/actions/users";
import { UserForm } from "@/components/admin/UserForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface UserEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;
  const isNew = id === "new";

  let user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "author";
  } | null = null;

  if (!isNew) {
    const found = await getUserById(id);
    if (!found) notFound();
    user = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    };
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 gap-1.5 text-muted-foreground"
          render={<Link href="/admin/users" />}
        >
          <ChevronLeft className="size-4" />
          Back to Users
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isNew ? "New User" : `Edit: ${user?.name}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isNew
            ? "Create a new admin or author account."
            : "Update user account details and permissions."}
        </p>
      </div>

      <UserForm user={user} />
    </div>
  );
}
