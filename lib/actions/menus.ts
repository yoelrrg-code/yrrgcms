"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { menus, menuItems, pages } from "@/lib/db/schema";
import { requireCan } from "@/lib/permissions";
import { eq, asc } from "drizzle-orm";


// Returns all menus
export async function getMenus() {
  const session = await auth();
  requireCan(session, "manage", "menus");

  return db.select().from(menus).orderBy(asc(menus.name));
}

// Returns a menu by id with items
export async function getMenuById(id: string) {
  const [menu] = await db
    .select()
    .from(menus)
    .where(eq(menus.id, id))
    .limit(1);

  if (!menu) return null;

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.menuId, menu.id))
    .orderBy(asc(menuItems.order));

  return { ...menu, items };
}

// Returns a menu by location with nested items sorted by order
export async function getMenuByLocation(
  location: "header" | "footer" | "sidebar"
) {
  const [menu] = await db
    .select()
    .from(menus)
    .where(eq(menus.location, location))
    .limit(1);

  if (!menu) return null;

  const items = await db
    .select({
      id: menuItems.id,
      menuId: menuItems.menuId,
      label: menuItems.label,
      url: menuItems.url,
      pageId: menuItems.pageId,
      parentId: menuItems.parentId,
      order: menuItems.order,
      target: menuItems.target,
      pageSlug: pages.slug,
    })
    .from(menuItems)
    .leftJoin(pages, eq(menuItems.pageId, pages.id))
    .where(eq(menuItems.menuId, menu.id))
    .orderBy(asc(menuItems.order));

  // Build nested structure: top-level items with their children
  const topLevel = items.filter((i) => !i.parentId);
  const withChildren = topLevel.map((item) => ({
    ...item,
    children: items.filter((i) => i.parentId === item.id),
  }));

  return { ...menu, items: withChildren };
}

// Creates a new menu
export async function createMenu(data: {
  name: string;
  location: "header" | "footer" | "sidebar";
}) {
  const session = await auth();
  requireCan(session, "manage", "menus");

  const [newMenu] = await db
    .insert(menus)
    .values({
      name: data.name,
      location: data.location,
    })
    .returning();

  return newMenu;
}

// Replaces all items for a menu (delete-then-insert strategy)
export async function saveMenuItems(
  menuId: string,
  items: Array<{
    label: string;
    url?: string | null;
    pageId?: string | null;
    parentId?: string | null;
    order: number;
    target?: "_self" | "_blank";
  }>
) {
  const session = await auth();
  requireCan(session, "manage", "menus");

  // Delete all existing items for this menu
  await db.delete(menuItems).where(eq(menuItems.menuId, menuId));

  if (items.length === 0) return [];

  // Insert new items
  const inserted = await db
    .insert(menuItems)
    .values(
      items.map((item) => ({
        menuId,
        label: item.label,
        url: item.url ?? null,
        pageId: item.pageId ?? null,
        parentId: item.parentId ?? null,
        order: item.order,
        target: item.target ?? "_self",
      }))
    )
    .returning();

  return inserted;
}

// Deletes a menu (cascade deletes items via DB constraint)
export async function deleteMenu(id: string) {
  const session = await auth();
  requireCan(session, "manage", "menus");

  await db.delete(menus).where(eq(menus.id, id));
}
