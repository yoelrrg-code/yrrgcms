import React from "react";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import SalesTable from "./SalesTable";
import { DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";

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

  const pendingCount = salesOrders.filter((o) => o.status === "PENDING_PAYMENT").length;
  const approvedCount = salesOrders.filter((o) => o.status === "APPROVED").length;
  const rejectedCount = salesOrders.filter((o) => o.status === "REJECTED").length;
  const totalRevenue = salesOrders
    .filter((o) => o.status === "APPROVED")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sales & Payment Receipts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review bank transfer receipts, verify order details, and approve or reject access requests.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Approved Revenue</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight">${totalRevenue.toLocaleString()} USD</p>
        </div>

        <div className="bg-card border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pending Verification</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-300 tracking-tight">{pendingCount}</p>
        </div>

        <div className="bg-card border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Approved Orders</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">{approvedCount}</p>
        </div>

        <div className="bg-card border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Rejected Orders</span>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-800 dark:text-rose-300 tracking-tight">{rejectedCount}</p>
        </div>
      </div>

      <SalesTable sales={sales} />
    </div>
  );
}
