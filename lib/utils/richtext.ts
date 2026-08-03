/**
 * Helper to extract plain text or render TipTap/ProseMirror JSON structures cleanly.
 */

interface TipTapNode {
  type?: string;
  text?: string;
  content?: TipTapNode[];
  marks?: Array<{ type: string; [key: string]: unknown }>;
}

export function extractPlainTextFromRichText(raw: string | null | undefined): string {
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && parsed.type === "doc") {
      return extractTextFromNode(parsed).trim();
    }
    return String(raw);
  } catch {
    return String(raw);
  }
}

export function truncateTextToWords(text: string, maxWords: number = 50): string {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return text.trim();
  }
  return words.slice(0, maxWords).join(" ") + "...";
}

function extractTextFromNode(node: TipTapNode): string {
  if (node.text) {
    return node.text;
  }

  if (Array.isArray(node.content)) {
    const textParts = node.content.map(extractTextFromNode);
    if (node.type === "paragraph" || node.type === "heading") {
      return textParts.join("") + "\n";
    }
    return textParts.join("");
  }

  return "";
}
