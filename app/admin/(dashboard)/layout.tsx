import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { SidebarNav } from "@/components/admin/SidebarNav";
import { UserDrawer } from "@/components/site/UserDrawer";
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
import { Zap } from "lucide-react";
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

  const role = (session.user as { role?: string }).role;
  if (role === "customer") {
    redirect("/my-account");
  }

  const adminUser = isAdmin(session);
  const userName = session.user.name ?? "Unknown User";
  const userEmail = session.user.email ?? "";
  const userRole = role ?? "author";

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
        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
            <span>YRRG CMS Admin</span>
            <span className="capitalize">{userRole}</span>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main content area */}
      <SidebarInset className="min-w-0 max-w-full overflow-x-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
          </div>

          <div className="flex items-center gap-3">
            <UserDrawer
              user={{
                name: userName,
                email: userEmail,
                role: userRole,
              }}
              editHref="/admin/profile"
              isAdminArea={true}
            />
          </div>
        </header>
        <div className="flex-1 overflow-x-auto p-4 md:p-6 lg:p-8 max-w-full min-w-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
