import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Reveal } from "@/components/site/Reveal";
import {
  posts,
  users,
  postCategories,
  categories,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export interface PostsGridProps {
  paddingTop?: string;
  paddingBottom?: string;
  title?: string;
  categoryId?: string;
  count?: number;
  layout?: "grid" | "list";
}

export default async function PostsGrid({
  paddingTop,
  paddingBottom,
  title,
  categoryId,
  count = 6,
  layout = "grid",
}: PostsGridProps) {
  // ── Fetch posts ──────────────────────────────────────────────
  const baseQuery = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      featuredImageUrl: posts.featuredImageUrl,
      publishedAt: posts.publishedAt,
      authorName: users.name,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(postCategories, eq(postCategories.postId, posts.id))
    .leftJoin(categories, eq(postCategories.categoryId, categories.id))
    .where(
      categoryId
        ? and(eq(posts.status, "published"), eq(postCategories.categoryId, categoryId))
        : eq(posts.status, "published")
    )
    .orderBy(desc(posts.publishedAt))
    .limit(count);

  const postRows = await baseQuery;

  // ── Empty state ──────────────────────────────────────────────
  if (postRows.length === 0) {
    return (
      <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-20 px-6`}>
        {title && (
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-[var(--theme-h2-color,currentColor)] sm:text-4xl">
            {title}
          </h2>
        )}
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">No posts found</p>
        </div>
      </section>
    );
  }

  // ── Grid layout ──────────────────────────────────────────────
  if (layout === "grid") {
    return (
      <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-20 px-6`}>
        <div className="mx-auto max-w-6xl">
          {title && (
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-[var(--theme-h2-color,currentColor)] sm:text-4xl">
              {title}
            </h2>
          )}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {postRows.map((post, idx) => (
              <PostCard key={post.id} post={post} delay={idx * 100} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── List layout ──────────────────────────────────────────────
  return (
    <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-20 px-6`}>
      <div className="mx-auto max-w-4xl">
        {title && (
          <h2 className="mb-12 text-3xl font-bold tracking-tight text-[var(--theme-h2-color,currentColor)] sm:text-4xl">
            {title}
          </h2>
        )}
        <div className="divide-y divide-border">
          {postRows.map((post, idx) => (
            <PostListItem key={post.id} post={post} delay={idx * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Sub-components ────────────────────────────────────────────

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: Date | null;
  authorName: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};

function PostCard({ post, delay = 0 }: { post: PostRow; delay?: number }) {
  return (
    <Reveal animation="fade-up" delay={delay}>
      <div className="group card-hover-effect flex flex-col overflow-hidden rounded-3xl border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800/80 bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/80 backdrop-blur-md shadow-sm h-full">
        {/* Featured image */}
        <Link href={`/blog/${post.slug}`} className="block overflow-hidden relative">
          {post.featuredImageUrl ? (
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={post.featuredImageUrl}
                alt={post.title}
                fill
                className="img-zoom-effect object-cover transition-transform duration-700 ease-out group-hover:scale-100"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </Link>

        <div className="flex flex-1 flex-col gap-3.5 p-6">
          {/* Category badge */}
          {post.categoryName && (
            <Link
              href={`/blog/category/${post.categorySlug}`}
              className="w-fit rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--theme-primary,var(--primary))] ring-1 ring-indigo-500/20 transition-all hover:bg-indigo-500/20"
            >
              {post.categoryName}
            </Link>
          )}

          {/* Title */}
          <Link href={`/blog/${post.slug}`}>
            <h3 className="text-xl font-extrabold leading-snug text-[var(--theme-h3-color,currentColor)] dark:text-white transition-colors group-hover:text-[var(--theme-primary,var(--primary))] line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="flex-1 text-sm text-[var(--theme-p-color,#64748b)] dark:text-slate-400 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="mt-auto flex items-center gap-2 pt-3 border-t border-[var(--theme-card-border,rgba(226,232,240,0.6))] dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {post.authorName && <span>By {post.authorName}</span>}
            {post.authorName && post.publishedAt && <span>·</span>}
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(post.publishedAt)}
              </time>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function PostListItem({ post, delay = 0 }: { post: PostRow; delay?: number }) {
  return (
    <Reveal animation="fade-up" delay={delay}>
      <article className="group flex gap-6 py-8">
        {/* Thumbnail */}
        {post.featuredImageUrl && (
          <Link
            href={`/blog/${post.slug}`}
            className="hidden shrink-0 overflow-hidden rounded-xl sm:block"
          >
            <div className="relative h-24 w-36">
              <Image
                src={post.featuredImageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="144px"
              />
            </div>
          </Link>
        )}

        <div className="flex flex-col gap-2">
          {post.categoryName && (
            <Link
              href={`/blog/category/${post.categorySlug}`}
              className="w-fit rounded-full bg-theme-primary/10 px-3 py-0.5 text-xs font-semibold text-[var(--theme-primary,var(--primary))] ring-1 ring-theme-primary/20 transition-colors hover:bg-theme-primary/20"
            >
              {post.categoryName}
            </Link>
          )}

          <Link href={`/blog/${post.slug}`}>
            <h3 className="text-xl font-bold leading-snug text-[var(--theme-h3-color,currentColor)] transition-colors group-hover:text-[var(--theme-primary,var(--primary))]">
              {post.title}
            </h3>
          </Link>

          {post.excerpt && (
            <p className="text-sm text-[var(--theme-p-color,var(--muted-foreground,currentColor))] line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-[var(--theme-p-color,var(--muted-foreground,currentColor))] opacity-80">
            {post.authorName && <span>{post.authorName}</span>}
            {post.authorName && post.publishedAt && <span>·</span>}
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(post.publishedAt)}
              </time>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}
