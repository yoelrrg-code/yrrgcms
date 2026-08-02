"use client";

import { Service } from "@/lib/db/schema";
import { useState } from "react";
import { updateService, deleteService } from "@/lib/actions/services";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export function ServicesTable({ services: initialServices }: ServicesTableProps) {
  const [search, setSearch] = useState("");

  const filteredServices = initialServices.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
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

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Packs / Subscriptions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-foreground">{service.title}</div>
                        <div className="text-xs text-muted-foreground">/{service.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={service.status === "active" ? "default" : service.status === "draft" ? "outline" : "secondary"}
                        className="cursor-pointer capitalize"
                        onClick={() => handleStatusToggle(service)}
                      >
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.durationMinutes} min (+{service.bufferTimeMinutes}m buffer)</TableCell>
                    <TableCell className="font-semibold">${basePrice.toLocaleString()} {currency}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {packCount} packs | {subCount} subs
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" render={<Link href={`/admin/services/${service.id}`} />}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-destructive">
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
  );
}
