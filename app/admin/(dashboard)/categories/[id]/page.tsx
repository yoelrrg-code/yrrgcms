import { getCategoryById, updateCategory, getCategories } from "@/lib/actions/categories";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  const allCategories = await getCategories();
  // Filter out the current category and its children to prevent circular parents
  // (In a simple implementation, we just filter out the current category)
  const validParents = allCategories.filter((c) => c.id !== category.id);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/categories" />}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Category</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update category details.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Category Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const name = String(formData.get("name") ?? "").trim();
              const description = String(formData.get("description") ?? "").trim();
              const parentId = String(formData.get("parentId") ?? "").trim();

              if (!name) return;

              await updateCategory(category.id, {
                name,
                description: description || undefined,
                parentId: parentId || undefined,
              });
              
              revalidatePath("/admin/categories");
              redirect("/admin/categories");
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input id="cat-name" name="name" defaultValue={category.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug (Cannot be changed)</Label>
              <Input id="cat-slug" defaultValue={category.slug} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea id="cat-description" name="description" rows={3} defaultValue={category.description || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-parent">Parent Category</Label>
              <select
                id="cat-parent"
                name="parentId"
                defaultValue={category.parentId || ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— None —</option>
                {validParents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" render={<Link href="/admin/categories" />}>Cancel</Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
