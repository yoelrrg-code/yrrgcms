import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPosts, publishPost, unpublishPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { PlusIcon, Newspaper, CheckCircle2, FileText, Users, Eye, SquarePen } from "lucide-react";

export default async function PostsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  const posts = await getPosts();

  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPosts = posts.filter((p) => p.status === "draft").length;
  const authorsCount = new Set(posts.map((p) => p.authorName).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Posts & Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "author"
              ? "Your blog posts and publishing draft pipeline."
              : "All blog posts across all registered authors."}
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="gap-2 shrink-0 self-start sm:self-auto font-bold rounded-xl shadow-sm">
            <PlusIcon className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Articles</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground tracking-tight">{totalPosts}</p>
        </div>

        <div className="bg-card border border-emerald-500/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Published</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground tracking-tight">{publishedPosts}</p>
        </div>

        <div className="bg-card border border-amber-500/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Drafts</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground tracking-tight">{draftPosts}</p>
        </div>

        <div className="bg-card border border-purple-500/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Active Authors</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground tracking-tight">{authorsCount}</p>
        </div>
      </div>

      {/* Desktop table ≥1024px */}
      <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-wider">Title</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Author</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">Date</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No posts yet. Create your first post above.
                  </TableCell>
                </TableRow>
              )}
              {posts.map((post) => (
                <TableRow key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                  <TableCell className="font-bold text-foreground">{post.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{post.authorName ?? "Unknown"}</TableCell>
                  <TableCell>
                    {post.status === "published" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        Draft
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 font-mono whitespace-nowrap">
                    {post.updatedAt
                      ? new Date(post.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {post.status === "draft" ? (
                        <form action={async () => { "use server"; await publishPost(post.id); }}>
                          <Button type="submit" variant="outline" size="sm" className="h-9 px-3 text-xs font-bold rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">Publish</Button>
                        </form>
                      ) : (
                        <form action={async () => { "use server"; await unpublishPost(post.id); }}>
                          <Button type="submit" variant="outline" size="sm" className="h-9 px-3 text-xs font-bold rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">Unpublish</Button>
                        </form>
                      )}
                      
                      {/* Botón Ver Público */}
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Ver en la web pública"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </Link>

                      {/* Botón Editar */}
                      <Link href={`/admin/posts/${post.id}`}>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Editar post"
                        >
                          <SquarePen className="size-4" />
                        </Button>
                      </Link>

                      {/* Botón Eliminar Rojo */}
                      <DeletePostButton
                        postId={post.id}
                        postTitle={post.title}
                        iconOnly={true}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile cards <1024px */}
      <div className="lg:hidden space-y-3">
        {posts.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            No posts yet. Create your first post above.
          </div>
        )}
        {posts.map((post) => (
          <div key={post.id} className="rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{post.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{post.authorName ?? "Unknown"}</p>
              </div>
              <div className="shrink-0">
                {post.status === "published" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 whitespace-nowrap">
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 whitespace-nowrap">
                    Draft
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
            </p>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              {/* Botón Ver Público */}
              <Link href={`/blog/${post.slug}`} target="_blank">
                <Button
                  size="icon"
                  variant="outline"
                  className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                  title="Ver en la web pública"
                >
                  <Eye className="size-4" />
                </Button>
              </Link>

              {/* Botón Editar Cuadrado */}
              <Link href={`/admin/posts/${post.id}`}>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                  title="Editar post"
                >
                  <SquarePen className="size-4" />
                </Button>
              </Link>

              {/* Botón Eliminar Rojo */}
              <DeletePostButton
                postId={post.id}
                postTitle={post.title}
                iconOnly={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
