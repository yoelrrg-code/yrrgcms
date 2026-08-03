import { getAppointments, getServices } from "@/lib/actions/services";
import { ScheduleManager } from "@/components/admin/ScheduleManager";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

export default async function ScheduleAdminPage() {
  const [appointmentsList, servicesList] = await Promise.all([
    getAppointments(),
    getServices(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule & Appointments Panel</h1>
          <p className="text-sm text-muted-foreground">
            Control booked appointments, booking calendar, and onsite payment status.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/admin/schedule/settings" />}>
          <Settings className="mr-2 size-4" /> Calendar & Holiday Settings
        </Button>
      </div>

      <ScheduleManager initialAppointments={appointmentsList} services={servicesList} />
    </div>
  );
}
