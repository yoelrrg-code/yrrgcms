import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/admin/profile-form";

export const metadata = {
  title: "Editar Perfil | YRRG CMS",
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
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Administrá los detalles de tu cuenta de usuario.
        </p>
      </div>
      
      <ProfileForm user={user} />
    </div>
  );
}
