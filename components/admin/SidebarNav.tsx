"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ShoppingBag,
  GraduationCap,
  CreditCard,
  Megaphone,
  FileText,
  Newspaper,
  Zap,
  ClipboardList,
  Quote,
  FolderTree,
  Tags,
  Menu,
  Globe,
  Image,
  Users,
  Palette,
} from "lucide-react";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "LMS Courses", href: "/admin/courses", icon: GraduationCap },
  { label: "Sales & Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Marketing & AI", href: "/admin/marketing", icon: Megaphone },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Posts", href: "/admin/posts", icon: Newspaper },
  { label: "Services", href: "/admin/services", icon: Zap },
  { label: "Schedule & Bookings", href: "/admin/schedule", icon: ClipboardList },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Tags", href: "/admin/tags", icon: Tags },
  { label: "Forms", href: "/admin/forms", icon: ClipboardList },
  { label: "Menus", href: "/admin/menus", icon: Menu },
  { label: "Globals", href: "/admin/globals", icon: Globe },
  { label: "Themes", href: "/admin/themes", icon: Palette },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Users", href: "/admin/users", icon: Users },
];

const AUTHOR_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Posts", href: "/admin/posts", icon: Newspaper },
  { label: "Tags", href: "/admin/tags", icon: Tags },
  { label: "Media", href: "/admin/media", icon: Image },
];

interface SidebarNavProps {
  isAdmin: boolean;
  pendingOrdersCount: number;
}

export function SidebarNav({ isAdmin, pendingOrdersCount }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = isAdmin ? ADMIN_NAV : AUTHOR_NAV;

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isSales = item.href === "/admin/payments";
        const showBadge = isSales && pendingOrdersCount > 0;

        const isActive =
          pathname === item.href ||
          (item.href !== "/admin/dashboard" &&
            pathname.startsWith(item.href + "/"));

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} />}
              className={
                isActive
                  ? "bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:text-primary-foreground"
                  : undefined
              }
            >
              <item.icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-rose-600 rounded-full min-w-[20px]">
                  {pendingOrdersCount}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
