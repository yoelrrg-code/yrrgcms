import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import ProductsTable from "./ProductsTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default async function ProductsAdminPage() {
  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your digital products, physical items, and online courses.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" /> New Product
          </Button>
        </Link>
      </div>

      <ProductsTable initialProducts={allProducts} />
    </div>
  );
}
