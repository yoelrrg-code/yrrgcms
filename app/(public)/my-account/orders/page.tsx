import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, orderItems, products, users } from "@/lib/db/schema";
import { eq, desc, or, ilike } from "drizzle-orm";
import Link from "next/link";
import { ShoppingBag, Download, Truck, CheckCircle2, Clock, XCircle, ExternalLink, Package } from "lucide-react";
import { AccountBreadcrumbs } from "@/components/AccountBreadcrumbs";

export const metadata = {
  title: "My Orders & Downloads | My Account",
};

export default async function MyOrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login?callbackUrl=/my-account/orders");
  }

  // Fetch current logged in user to get full email
  const [currentUser] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session.user.id));

  const userEmail = currentUser?.email || session.user.email || "";

  // Fetch orders linked to user ID or email address
  const userOrders = await db
    .select()
    .from(orders)
    .where(
      or(
        eq(orders.userId, session.user.id),
        userEmail ? ilike(orders.customerEmail, userEmail.trim().toLowerCase()) : undefined
      )
    )
    .orderBy(desc(orders.createdAt));

  // Build full order items with product details
  const ordersWithItems = await Promise.all(
    userOrders.map(async (order) => {
      const items = await db
        .select({
          itemId: orderItems.id,
          productId: products.id,
          priceAtPurchase: orderItems.priceAtPurchase,
          title: products.title,
          slug: products.slug,
          type: products.type,
          imageUrl: products.imageUrl,
          downloadUrl: products.downloadUrl,
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
    <div className="container max-w-5xl mx-auto py-10 px-4 space-y-8">
      <AccountBreadcrumbs />

      <div data-aos="fade-down">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--theme-h1-color, var(--theme-text, inherit))" }}>My Purchased Products & Orders</h1>
        <p className="text-sm mt-1" style={{ color: "var(--theme-p-color, inherit)" }}>
          Review your order history, download digital assets, and track shipping details.
        </p>
      </div>

      {ordersWithItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-4" data-aos="zoom-in">
          <ShoppingBag className="h-12 w-12 mx-auto text-slate-400 opacity-60" />
          <h3 className="text-lg font-bold" style={{ color: "var(--theme-h3-color, var(--theme-text, inherit))" }}>
            No Orders Found
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--theme-p-color, inherit)" }}>
            You haven&apos;t placed any orders yet. Explore our catalog to buy digital or physical products.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl transition hover:opacity-90"
            style={{
              backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
              color: "var(--theme-button-text, #ffffff)",
              borderRadius: "var(--theme-button-radius, 0.75rem)",
            }}
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {ordersWithItems.map((order) => {
            const isApproved = order.status === "APPROVED";
            const isPending = order.status === "PENDING_PAYMENT";
            const isRejected = order.status === "REJECTED";

            return (
              <div
                key={order.id}
                data-aos="fade-up"
                className="bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs opacity-70 block font-medium" style={{ color: "var(--theme-p-color, inherit)" }}>Order Number</span>
                    <span className="text-lg font-extrabold" style={{ color: "var(--theme-text, inherit)" }}>
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs opacity-60 ml-3" style={{ color: "var(--theme-p-color, inherit)" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold" style={{ color: "var(--theme-text, inherit)" }}>
                      ${order.totalAmount.toLocaleString()} {order.currency}
                    </span>

                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Pending Payment Verification
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Shipping Address info if physical */}
                {order.shippingAddress && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-xs flex items-start gap-3" style={{ color: "var(--theme-p-color, inherit)" }}>
                    <Truck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--theme-primary, #4f46e5)" }} />
                    <div>
                      <span className="font-bold block mb-0.5" style={{ color: "var(--theme-text, inherit)" }}>Shipping Destination:</span>
                      <p className="whitespace-pre-line">{order.shippingAddress}</p>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80"
                    >
                      <div className="flex items-center gap-4">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title || "Product"}
                            className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <h4 className="font-bold text-base" style={{ color: "var(--theme-text, inherit)" }}>
                            {item.title}
                          </h4>
                          <span 
                            className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md text-white"
                            style={{ backgroundColor: "var(--theme-primary, #4f46e5)" }}
                          >
                            {item.type === "VIRTUAL_COURSE"
                              ? "Virtual Course"
                              : item.type === "DIGITAL_DOWNLOAD"
                              ? "Digital Download"
                              : item.type === "PHYSICAL"
                              ? "Physical Product"
                              : item.type}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons based on Product Type and Order Status */}
                      <div className="sm:text-right shrink-0">
                        {isApproved ? (
                          item.type === "DIGITAL_DOWNLOAD" ? (
                            item.downloadUrl ? (
                              <a
                                href={item.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl transition hover:opacity-50"
                                style={{
                                  backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
                                  color: "var(--theme-button-text, #ffffff)",
                                  borderRadius: "var(--theme-button-radius, 0.75rem)",
                                }}
                              >
                                <Download className="w-4 h-4" /> Download Product
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No file URL configured</span>
                            )
                          ) : item.type === "VIRTUAL_COURSE" ? (
                            <Link
                              href={`/my-account/courses/${item.slug}`}
                              className="inline-flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl transition hover:opacity-50"
                              style={{
                                backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
                                color: "var(--theme-button-text, #ffffff)",
                                borderRadius: "var(--theme-button-radius, 0.75rem)",
                              }}
                            >
                              <ExternalLink className="w-4 h-4" /> Go to Course
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <Truck className="w-4 h-4" /> Confirmed for Shipping
                            </span>
                          )
                        ) : (
                          <span className="text-xs opacity-60 italic" style={{ color: "var(--theme-p-color, inherit)" }}>
                            {isPending ? "Unlocks after payment verification" : "Order rejected"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
