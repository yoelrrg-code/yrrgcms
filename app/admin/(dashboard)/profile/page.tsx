import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/admin/ProfileForm";

export const metadata = {
  title: "Edit Profile | YRRG CMS",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const user = {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user as { role?: string }).role ?? "author",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your user account details.
        </p>
      </div>
      
      <ProfileForm user={user} />
    </div>
  );
}
