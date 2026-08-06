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
      <div className="mx-auto max-w-4xl bg-[var(--theme-card-bg,rgba(255,255,255,0.7))] dark:bg-slate-900/60 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800 shadow-sm">
        <div
          className="
            prose prose-lg prose-slate dark:prose-invert max-w-none
            text-[var(--theme-p-color,#475569)] dark:text-slate-300
            prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-[var(--theme-h2-color,currentColor)] dark:prose-headings:text-white
            prose-a:text-[var(--theme-primary,var(--primary))] dark:prose-a:text-[var(--theme-primary,var(--primary))]
            prose-a:underline-offset-4 hover:prose-a:opacity-80
            prose-blockquote:border-l-4 prose-blockquote:border-l-[var(--theme-primary,var(--primary))]
            prose-blockquote:bg-indigo-500/5 dark:prose-blockquote:bg-indigo-500/10
            prose-blockquote:rounded-r-2xl prose-blockquote:py-3 prose-blockquote:px-6
            prose-code:bg-slate-100 dark:prose-code:bg-slate-800
            prose-code:px-2 prose-code:py-1 prose-code:rounded-lg
            prose-code:font-mono prose-code:text-sm
            prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950
            prose-pre:shadow-2xl prose-pre:rounded-2xl prose-pre:ring-1 prose-pre:ring-white/10
            prose-img:rounded-2xl prose-img:shadow-xl
            prose-hr:border-slate-200/80 dark:prose-hr:border-slate-800
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
