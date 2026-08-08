import { auth } from "@/lib/auth";
import { requireCan } from "@/lib/permissions";
import { getMenus, createMenu, deleteMenu } from "@/lib/actions/menus";
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
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ListTree } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Menus | YRRG CMS",
};

export default async function MenusPage() {
  const session = await auth();
  requireCan(session, "manage", "menus");

  const menus = await getMenus();

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const location = formData.get("location") as "header" | "footer" | "sidebar";
    if (name && location) {
      const newMenu = await createMenu({ name, location });
      redirect(`/admin/menus/${newMenu.id}`);
    }
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteMenu(id);
      revalidatePath("/admin/menus");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Menus</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage navigation menus for your website.
          </p>
        </div>
        <form action={handleCreate} className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            name="name"
            placeholder="Menu name..."
            required
            className="flex h-9 rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <select
            name="location"
            required
            className="flex h-9 rounded-xl border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
          >
            <option value="header">Header</option>
            <option value="footer">Footer</option>
            <option value="sidebar">Sidebar</option>
          </select>
          <Button type="submit" className="gap-2 font-bold rounded-xl shadow-sm">
            <Plus className="h-4 w-4" /> Create Menu
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-wider">Name</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Location</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                    No menus found. Create one above.
                  </TableCell>
                </TableRow>
              ) : (
                menus.map((menu) => (
                  <TableRow key={menu.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                    <TableCell className="font-bold text-foreground">{menu.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize font-bold rounded-lg px-2.5 py-0.5">
                        {menu.location}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/menus/${menu.id}`}>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                            title="Editar items del menú"
                          >
                            <ListTree className="size-4" />
                          </Button>
                        </Link>
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={menu.id} />
                          <Button
                            size="icon"
                            type="submit"
                            className="size-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-xs border border-rose-500/30 transition-colors"
                            title="Eliminar menú"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
