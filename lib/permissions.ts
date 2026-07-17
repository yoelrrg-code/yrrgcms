import type { Session } from "next-auth";
import type { Post } from "@/lib/db/schema";

// ============================================================
// Capability types
// ============================================================

type Action = "create" | "read" | "edit" | "delete" | "publish" | "manage";

type Resource =
  | "pages"
  | "posts"
  | "categories"
  | "tags"
  | "forms"
  | "form_submissions"
  | "menus"
  | "globals"
  | "media"
  | "users";

// ============================================================
// Admin-only resources — Authors have no access at all
// ============================================================

const ADMIN_ONLY_RESOURCES: Resource[] = [
  "categories",
  "forms",
  "form_submissions",
  "menus",
  "globals",
  "users",
];

// ============================================================
// can() — the single source of truth for all permissions
// ============================================================

/**
 * Check whether a session user is allowed to perform an action on a resource.
 *
 * @param session  - NextAuth session (must include user.role)
 * @param action   - The capability being checked
 * @param resource - The resource type being accessed
 * @param record   - Optional: the specific record (used for ownership checks)
 */
export function can(
  session: Session | null,
  action: Action,
  resource: Resource,
  record?: { authorId?: string | null }
): boolean {
  if (!session?.user) return false;

  const role = (session.user as { role?: string }).role;
  const userId = session.user.id;

  // Admins can do everything
  if (role === "admin") return true;

  // Authors have zero access to admin-only resources
  if (ADMIN_ONLY_RESOURCES.includes(resource)) return false;

  // Author-specific rules
  if (role === "author") {
    switch (resource) {
      case "pages":
        // Authors can create, edit, publish, delete their own pages
        return true;

      case "posts":
        // Authors can only touch their own posts
        if (action === "create") return true;
        if (record) return record.authorId === userId;
        // If no record provided, allow (listing filtered server-side)
        return true;

      case "tags":
        // Authors can create and read tags, but not delete
        return action !== "delete";

      case "media":
        // Authors can upload and read media, but not delete
        return action !== "delete";

      default:
        return false;
    }
  }

  return false;
}

// ============================================================
// Convenience: throw if not allowed (use in Server Actions)
// ============================================================

export function requireCan(
  session: Session | null,
  action: Action,
  resource: Resource,
  record?: { authorId?: string | null }
): void {
  if (!can(session, action, resource, record)) {
    throw new Error(
      `Forbidden: you don't have permission to ${action} ${resource}.`
    );
  }
}

// ============================================================
// Route-level admin guard (use in Server Components / middleware)
// ============================================================

export function isAdmin(session: Session | null): boolean {
  return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export function isAuthor(session: Session | null): boolean {
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "author" || role === "admin";
}
