"use client";

import React, { useTransition } from "react";
import { approveOrderAction, rejectOrderAction } from "@/lib/actions/ecommerce";
import type { Order } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
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

interface SalesTableProps {
  sales: Order[];
}

export default function SalesTable({ sales }: SalesTableProps) {
  const [isPending, startTransition] = useTransition();

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
          {sales.map((order) => (
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
