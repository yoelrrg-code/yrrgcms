"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { approveOrderAction, rejectOrderAction } from "@/lib/actions/ecommerce";
import type { Order } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";
import { Eye, ExternalLink, CheckCircle2, XCircle, Clock, FileCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface OrderWithItems extends Order {
  items?: Array<{
    id: string;
    productId: string;
    productTitle: string | null;
    productSlug: string | null;
    productType: string | null;
  }>;
}

// ── Shared sub-components (used in both desktop table and mobile cards) ───────

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </span>
    );
  if (status === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5" /> Pending Payment
    </span>
  );
}

function ReceiptLink({ url }: { url: string | null }) {
  if (!url) return <span className="text-xs text-slate-400 italic">No attachment</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition whitespace-nowrap"
    >
      <FileCheck className="w-3.5 h-3.5" /> View Receipt
    </a>
  );
}

interface ActionButtonsProps {
  order: OrderWithItems;
  isPending: boolean;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  onDetails: (order: OrderWithItems) => void;
  fullWidth?: boolean;
}

function ActionButtons({ order, isPending, onApprove, onReject, onDetails, fullWidth }: ActionButtonsProps) {
  const btnBase = fullWidth ? "flex-1 justify-center" : "";
  return (
    <>
      {order.status === "PENDING_PAYMENT" && (
        <>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => onApprove(order.id, order.customerName)}
            className={`bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm rounded-xl ${btnBase}`}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => onReject(order.id, order.customerName)}
            className={`text-xs font-bold rounded-xl ${btnBase}`}
          >
            Reject
          </Button>
        </>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDetails(order)}
        className={`text-xs font-bold gap-1.5 rounded-xl border-slate-200 dark:border-slate-800 ${btnBase}`}
      >
        <Eye className="w-3.5 h-3.5" />
        Details
      </Button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface SalesTableProps {
  sales: OrderWithItems[];
}

export default function SalesTable({ sales }: SalesTableProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const router = useRouter();

  // Auto-refresh sales data and KPI counters every 10 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  function triggerApproveConfirmation(orderId: string, customerName: string) {
    sileo.action({
      title: "Approve Order?",
      description: `Approve order for ${customerName} and automatically grant course access?`,
      button: {
        title: "Approve & Grant Access",
        onClick: () => {
          startTransition(async () => {
            try {
              await approveOrderAction(orderId);
              router.refresh();
              sileo.success({
                title: "Order Approved",
                description: "Course access has been granted to the customer.",
              });
            } catch (err) {
              sileo.error({
                title: "Approval Failed",
                description: err instanceof Error ? err.message : "An error occurred.",
              });
            }
          });
        },
      },
    });
  }

  function triggerRejectConfirmation(orderId: string, customerName: string) {
    sileo.action({
      title: "Reject Order?",
      description: `Are you sure you want to reject payment for ${customerName}?`,
      button: {
        title: "Reject Order",
        onClick: () => {
          startTransition(async () => {
            try {
              await rejectOrderAction(orderId);
              router.refresh();
              sileo.info({
                title: "Order Rejected",
                description: "The payment order has been rejected.",
              });
            } catch (err) {
              sileo.error({
                title: "Rejection Failed",
                description: err instanceof Error ? err.message : "An error occurred.",
              });
            }
          });
        },
      },
    });
  }

  if (sales.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-8 text-center text-muted-foreground">
        No sales orders received yet.
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop table ── */}
      <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">Order ID</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">Amount</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Receipt</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                  <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs whitespace-nowrap">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{order.customerName}</div>
                    <div className="text-xs text-slate-500 font-mono">{order.customerEmail}</div>
                  </TableCell>
                  <TableCell className="font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                    ${order.totalAmount.toLocaleString()}{" "}
                    <span className="text-xs font-semibold text-slate-500">{order.currency}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <ReceiptLink url={order.proofOfPaymentUrl} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ActionButtons
                        order={order}
                        isPending={isPending}
                        onApprove={triggerApproveConfirmation}
                        onReject={triggerRejectConfirmation}
                        onDetails={setSelectedOrder}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <div className="lg:hidden space-y-3">
        {sales.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  #{order.id.slice(0, 8)}
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {order.customerName}
                </p>
                <p className="text-xs text-slate-500 font-mono">{order.customerEmail}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-extrabold text-base text-slate-900 dark:text-white">
                  ${order.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">{order.currency}</p>
              </div>
            </div>

            {/* Status + Receipt */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={order.status} />
              <ReceiptLink url={order.proofOfPaymentUrl} />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              <ActionButtons
                order={order}
                isPending={isPending}
                onApprove={triggerApproveConfirmation}
                onReject={triggerRejectConfirmation}
                onDetails={setSelectedOrder}
                fullWidth
              />
            </div>
          </div>
        ))}
      </div>


      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>
              Detailed information about the purchase order and product.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-bold text-foreground">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono text-foreground">{selectedOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      selectedOrder.status === "APPROVED"
                        ? "default"
                        : selectedOrder.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    ${selectedOrder.totalAmount.toLocaleString()} {selectedOrder.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold text-foreground">{selectedOrder.paymentMethod || "Bank Transfer"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Purchased Product / Course
                </h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs"
                      >
                        <div>
                          <p className="font-bold text-sm text-foreground">{item.productTitle || "Untitled Product"}</p>
                          <p className="text-muted-foreground capitalize">{item.productType?.toLowerCase() || "Digital Product"}</p>
                        </div>
                        {item.productId && (
                          <a
                            href={`/admin/products/${item.productId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                          >
                            View Product <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No items found for this order.</p>
                )}
              </div>

              {selectedOrder.proofOfPaymentUrl && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Proof of Payment
                  </h4>
                  <a
                    href={selectedOrder.proofOfPaymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                  >
                    View attached receipt <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
