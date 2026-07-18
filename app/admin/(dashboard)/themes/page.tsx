import { getThemes, createTheme, deleteTheme, setActiveTheme } from "@/lib/actions/themes";
import { Button, buttonVariants } from "@/components/ui/button";
import { ImportThemeButton } from "@/components/admin/ImportThemeButton";
import { ExportThemeButton } from "@/components/admin/ExportThemeButton";
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
import { PlusIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function ThemesPage() {
  const themesList = await getThemes();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Themes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the visual appearance of your public site.
          </p>
        </div>
        <ImportThemeButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Themes table */}
        <div className="lg:col-span-2 rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {themesList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No themes found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
              {themesList.map((theme) => (
                <TableRow key={theme.id}>
                  <TableCell className="font-medium">{theme.name}</TableCell>
                  <TableCell>
                    {theme.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!theme.isActive && (
                        <form
                          action={async () => {
                            "use server";
                            await setActiveTheme(theme.id);
                          }}
                        >
                          <Button type="submit" variant="outline" size="sm" className="gap-1">
                            <CheckIcon className="w-3 h-3" />
                            Activate
                          </Button>
                        </form>
                      )}
                      <ExportThemeButton theme={theme} />
                      <Link href={`/admin/themes/${theme.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Edit
                      </Link>
                      {!theme.isActive && (
                        <AlertDialog>
                          <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                            Delete
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the theme &quot;{theme.name}&quot;.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <form
                                action={async () => {
                                  "use server";
                                  await deleteTheme(theme.id);
                                }}
                              >
                                <AlertDialogAction type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </form>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Create theme form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add New Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData) => {
                  "use server";
                  const name = formData.get("name") as string;
                  if (!name) return;

                  const slug = toSlug(name);
                  
                  const defaultConfig = {
                    colors: {
                      primary: "#000000",
                      background: "#ffffff",
                      text: "#1a1a1a",
                    },
                  };

                  await createTheme({ name, slug, config: defaultConfig });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Theme Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. Dark Mode"
                    required
                  />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Create Theme
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
