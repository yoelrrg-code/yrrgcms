import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPosts, deletePost, publishPost, unpublishPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusIcon, Pencil, Newspaper, CheckCircle2, FileText, Users } from "lucide-react";

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Posts & Articles</h1>
          <p className="text-sm text-slate-500 mt-1">
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
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight">{totalPosts}</p>
        </div>

        <div className="bg-card border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Published</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">{publishedPosts}</p>
        </div>

        <div className="bg-card border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Drafts</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-300 tracking-tight">{draftPosts}</p>
        </div>

        <div className="bg-card border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Active Authors</span>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-800 dark:text-purple-300 tracking-tight">{authorsCount}</p>
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
                  <TableCell className="font-bold text-slate-900 dark:text-white">{post.title}</TableCell>
                  <TableCell className="text-sm text-slate-500">{post.authorName ?? "Unknown"}</TableCell>
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
                      <Link href={`/admin/posts/${post.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {post.status === "draft" ? (
                        <form action={async () => { "use server"; await publishPost(post.id); }}>
                          <Button type="submit" variant="ghost" size="sm" className="h-8 text-xs">Publish</Button>
                        </form>
                      ) : (
                        <form action={async () => { "use server"; await unpublishPost(post.id); }}>
                          <Button type="submit" variant="ghost" size="sm" className="h-8 text-xs">Unpublish</Button>
                        </form>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive" />}>
                          Delete
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete &quot;{post.title}&quot;. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <form action={async () => { "use server"; await deletePost(post.id); }}>
                              <AlertDialogAction type="submit">Delete</AlertDialogAction>
                            </form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{post.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{post.authorName ?? "Unknown"}</p>
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
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
              <Link href={`/admin/posts/${post.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </Link>
              {post.status === "draft" ? (
                <form action={async () => { "use server"; await publishPost(post.id); }} className="flex-1">
                  <Button type="submit" variant="ghost" size="sm" className="w-full text-xs rounded-xl">Publish</Button>
                </form>
              ) : (
                <form action={async () => { "use server"; await unpublishPost(post.id); }} className="flex-1">
                  <Button type="submit" variant="ghost" size="sm" className="w-full text-xs rounded-xl">Unpublish</Button>
                </form>
              )}
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive rounded-xl" />}>
                  Delete
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete post?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &quot;{post.title}&quot;. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form action={async () => { "use server"; await deletePost(post.id); }}>
                      <AlertDialogAction type="submit">Delete</AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
