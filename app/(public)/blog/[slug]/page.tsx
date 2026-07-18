import { getPostBySlug } from "@/lib/actions/posts";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { tiptapToHtml } from "@/lib/tiptap-render";

interface SeoData {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post || post.status === "draft") {
    return { title: "Not Found" };
  }

  const seo = (post.seo as SeoData) || {};

  return {
    title: seo.title || post.title,
    description: seo.description || post.excerpt || undefined,
    openGraph: {
      title: seo.title || post.title,
      description: seo.description || post.excerpt || undefined,
      images: seo.ogImage || post.featuredImageUrl ? [{ url: seo.ogImage || post.featuredImageUrl || "" }] : undefined,
    },
    robots: seo.noIndex ? "noindex, nofollow" : "index, follow",
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post || post.status === "draft") {
    notFound();
  }

  const html = tiptapToHtml(post.content);

  return (
    <main className="min-h-screen py-16 px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-12 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
            {post.authorName && <span>By {post.authorName}</span>}
            {post.authorName && <span>&bull;</span>}
            <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}>
              {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(post.publishedAt || post.createdAt)}
            </time>
          </div>

          {((post.categories && post.categories.length > 0) || (post.tags && post.tags.length > 0)) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {post.categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog/category/${cat.slug}`}
                  className="rounded-full bg-theme-primary/10 px-3 py-1 text-xs font-semibold text-theme-primary hover:bg-theme-primary/20 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              {post.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {post.featuredImageUrl && (
            <div className="mt-8 overflow-hidden rounded-2xl shadow-xl">
              <Image 
                src={post.featuredImageUrl} 
                alt={post.title}
                width={1200}
                height={630}
                className="w-full h-auto object-cover aspect-video"
                priority
              />
            </div>
          )}
        </header>

        {/* Content */}
        {html ? (
          <div
            className="
              prose prose-lg prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-a:text-theme-primary
              prose-a:underline-offset-4 hover:prose-a:text-theme-primary/80
              prose-blockquote:border-l-theme-primary
              prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50
              prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:pr-4
              prose-code:bg-slate-100 dark:prose-code:bg-slate-800
              prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-code:font-mono prose-code:text-sm
              prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950
              prose-pre:shadow-xl prose-pre:ring-1 prose-pre:ring-white/10
              prose-img:rounded-xl prose-img:shadow-lg
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            This post has no content.
          </div>
        )}
      </article>
    </main>
  );
}
