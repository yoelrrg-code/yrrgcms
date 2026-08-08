import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import ProductsTable from "./ProductsTable";
import { Button } from "@/components/ui/button";
import { PlusIcon, ShoppingBag, CheckCircle2, FileText, GraduationCap } from "lucide-react";

export default async function ProductsAdminPage() {
  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));

  const totalCount = allProducts.length;
  const publishedCount = allProducts.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = allProducts.filter((p) => p.status === "DRAFT").length;
  const courseCount = allProducts.filter((p) => p.type === "VIRTUAL_COURSE").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Product Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your digital products, physical items, and online courses.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 shrink-0 self-start sm:self-auto font-bold rounded-xl shadow-sm">
            <PlusIcon className="h-4 w-4" /> New Product
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Products</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground tracking-tight">{totalCount}</p>
        </div>

        <div className="bg-card border border-emerald-500/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Published</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground tracking-tight">{publishedCount}</p>
        </div>

        <div className="bg-card border border-amber-500/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Drafts</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground tracking-tight">{draftCount}</p>
        </div>

        <div className="bg-card border border-purple-500/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">LMS Courses</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground tracking-tight">{courseCount}</p>
        </div>
      </div>

      <ProductsTable initialProducts={allProducts} />
    </div>
  );
}
