"use client";

import { Service } from "@/lib/db/schema";
import { useState } from "react";
import { updateService, deleteService } from "@/lib/actions/services";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { sileo } from "sileo";

interface ServicePricing {
  singleSession?: {
    durationMinutes?: number;
    price?: number;
    currency?: string;
  };
  packs?: unknown[];
  subscriptions?: unknown[];
}

interface ServicesTableProps {
  services: Service[];
}

export function ServicesTable({ services: initialServices = [] }: ServicesTableProps) {
  const [search, setSearch] = useState("");

  const safeServices = Array.isArray(initialServices) ? initialServices : [];
  const filteredServices = safeServices.filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusToggle = async (service: Service) => {
    const nextStatus = service.status === "active" ? "inactive" : "active";
    await updateService(service.id, { status: nextStatus });
    window.location.reload();
  };

  const handleDelete = (id: string) => {
    sileo.action({
      title: "Delete Service?",
      description: "Are you sure you want to permanently delete this service?",
      button: {
        title: "Confirm Delete",
        onClick: async () => {
          const res = await deleteService(id);
          if (res.success) {
            sileo.success({ title: "Service Deleted", description: "The service was removed successfully." });
            window.location.reload();
          } else {
            sileo.error({ title: "Error", description: res.error || "Failed to delete service." });
          }
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Desktop table >=1024px */}
      <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-xs uppercase tracking-wider">Service</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Duration</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Base Price</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Packs / Subscriptions</TableHead>
              <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No services found.
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => {
                const pricing = service.pricingOptions as ServicePricing | null | undefined;
                const basePrice = pricing?.singleSession?.price ?? 0;
                const currency = pricing?.singleSession?.currency ?? "USD";
                const packCount = pricing?.packs?.length ?? 0;
                const subCount = pricing?.subscriptions?.length ?? 0;

                return (
                  <TableRow key={service.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{service.title}</div>
                        <div className="text-xs text-slate-500 font-mono">/{service.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.status === "active" ? (
                        <span
                          onClick={() => handleStatusToggle(service)}
                          className="inline-flex items-center cursor-pointer px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          onClick={() => handleStatusToggle(service)}
                          className="inline-flex items-center cursor-pointer px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                        >
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{service.durationMinutes} min <span className="text-xs text-slate-400">(+{service.bufferTimeMinutes}m buffer)</span></TableCell>
                    <TableCell className="font-extrabold text-slate-900 dark:text-white">${basePrice.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{currency}</span></TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {packCount} packs | {subCount} subs
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" className="rounded-xl" render={<Link href={`/admin/services/${service.id}`} />}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-destructive rounded-xl">
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Mobile cards <1024px */}
      <div className="lg:hidden space-y-3">
        {filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            No services found.
          </div>
        ) : (
          filteredServices.map((service) => {
            const pricing = service.pricingOptions as ServicePricing | null | undefined;
            const basePrice = pricing?.singleSession?.price ?? 0;
            const currency = pricing?.singleSession?.currency ?? "USD";
            const packCount = pricing?.packs?.length ?? 0;
            const subCount = pricing?.subscriptions?.length ?? 0;

            return (
              <div key={service.id} className="rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{service.title}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">/{service.slug}</p>
                  </div>
                  <div className="shrink-0">
                    {service.status === "active" ? (
                      <span
                        onClick={() => handleStatusToggle(service)}
                        className="inline-flex items-center cursor-pointer px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 whitespace-nowrap"
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        onClick={() => handleStatusToggle(service)}
                        className="inline-flex items-center cursor-pointer px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 whitespace-nowrap"
                      >
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">${basePrice.toLocaleString()} {currency}</span>
                    <span className="ml-2 font-medium">({service.durationMinutes}m)</span>
                  </div>
                  <div className="text-slate-400">
                    {packCount} packs | {subCount} subs
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Link href={`/admin/services/${service.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="flex-1 text-xs text-destructive hover:text-destructive rounded-xl"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
