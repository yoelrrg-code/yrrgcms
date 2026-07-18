import { tiptapToHtml } from "@/lib/tiptap-render";

export interface RichTextBlockProps {
  paddingTop?: string;
  paddingBottom?: string;
  /** Tiptap JSON document or null */
  content: unknown;
}

export default function RichTextBlock({
  paddingTop,
  paddingBottom, content }: RichTextBlockProps) {
  const html = tiptapToHtml(content);

  if (!html) return null;

  return (
    <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-16 px-6`}>
      <div className="mx-auto max-w-4xl">
        <div
          className="
            prose prose-lg prose-slate dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-a:text-theme-primary dark:prose-a:text-theme-primary
            prose-a:underline-offset-4 hover:prose-a:text-theme-primary
            prose-blockquote:border-l-theme-primary
            prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50
            prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:pr-4
            prose-code:bg-slate-100 dark:prose-code:bg-slate-800
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-code:font-mono prose-code:text-sm
            prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950
            prose-pre:shadow-xl prose-pre:ring-1 prose-pre:ring-white/10
            prose-img:rounded-xl prose-img:shadow-lg
            prose-hr:border-slate-200 dark:prose-hr:border-slate-700
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
