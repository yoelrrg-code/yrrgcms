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
import { Edit, Trash2, Plus, ListTree } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Menus | yrrgCMS",
};

export default async function MenusPage() {
  const session = await auth();
  requireCan(session, "manage", "menus");

  const menus = await getMenus();

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const location = formData.get("location") as any;
    if (name && location) {
      const newMenu = await createMenu({ name, location });
      redirect(`/menus/${newMenu.id}`);
    }
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteMenu(id);
      revalidatePath("/menus");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Menus</h1>
        <form action={handleCreate} className="flex gap-2 items-center">
          <input
            type="text"
            name="name"
            placeholder="Menu name..."
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <select
            name="location"
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="header">Header</option>
            <option value="footer">Footer</option>
            <option value="sidebar">Sidebar</option>
          </select>
          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" /> Create Menu
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No menus found. Create one above.
                </TableCell>
              </TableRow>
            ) : (
              menus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{menu.location}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" >
                        <Link href={`/menus/${menu.id}`} title="Edit Items">
                          <ListTree className="mr-2 h-4 w-4" /> Edit Items
                        </Link>
                      </Button>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={menu.id} />
                        <Button variant="destructive" size="icon" type="submit" title="Delete Menu">
                          <Trash2 className="h-4 w-4" />
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
  );
}
