import { getAvailabilitySettings } from "@/lib/actions/services";
import { ScheduleSettingsForm } from "@/components/admin/ScheduleSettingsForm";

export default async function ScheduleSettingsPage() {
  const settings = await getAvailabilitySettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar & Holiday Settings</h1>
        <p className="text-sm text-muted-foreground">
          Define general working rules, enable weekend bookings, and select countries to automatically block national holidays.
        </p>
      </div>

      <ScheduleSettingsForm initialSettings={settings} />
    </div>
  );
}
