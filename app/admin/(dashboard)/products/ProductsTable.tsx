"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const PRODUCT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
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
      <p className="text-sm text-muted-foreground">
        Showing {productsList.length} products
      </p>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-bold hover:underline"
                    >
                      {product.title}
                    </Link>
                    <div className="text-xs text-muted-foreground font-mono">/courses/{product.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${product.price.toLocaleString()} {product.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "PUBLISHED" ? "default" : "secondary"}>
                      {PRODUCT_STATUS_LABELS[product.status] ?? product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id, product.title)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
