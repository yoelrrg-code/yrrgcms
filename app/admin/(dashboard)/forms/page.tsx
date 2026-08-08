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
import { SquarePen, Eye, Trash2, Plus } from "lucide-react";
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
          <Button type="submit" className="font-bold rounded-xl shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Create Form
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-wider">Name</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Fields</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Submissions</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Last Submitted</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No forms found. Create one above.
                  </TableCell>
                </TableRow>
              ) : (
                formsData.map((form) => {
                  const fieldsArr = (form.fields as unknown[]) || [];
                  return (
                    <TableRow key={form.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                      <TableCell className="font-bold text-slate-900 dark:text-white">{form.name}</TableCell>
                      <TableCell className="text-sm font-medium">{fieldsArr.length}</TableCell>
                      <TableCell className="text-sm font-medium">{form.submissionsCount}</TableCell>
                      <TableCell className="text-sm text-slate-500 font-mono">
                        {form.lastSubmitted
                          ? new Date(form.lastSubmitted).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Botón Ver Envíos */}
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                            render={<Link href={`/admin/forms/${form.id}/submissions`} />}
                            title="Ver envíos"
                          >
                            <Eye className="size-4" />
                          </Button>

                          {/* Botón Editar Formulario */}
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                            render={<Link href={`/admin/forms/${form.id}`} />}
                            title="Editar formulario"
                          >
                            <SquarePen className="size-4" />
                          </Button>

                          {/* Botón Eliminar Formulario Rojo */}
                          <form action={handleDelete}>
                            <input type="hidden" name="id" value={form.id} />
                            <Button
                              size="icon"
                              type="submit"
                              className="size-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-xs border border-rose-500/30 transition-colors shrink-0"
                              title="Eliminar formulario"
                            >
                              <Trash2 className="size-4" />
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
    </div>
  );
}
