import Link from "next/link";
import Image from "next/image";
import { getGlobal } from "@/lib/actions/globals";
import { getMenuByLocation } from "@/lib/actions/menus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown } from "lucide-react";

export interface HeaderConfig {
  siteName?: string;
  logoUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface NavItem {
  id: string;
  label: string;
  url?: string | null;
  pageSlug?: string | null;
  target?: string | null;
  children?: NavItem[];
}

export default async function Header({ transparency }: { transparency?: number }) {
  const headerData = ((await getGlobal("header")) as HeaderConfig) || {};
  const menuData = await getMenuByLocation("header");

  const siteName = headerData.siteName || "YRRG CMS";
  const logoUrl = headerData.logoUrl;
  const ctaText = headerData.ctaText;
  const ctaUrl = headerData.ctaUrl;

  const navItems = menuData?.items || [];

  // Use an inline style for background transparency if provided, otherwise default.
  // Note: we're replacing the default bg-background/95 with the dynamic theme color.
  const headerStyle: React.CSSProperties = {
    backgroundColor: transparency !== undefined 
      ? `color-mix(in srgb, var(--theme-header-bg, var(--background)) ${transparency * 100}%, transparent)` 
      : 'var(--theme-header-bg, var(--background))',
    backdropFilter: 'blur(var(--theme-header-blur, 8px))',
    padding: 'var(--theme-header-padding, 0)'
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b"
      style={headerStyle}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4" style={{ padding: 'inherit' }}>
        <Link href="/" className="flex items-center space-x-2">
          {logoUrl ? (
            <Image src={logoUrl} alt={siteName} width={65} height={40} className="object-contain" />
          ) : (
            <span className="font-bold text-xl">{siteName}</span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item: NavItem) => {
            const hren = item.children && item.children.length > 0;
            const href = item.url || (item.pageSlug ? (item.pageSlug === "home" ? "/" : `/${item.pageSlug}`) : "#");

            if (hren) {
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-theme-menu-link hover:text-primary transition-colors duration-300 focus:outline-none">
                    {item.label} <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="animate-in fade-in-50 slide-in-from-top-1 duration-200">
                    {item.children?.map((child: NavItem) => {
                      const childHref = child.url || (child.pageSlug ? (child.pageSlug === "home" ? "/" : `/${child.pageSlug}`) : "#");
                      return (
                        <DropdownMenuItem key={child.id} className="cursor-pointer">
                          <Link href={childHref} target={child.target || undefined} className="w-full">
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={item.id}
                href={href}
                target={item.target || undefined}
                className="relative py-1 text-theme-menu-link transition-colors duration-300 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {ctaText && ctaUrl && (
            <div className="hidden md:block">
              <Button
                render={<Link href={ctaUrl} />}
                className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                {ctaText}
              </Button>
            </div>
          )}

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger
              className="md:hidden"
              render={<Button variant="outline" size="icon" />}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item: NavItem) => {
                  const hren = item.children && item.children.length > 0;
                  const href = item.url || (item.pageSlug ? (item.pageSlug === "home" ? "/" : `/${item.pageSlug}`) : "#");

                  if (hren) {
                    return (
                      <div key={item.id} className="space-y-3">
                        <div className="font-medium">{item.label}</div>
                        <div className="pl-4 flex flex-col gap-2">
                          {item.children?.map((child: NavItem) => {
                            const childHref = child.url || (child.pageSlug ? (child.pageSlug === "home" ? "/" : `/${child.pageSlug}`) : "#");
                            return (
                              <Link key={child.id} href={childHref} target={child.target || undefined} className="text-muted-foreground hover:text-foreground">
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link key={item.id} href={href} target={item.target || undefined} className="font-medium text-theme-menu-link hover:text-theme-menu-link/80">
                      {item.label}
                    </Link>
                  );
                })}
                {ctaText && ctaUrl && (
                  <Button  className="mt-4 w-full">
                    <Link href={ctaUrl}>{ctaText}</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
