import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { SidebarNav } from "@/components/admin/SidebarNav";
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { Button } from "@/components/ui/button";
import { Zap, User } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const adminUser = isAdmin(session);
  const userName = session.user.name ?? "Unknown User";
  const userEmail = session.user.email ?? "";
  const userRole = (session.user as { role?: string }).role ?? "author";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const pendingOrdersCount = isAdmin(session)
    ? (
        await db
          .select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(eq(orders.status, "PENDING_PAYMENT"))
      )[0]?.count ?? 0
    : 0;

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
              <SidebarNav
                isAdmin={adminUser}
                pendingOrdersCount={Number(pendingOrdersCount)}
              />
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
            Edit Profile
          </Button>
          <SignOutButton />
        </SidebarFooter>
      </Sidebar>

      {/* Main content area */}
      <SidebarInset className="min-w-0 max-w-full overflow-x-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <div className="flex-1 overflow-x-auto p-4 md:p-6 lg:p-8 max-w-full min-w-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
