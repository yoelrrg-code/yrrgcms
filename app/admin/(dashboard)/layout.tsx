import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Tags,
  FolderTree,
  ClipboardList,
  Menu,
  Globe,
  Image,
  Users,
  User,
  Zap,
  Palette,
} from "lucide-react";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Posts", href: "/admin/posts", icon: Newspaper },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Tags", href: "/admin/tags", icon: Tags },
  { label: "Forms", href: "/admin/forms", icon: ClipboardList },
  { label: "Menus", href: "/admin/menus", icon: Menu },
  { label: "Globals", href: "/admin/globals", icon: Globe },
  { label: "Themes", href: "/admin/themes", icon: Palette },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Users", href: "/admin/users", icon: Users },
];

const AUTHOR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Posts", href: "/admin/posts", icon: Newspaper },
  { label: "Tags", href: "/admin/tags", icon: Tags },
  { label: "Media", href: "/admin/media", icon: Image },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const navItems = isAdmin(session) ? ADMIN_NAV : AUTHOR_NAV;
  const userName = session.user.name ?? "Unknown User";
  const userEmail = session.user.email ?? "";
  const userRole = (session.user as { role?: string }).role ?? "author";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="admin-dashboard flex w-full">
      <SidebarProvider>
      <Sidebar>
        {/* Brand header */}
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              <Zap className="size-4" />
            </div>
            <Link href="/" target="_blank" className="text-sm font-semibold tracking-tight hover:underline">
              YRRG CMS
            </Link>
          </div>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link href={item.href} />}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User footer */}
        <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex items-center justify-center size-8 rounded-full bg-muted text-muted-foreground text-xs font-semibold shrink-0">
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{userName}</span>
              <span className="text-xs text-muted-foreground truncate">
                {userEmail}
              </span>
            </div>
            <span className="ml-auto text-xs capitalize text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
              {userRole}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            render={<Link href="/admin/profile" />}
          >
            <User className="size-4" />
            Editar Perfil
          </Button>
          <SignOutButton />
        </SidebarFooter>
      </Sidebar>

      {/* Main content area */}
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
