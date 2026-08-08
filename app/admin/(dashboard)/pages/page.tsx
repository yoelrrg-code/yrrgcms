import Link from "next/link";
import { getPages, deletePage, publishPage, unpublishPage } from "@/lib/actions/pages";
import { Button } from "@/components/ui/button";
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
import { PlusIcon, SquarePen, Trash2, Eye, FileText, CheckCircle2, Globe } from "lucide-react";

export default async function PagesPage() {
  const pages = await getPages();

  const totalPages = pages.length;
  const publishedPages = pages.filter((p) => p.status === "published").length;
  const draftPages = pages.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pages</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your dynamic site pages, layouts, and custom block structures.
          </p>
        </div>
        <Link href="/admin/pages/new">
          <Button className="gap-2 shrink-0 self-start sm:self-auto font-bold rounded-xl shadow-sm">
            <PlusIcon className="h-4 w-4" />
            New Page
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pages</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight">{totalPages}</p>
        </div>

        <div className="bg-card border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Published</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">{publishedPages}</p>
        </div>

        <div className="bg-card border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Drafts</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-300 tracking-tight">{draftPages}</p>
        </div>
      </div>

      {/* Desktop table ≥1024px */}
      <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-wider">Title</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Slug</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">Last Updated</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No pages yet. Create your first page above.
                  </TableCell>
                </TableRow>
              )}
              {pages.map((page) => (
                <TableRow key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                  <TableCell className="font-bold text-slate-900 dark:text-white">{page.title}</TableCell>
                  <TableCell className="text-slate-500 font-mono text-sm">/{page.slug}</TableCell>
                  <TableCell>
                    {page.status === "published" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">Published</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">Draft</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 font-mono whitespace-nowrap">
                    {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {page.status === "draft" ? (
                        <form action={async () => { "use server"; await publishPage(page.id); }}>
                          <Button type="submit" variant="outline" size="sm" className="h-9 px-3 text-xs font-bold rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">Publish</Button>
                        </form>
                      ) : (
                        <form action={async () => { "use server"; await unpublishPage(page.id); }}>
                          <Button type="submit" variant="outline" size="sm" className="h-9 px-3 text-xs font-bold rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">Unpublish</Button>
                        </form>
                      )}

                      {/* Botón Ver Público */}
                      <Link href={page.slug === "home" ? "/" : `/${page.slug}`} target="_blank">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                          title="Ver en la web pública"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </Link>

                      {/* Botón Editar Cuadrado */}
                      <Link href={`/admin/pages/${page.id}`}>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                          title="Editar página"
                        >
                          <SquarePen className="size-4" />
                        </Button>
                      </Link>

                      {/* Botón Eliminar Rojo */}
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              size="icon"
                              className="size-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-xs border border-rose-500/30 transition-colors shrink-0"
                              title="Eliminar página"
                            />
                          }
                        >
                          <Trash2 className="size-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete page?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete &quot;{page.title}&quot;. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <form action={async () => { "use server"; await deletePage(page.id); }}>
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
      </div>

      {/* Mobile cards <1024px */}
      <div className="lg:hidden space-y-3">
        {pages.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            No pages yet. Create your first page above.
          </div>
        )}
        {pages.map((page) => (
          <div key={page.id} className="rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{page.title}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">/{page.slug}</p>
              </div>
              <div className="shrink-0">
                {page.status === "published" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 whitespace-nowrap">Published</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 whitespace-nowrap">Draft</span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
            </p>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              {/* Botón Ver Público */}
              <Link href={page.slug === "home" ? "/" : `/${page.slug}`} target="_blank">
                <Button
                  size="icon"
                  variant="outline"
                  className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                  title="Ver en la web pública"
                >
                  <Eye className="size-4" />
                </Button>
              </Link>

              {/* Botón Editar Cuadrado */}
              <Link href={`/admin/pages/${page.id}`}>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                  title="Editar página"
                >
                  <SquarePen className="size-4" />
                </Button>
              </Link>

              {/* Botón Eliminar Rojo */}
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      size="icon"
                      className="size-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-xs border border-rose-500/30 transition-colors shrink-0"
                      title="Eliminar página"
                    />
                  }
                >
                  <Trash2 className="size-4" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete page?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete &quot;{page.title}&quot;. This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form action={async () => { "use server"; await deletePage(page.id); }}>
                      <AlertDialogAction type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Delete</AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
