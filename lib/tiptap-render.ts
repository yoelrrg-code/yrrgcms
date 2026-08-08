import { generateHTML } from "@tiptap/html/server";
import StarterKit from "@tiptap/starter-kit";
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

  let parsedContent = content;
  if (typeof content === "string") {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      // Not a valid JSON string, might be raw text or HTML
      parsedContent = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] };
    }
  }

  // Tiptap expects the root node to have type "doc"
  const doc =
    typeof parsedContent === "object" &&
    parsedContent !== null &&
    (parsedContent as Record<string, unknown>).type === "doc"
      ? parsedContent
      : { type: "doc", content: [] };

  try {
    return generateHTML(doc as Parameters<typeof generateHTML>[0], [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      Image,
    ]);
  } catch {
    // If the content is malformed, return empty rather than crashing the page.
    return "";
  }
}
