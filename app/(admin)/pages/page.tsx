import Link from "next/link";
import { getPages, deletePage, publishPage, unpublishPage } from "@/lib/actions/pages";
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

// Status badge helper
function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "published" ? "default" : "secondary"}>
      {status}
    </Badge>
  );
}

export default async function PagesPage() {
  const pages = await getPages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your site pages and their content blocks.
          </p>
        </div>
        <Link href="/pages/new">
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            New Page
          </Button>
        </Link>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-10"
                >
                  No pages yet. Create your first page above.
                </TableCell>
              </TableRow>
            )}
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  /{page.slug}
                </TableCell>
                <TableCell>
                  <StatusBadge status={page.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {page.updatedAt
                    ? new Date(page.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {/* Edit */}
                    <Link href={`/pages/${page.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    {/* Publish / Unpublish */}
                    {page.status === "draft" ? (
                      <form
                        action={async () => {
                          "use server";
                          await publishPage(page.id);
                        }}
                      >
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                        >
                          Publish
                        </Button>
                      </form>
                    ) : (
                      <form
                        action={async () => {
                          "use server";
                          await unpublishPage(page.id);
                        }}
                      >
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                        >
                          Unpublish
                        </Button>
                      </form>
                    )}

                    {/* Delete */}
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
                          <AlertDialogTitle>Delete page?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{page.title}&quot;. This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <form
                            action={async () => {
                              "use server";
                              await deletePage(page.id);
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
