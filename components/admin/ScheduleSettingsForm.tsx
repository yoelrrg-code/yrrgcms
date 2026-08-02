"use client";

import { useState } from "react";
import { saveAvailabilitySettings } from "@/lib/actions/services";
import { AvailabilitySetting } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";
import { sileo } from "sileo";
import DatePicker from "@/components/ui/date-picker";

import TimePicker from "@/components/ui/time-picker";

interface ScheduleSettingsFormProps {
  initialSettings: AvailabilitySetting | null;
}

const COUNTRIES = [
  { code: "CL", name: "Chile" },
  { code: "MX", name: "Mexico" },
  { code: "US", name: "United States" },
  { code: "ES", name: "Spain" },
  { code: "UY", name: "Uruguay" },
];

export function ScheduleSettingsForm({ initialSettings }: ScheduleSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [allowWeekends, setAllowWeekends] = useState(initialSettings?.allowWeekends ?? false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    (initialSettings?.countryHolidays as string[]) || ["CL"]
  );

  const [workStartHour, setWorkStartHour] = useState<string>(initialSettings?.workStartHour || "");
  const [workEndHour, setWorkEndHour] = useState<string>(initialSettings?.workEndHour || "");

  const [customDisabledDates, setCustomDisabledDates] = useState<string[]>(
    Array.isArray(initialSettings?.customDisabledDates) ? (initialSettings.customDisabledDates as string[]) : []
  );
  const [newDisabledDate, setNewDisabledDate] = useState("");

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== code));
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  const handleAddDisabledDate = () => {
    if (newDisabledDate && !customDisabledDates.includes(newDisabledDate)) {
      setCustomDisabledDates([...customDisabledDates, newDisabledDate].sort());
      setNewDisabledDate("");
    }
  };

  const handleRemoveDisabledDate = (dateStr: string) => {
    setCustomDisabledDates(customDisabledDates.filter((d) => d !== dateStr));
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await saveAvailabilitySettings({
      id: initialSettings?.id,
      allowWeekends,
      countryHolidays: selectedCountries,
      customDisabledDates,
      workStartHour: workStartHour || null,
      workEndHour: workEndHour || null,
    });
    setLoading(false);
    if (res.success) {
      sileo.success({ title: "Calendar Settings", description: "Calendar availability rules saved successfully." });
    } else {
      sileo.error({ title: "Error", description: res.error || "Failed to save settings." });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/schedule" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-bold">Global Availability Rules</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Working Hours Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Specify start and end hours available for bookings. Leave empty to allow any time:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Start Time</Label>
                {workStartHour && (
                  <button
                    type="button"
                    onClick={() => setWorkStartHour("")}
                    className="text-[11px] text-muted-foreground hover:text-destructive underline"
                  >
                    Clear (Any time)
                  </button>
                )}
              </div>
              <TimePicker
                value={workStartHour}
                onChange={(val) => setWorkStartHour(val)}
                placeholder="No start restriction"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">End Time</Label>
                {workEndHour && (
                  <button
                    type="button"
                    onClick={() => setWorkEndHour("")}
                    className="text-[11px] text-muted-foreground hover:text-destructive underline"
                  >
                    Clear (Any time)
                  </button>
                )}
              </div>
              <TimePicker
                value={workEndHour}
                onChange={(val) => setWorkEndHour(val)}
                placeholder="No end restriction"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekend Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="allowWeekends"
              checked={allowWeekends}
              onCheckedChange={(checked: boolean) => setAllowWeekends(!!checked)}
            />
            <Label htmlFor="allowWeekends" className="font-medium cursor-pointer">
              Enable booking on weekends (Saturdays and Sundays)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Official Holidays Blocking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select countries to automatically block national official holidays on the calendar:
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {COUNTRIES.map((country) => (
              <div key={country.code} className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20">
                <Checkbox
                  id={`country-${country.code}`}
                  checked={selectedCountries.includes(country.code)}
                  onCheckedChange={() => toggleCountry(country.code)}
                />
                <Label htmlFor={`country-${country.code}`} className="cursor-pointer font-medium">
                  {country.name} ({country.code})
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specific Disabled Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select specific dates to disable on the booking calendar (e.g. vacations, personal days, special closures):
          </p>
          
          <div className="flex items-center gap-3">
            <div className="w-64">
              <DatePicker
                value={newDisabledDate}
                onChange={(val) => setNewDisabledDate(val)}
                placeholder="Select date to block"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddDisabledDate}
              disabled={!newDisabledDate}
              variant="secondary"
            >
              <Plus className="mr-2 size-4" /> Block Date
            </Button>
          </div>

          {customDisabledDates.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {customDisabledDates.map((dateStr) => (
                <div
                  key={dateStr}
                  className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs font-semibold border"
                >
                  <span>{dateStr}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDisabledDate(dateStr)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" render={<Link href="/admin/schedule" />}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 size-4" /> {loading ? "Saving..." : "Save Rules"}
        </Button>
      </div>
    </div>
  );
}
