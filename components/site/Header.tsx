import Link from "next/link";
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

export default async function Header() {
  const headerData = ((await getGlobal("header")) as any) || {};
  const menuData = await getMenuByLocation("header");

  const siteName = headerData.siteName || "yrrgCMS";
  const logoUrl = headerData.logoUrl;
  const ctaText = headerData.ctaText;
  const ctaUrl = headerData.ctaUrl;

  const navItems = menuData?.items || [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
          ) : (
            <span className="font-bold text-xl">{siteName}</span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item: any) => {
            const hren = item.children && item.children.length > 0;
            const href = item.url || (item.pageSlug ? (item.pageSlug === "home" ? "/" : `/${item.pageSlug}`) : "#");

            if (hren) {
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary">
                    {item.label} <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.children.map((child: any) => {
                      const childHref = child.url || (child.pageSlug ? (child.pageSlug === "home" ? "/" : `/${child.pageSlug}`) : "#");
                      return (
                        <DropdownMenuItem key={child.id} >
                          <Link href={childHref} target={child.target}>
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
              <Link key={item.id} href={href} target={item.target} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {ctaText && ctaUrl && (
            <div className="hidden md:block">
              <Button >
                <Link href={ctaUrl}>{ctaText}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger  className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item: any) => {
                  const hren = item.children && item.children.length > 0;
                  const href = item.url || (item.pageSlug ? (item.pageSlug === "home" ? "/" : `/${item.pageSlug}`) : "#");

                  if (hren) {
                    return (
                      <div key={item.id} className="space-y-3">
                        <div className="font-medium">{item.label}</div>
                        <div className="pl-4 flex flex-col gap-2">
                          {item.children.map((child: any) => {
                            const childHref = child.url || (child.pageSlug ? (child.pageSlug === "home" ? "/" : `/${child.pageSlug}`) : "#");
                            return (
                              <Link key={child.id} href={childHref} target={child.target} className="text-muted-foreground hover:text-foreground">
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link key={item.id} href={href} target={item.target} className="font-medium hover:text-primary">
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
