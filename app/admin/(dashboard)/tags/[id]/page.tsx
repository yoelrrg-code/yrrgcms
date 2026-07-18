import { getTagById, updateTag } from "@/lib/actions/tags";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tag = await getTagById(id);

  if (!tag) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/tags" />}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Tag</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update tag details.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Tag Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const name = String(formData.get("name") ?? "").trim();

              if (!name) return;

              await updateTag(tag.id, {
                name,
              });
              
              revalidatePath("/admin/tags");
              redirect("/admin/tags");
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="tag-name">Name *</Label>
              <Input id="tag-name" name="name" defaultValue={tag.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tag-slug">Slug (Cannot be changed)</Label>
              <Input id="tag-slug" defaultValue={tag.slug} disabled />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" render={<Link href="/admin/tags" />}>Cancel</Button>
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
