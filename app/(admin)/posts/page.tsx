import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPosts, deletePost, publishPost, unpublishPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { PlusIcon, Pencil } from "lucide-react";

export default async function PostsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  // Authors see only their own posts (handled inside getPosts, but we pass authorId explicitly for clarity)
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "author"
              ? "Your blog posts."
              : "All blog posts from all authors."}
          </p>
        </div>
        <Link href="/posts/new">
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-10"
                >
                  No posts yet. Create your first post above.
                </TableCell>
              </TableRow>
            )}
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {post.authorName ?? "Unknown"}
                </TableCell>
                <TableCell>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
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
                    <Link href={`/posts/${post.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    {post.status === "draft" ? (
                      <form
                        action={async () => {
                          "use server";
                          await publishPost(post.id);
                        }}
                      >
                        <Button type="submit" variant="ghost" size="sm" className="h-8 text-xs">
                          Publish
                        </Button>
                      </form>
                    ) : (
                      <form
                        action={async () => {
                          "use server";
                          await unpublishPost(post.id);
                        }}
                      >
                        <Button type="submit" variant="ghost" size="sm" className="h-8 text-xs">
                          Unpublish
                        </Button>
                      </form>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{post.title}&quot;. This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <form
                            action={async () => {
                              "use server";
                              await deletePost(post.id);
                            }}
                          >
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
  );
}
