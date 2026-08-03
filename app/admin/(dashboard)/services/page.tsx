import { getServices } from "@/lib/actions/services";
import { ServicesTable } from "@/components/admin/ServicesTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ServicesAdminPage() {
  const servicesList = await getServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage offered services, pricing, modalities (sessions, packs, subscriptions), and status.
          </p>
        </div>
        <Button render={<Link href="/admin/services/new" />}>
          <Plus className="mr-2 size-4" /> New Service
        </Button>
      </div>

      <ServicesTable services={servicesList} />
    </div>
  );
}
