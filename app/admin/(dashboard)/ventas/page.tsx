import React from "react";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import SalesTable from "./SalesTable";

export default async function SalesAdminPage() {
  const salesOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

  const sales = await Promise.all(
    salesOrders.map(async (order) => {
      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          productTitle: products.title,
          productSlug: products.slug,
          productType: products.type,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        items,
      };
    })
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales & Payment Receipts</h1>
          <p className="text-sm text-slate-500">Review orders received via bank transfer and approve or reject access requests.</p>
        </div>
      </div>

      <SalesTable sales={sales} />
    </div>
  );
}
