import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
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
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          {title && (
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
          )}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {postRows.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── List layout ──────────────────────────────────────────────
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-4xl">
        {title && (
          <h2 className="mb-12 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
        )}
        <div className="divide-y divide-border">
          {postRows.map((post) => (
            <PostListItem key={post.id} post={post} />
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

function PostCard({ post }: { post: PostRow }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      {/* Featured image */}
      <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
        {post.featuredImageUrl ? (
          <div className="relative aspect-video">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
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

      <div className="flex flex-1 flex-col gap-3 p-6">
        {/* Category badge */}
        {post.categoryName && (
          <Link
            href={`/blog/category/${post.categorySlug}`}
            className="w-fit rounded-full bg-theme-primary/10 px-3 py-0.5 text-xs font-semibold text-theme-primary ring-1 ring-theme-primary/20 transition-colors hover:bg-theme-primary/20"
          >
            {post.categoryName}
          </Link>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-theme-primary line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="flex-1 text-sm text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-muted-foreground">
          {post.authorName && <span>{post.authorName}</span>}
          {post.authorName && post.publishedAt && (
            <span className="text-border">·</span>
          )}
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
  );
}

function PostListItem({ post }: { post: PostRow }) {
  return (
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
            className="w-fit text-xs font-semibold uppercase tracking-wide text-theme-primary hover:underline"
          >
            {post.categoryName}
          </Link>
        )}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-theme-primary">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {post.authorName && <span>{post.authorName}</span>}
          {post.authorName && post.publishedAt && (
            <span className="text-border">·</span>
          )}
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
  );
}
