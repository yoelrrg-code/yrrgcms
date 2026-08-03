import React from "react";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import SalesTable from "./SalesTable";

export default async function SalesAdminPage() {
  const sales = await db.select().from(orders).orderBy(desc(orders.createdAt));

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
