"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit, ShoppingBag } from "lucide-react";
import { deleteProduct } from "@/lib/actions/products";

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  VIRTUAL_COURSE: "Virtual Course",
  DIGITAL_DOWNLOAD: "Digital Download",
  PHYSICAL: "Physical Product",
};


export default function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [productsList, setProductsList] = useState(initialProducts);

  const handleDelete = (id: string, title: string) => {
    sileo.action({
      title: "Delete Product?",
      description: `Are you sure you want to delete "${title}"?`,
      button: {
        title: "Confirm Delete",
        onClick: async () => {
          try {
            await deleteProduct(id);
            setProductsList((prev) => prev.filter((p) => p.id !== id));
            sileo.success({
              title: "Product Deleted",
              description: `Product "${title}" was successfully deleted.`,
            });
          } catch (err) {
            sileo.error({
              title: "Delete Failed",
              description: err instanceof Error ? err.message : "An error occurred.",
            });
          }
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Showing {productsList.length} products</p>

      {/* Desktop table ≥1024px */}
      <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-wider">Product</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Type</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">Price</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No products registered yet. Click &quot;New Product&quot; to get started.
                  </TableCell>
                </TableRow>
              ) : (
                productsList.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition hover:underline"
                      >
                        {product.title}
                      </Link>
                      <div className="text-xs text-slate-500 font-mono">/courses/{product.slug}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      ${product.price.toLocaleString()}{" "}
                      <span className="text-xs font-semibold text-slate-500">{product.currency}</span>
                    </TableCell>
                    <TableCell>
                      {product.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">Published</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Draft</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="ghost" size="sm" className="rounded-xl"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => handleDelete(product.id, product.title)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile cards <1024px */}
      <div className="lg:hidden space-y-3">
        {productsList.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No products registered yet. Click &quot;New Product&quot; to get started.
          </div>
        ) : (
          productsList.map((product) => (
            <div key={product.id} className="rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline truncate block"
                  >
                    {product.title}
                  </Link>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">/courses/{product.slug}</p>
                </div>
                <div className="shrink-0">
                  {product.status === "PUBLISHED" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 whitespace-nowrap">Published</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">Draft</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
                </span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  ${product.price.toLocaleString()} <span className="text-xs font-semibold text-slate-400">{product.currency}</span>
                </span>
              </div>
              <div className="flex gap-2 pt-1 border-t border-border">
                <Link href={`/admin/products/${product.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs rounded-xl text-destructive hover:text-destructive"
                  onClick={() => handleDelete(product.id, product.title)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

  );
}
