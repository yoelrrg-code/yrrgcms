import { auth } from "@/lib/auth";
import { requireCan } from "@/lib/permissions";
import { db } from "@/lib/db";
import { forms, formSubmissions } from "@/lib/db/schema";
import { desc, eq, count, max } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash2, Plus } from "lucide-react";
import { deleteForm } from "@/lib/actions/forms";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Forms | YRRG CMS",
};

export default async function FormsPage() {
  const session = await auth();
  requireCan(session, "manage", "forms");

  const formsData = await db
    .select({
      id: forms.id,
      name: forms.name,
      fields: forms.fields,
      submissionsCount: count(formSubmissions.id),
      lastSubmitted: max(formSubmissions.submittedAt),
    })
    .from(forms)
    .leftJoin(formSubmissions, eq(forms.id, formSubmissions.formId))
    .groupBy(forms.id)
    .orderBy(desc(forms.createdAt));

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteForm(id);
      revalidatePath("/admin/forms");
    }
  }

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (name) {
      const { createForm } = await import("@/lib/actions/forms");
      const newForm = await createForm({ name, fields: [] });
      redirect(`/admin/forms/${newForm.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
        <form action={handleCreate} className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="New form name..."
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" /> Create Form
          </Button>
        </form>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Last Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No forms found. Create one above.
                </TableCell>
              </TableRow>
            ) : (
              formsData.map((form) => {
                const fieldsArr = (form.fields as unknown[]) || [];
                return (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.name}</TableCell>
                    <TableCell>{fieldsArr.length}</TableCell>
                    <TableCell>{form.submissionsCount}</TableCell>
                    <TableCell>
                      {form.lastSubmitted
                        ? new Date(form.lastSubmitted).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" render={<Link href={`/admin/forms/${form.id}/submissions`} title="View Submissions" />}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" render={<Link href={`/admin/forms/${form.id}`} title="Edit Form" />}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={form.id} />
                          <Button variant="destructive" size="icon" type="submit" title="Delete Form">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
