import { generateHTML } from "@tiptap/html/server";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";

/**
 * Converts a Tiptap JSON document into an HTML string.
 * Safe to call from Server Components – no browser APIs required.
 *
 * @param content  The Tiptap JSON document (as stored in the DB).
 * @returns        An HTML string, or an empty string if content is falsy / invalid.
 */
export function tiptapToHtml(content: unknown): string {
  if (!content) return "";

  // Tiptap expects the root node to have type "doc"
  const doc =
    typeof content === "object" &&
    content !== null &&
    (content as Record<string, unknown>).type === "doc"
      ? content
      : { type: "doc", content: [] };

  try {
    return generateHTML(doc as Parameters<typeof generateHTML>[0], [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ]);
  } catch {
    // If the content is malformed, return empty rather than crashing the page.
    return "";
  }
}
