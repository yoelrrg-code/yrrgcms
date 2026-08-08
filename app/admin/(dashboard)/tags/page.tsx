import { getTags, createTag, deleteTag } from "@/lib/actions/tags";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, SquarePen, Trash2 } from "lucide-react";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tags</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tag your blog posts for easier discovery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tags table */}
        <div className="lg:col-span-2 rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-10"
                  >
                    No tags yet.
                  </TableCell>
                </TableRow>
              )}
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {tag.slug}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {/* Botón Editar Cuadrado */}
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                        render={<Link href={`/admin/tags/${tag.id}`} />}
                        title="Editar etiqueta"
                      >
                        <SquarePen className="size-4" />
                      </Button>

                      {/* Botón Eliminar Rojo */}
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              size="icon"
                              className="size-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-xs border border-rose-500/30 transition-colors shrink-0"
                              title="Eliminar etiqueta"
                            />
                          }
                        >
                          <Trash2 className="size-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the tag &quot;{tag.name}&quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <form
                              action={async () => {
                                "use server";
                                await deleteTag(tag.id);
                                revalidatePath("/admin/tags");
                              }}
                            >
                              <AlertDialogAction type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Delete</AlertDialogAction>
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

        {/* Add tag form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              New Tag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server";
                const name = String(formData.get("name") ?? "").trim();
                const slugRaw = String(formData.get("slug") ?? "").trim();
                if (!name) return;
                await createTag({ name, slug: slugRaw || toSlug(name) });
                revalidatePath("/admin/tags");
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="tag-name">Name *</Label>
                <Input id="tag-name" name="name" placeholder="Tag name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tag-slug">Slug</Label>
                <Input id="tag-slug" name="slug" placeholder="auto-generated" />
              </div>
              <Button type="submit" className="w-full">
                Create Tag
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
