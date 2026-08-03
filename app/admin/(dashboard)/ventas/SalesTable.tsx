"use client";

import React, { useTransition, useState } from "react";
import { approveOrderAction, rejectOrderAction } from "@/lib/actions/ecommerce";
import type { Order } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";
import { Eye, ExternalLink } from "lucide-react";
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

interface SalesTableProps {
  sales: OrderWithItems[];
}

export default function SalesTable({ sales }: SalesTableProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

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
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((order) => {
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-bold text-primary">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                  </TableCell>
                  <TableCell className="font-bold">
                    ${(order.totalAmount / 100).toFixed(2)} {order.currency}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "APPROVED"
                          ? "default"
                          : order.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.proofOfPaymentUrl ? (
                      <a
                        href={order.proofOfPaymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-medium text-xs"
                      >
                        View Receipt ↗
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">No attachment</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {order.status === "PENDING_PAYMENT" && (
                      <>
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => triggerApproveConfirmation(order.id, order.customerName)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Approve Payment
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isPending}
                          onClick={() => triggerRejectConfirmation(order.id, order.customerName)}
                          className="text-xs font-bold"
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-bold gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Order Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
                    ${(selectedOrder.totalAmount / 100).toFixed(2)} {selectedOrder.currency}
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
