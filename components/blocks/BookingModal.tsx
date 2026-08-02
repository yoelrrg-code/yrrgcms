"use client";

import { useEffect, useState } from "react";
import { Service, NewAppointment, AvailabilitySetting } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/time-picker";
import { createAppointment, getAvailabilitySettings } from "@/lib/actions/services";
import { sileo } from "sileo";

interface SingleSessionOption {
  price?: number;
  durationMinutes?: number;
  currency?: string;
  [key: string]: unknown;
}

interface PackOption {
  id?: string;
  name?: string;
  sessionsCount?: number;
  price?: number;
  currency?: string;
  [key: string]: unknown;
}

interface SubscriptionOption {
  id?: string;
  name?: string;
  monthlyPrice?: number;
  currency?: string;
  sessionsPerMonth?: number;
  [key: string]: unknown;
}

interface PricingOptions {
  singleSession?: SingleSessionOption;
  packs?: PackOption[];
  subscriptions?: SubscriptionOption[];
  [key: string]: unknown;
}

interface BookingModalProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingModal({ service, open, onOpenChange }: BookingModalProps) {
  const pricing = (service.pricingOptions as PricingOptions) || {};
  const singleSession = pricing.singleSession || { price: 30, durationMinutes: 45, currency: "USD" };
  const packs = pricing.packs || [];
  const subscriptions = pricing.subscriptions || [];

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<"single" | "pack" | "subscription">("single");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("base");
  const [selectedOptionDetails, setSelectedOptionDetails] = useState<SingleSessionOption | PackOption | SubscriptionOption>(singleSession);

  // Availability Settings
  const [availabilityRules, setAvailabilityRules] = useState<(AvailabilitySetting & { customDisabledDates?: string[] }) | null>(null);

  useEffect(() => {
    if (open) {
      getAvailabilitySettings(service.id).then((res) => {
        if (res) {
          setAvailabilityRules(res as AvailabilitySetting & { customDisabledDates?: string[] });
        }
      });
    }
  }, [open, service.id]);

  // Selected Date and Time (Step 1)
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>("11:00");
  const [selectedSlot, setSelectedSlot] = useState<string>("11:00am - 11:45am");

  // Customer Form (Step 2)
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [prepaidMonths, setPrepaidMonths] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  // Available slots example
  const availableSlots = [
    "9:00am - 9:45am",
    "11:00am - 11:45am",
    "4:00pm - 4:45pm",
    "7:00pm - 7:45pm",
    "8:00pm - 8:45pm",
  ];

  const handleSelectSingle = () => {
    setSelectedType("single");
    setSelectedOptionId("base");
    setSelectedOptionDetails(singleSession);
  };

  const handleSelectPack = (pack: PackOption) => {
    setSelectedType("pack");
    setSelectedOptionId(pack.id || "");
    setSelectedOptionDetails(pack);
  };

  const handleSelectSub = (sub: SubscriptionOption) => {
    setSelectedType("subscription");
    setSelectedOptionId(sub.id || "");
    setSelectedOptionDetails(sub);
  };

  const calculateTotalAmount = (): number => {
    if (selectedType === "single") return Number(singleSession.price ?? 0);
    if (selectedType === "pack") {
      const details = selectedOptionDetails as PackOption;
      return Number(details.totalPrice ?? details.price ?? 0);
    }
    if (selectedType === "subscription") {
      const details = selectedOptionDetails as SubscriptionOption;
      const basePrice = Number(details.monthlyPrice ?? details.price ?? 0);
      if (prepaidMonths === 6) return basePrice * 6 * 0.9;
      if (prepaidMonths === 12) return basePrice * 12 * 0.85;
      return basePrice;
    }
    return 0;
  };

  const getSessionsList = () => {
    // Standardize time format (selectedTime is "HH:mm" e.g. "11:00")
    const timePart = selectedTime.includes(":") ? selectedTime : "09:00";
    const baseDate = selectedDate ? new Date(`${selectedDate}T${timePart}:00`) : new Date();

    if (selectedType === "single") {
      return [{ sessionIndex: 1, date: baseDate.toISOString() }];
    }

    const details = selectedOptionDetails as (PackOption & SubscriptionOption);
    const count = Number(details.sessionsCount ?? details.sessionsPerMonth ?? 3);
    const list = [];

    for (let i = 0; i < count; i++) {
      const nextDate = new Date(baseDate);
      nextDate.setDate(nextDate.getDate() + i * 7); // Schedule weekly sessions
      list.push({
        sessionIndex: i + 1,
        date: nextDate.toISOString(),
      });
    }
    return list;
  };

  const handleConfirmStep1 = () => {
    setStep(2);
  };

  const handleFinalBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      serviceId: service.id,
      customerName,
      customerEmail,
      customerPhone,
      bookingType: selectedType,
      selectedPricingOptionId: selectedOptionId,
      status: "confirmed" as const,
      paymentStatus: "pending_onsite" as const,
      totalAmount: calculateTotalAmount(),
      currency: singleSession.currency || "USD",
      sessionsDates: getSessionsList(),
      prepaidMonths: prepaidMonths > 0 ? prepaidMonths : null,
    };

    const res = await createAppointment(payload as NewAppointment);
    setLoading(false);
    if (res.success) {
      setBookedSuccess(true);
      sileo.success({ title: "Booking Confirmed", description: "Your appointment has been successfully scheduled." });
    } else {
      sileo.error({ title: "Booking Error", description: res.error || "Failed to confirm appointment." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl p-0 overflow-hidden bg-[var(--theme-card-bg,#f8fafc)] dark:bg-slate-900 text-[var(--theme-p-color,#1e293b)] dark:text-slate-200 rounded-2xl border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800">
        {/* HEADER MODAL */}
        <DialogHeader className="p-6 pb-4 border-b border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900">
          <DialogTitle className="text-2xl font-bold text-[var(--theme-h2-color,currentColor)] dark:text-white">{service.title}</DialogTitle>
        </DialogHeader>

        {bookedSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="size-16 rounded-full bg-[color-mix(in_srgb,var(--theme-primary,#059669)_15%,transparent)] text-[var(--theme-primary,#059669)] flex items-center justify-center mx-auto">
              <Check className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--theme-h2-color,currentColor)] dark:text-white">Booking Confirmed Successfully!</h2>
            <p className="text-[var(--theme-p-color,#475569)] max-w-md mx-auto text-sm">
              We have successfully scheduled your sessions. Remember you will make the payment of{" "}
              <strong className="text-[var(--theme-primary,#059669)]">${calculateTotalAmount().toLocaleString()} {singleSession.currency}</strong> onsite when attending your first session.
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              style={{
                backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary, #059669)))",
                color: "var(--theme-button-text, var(--primary-foreground, #ffffff))",
              }}
              className="rounded-xl px-8 font-bold hover:opacity-90 transition-all"
            >
              Got it
            </Button>
          </div>
        ) : step === 1 ? (
          /* ============================================================ */
          /* STEP 1: MODALITY & INLINE CALENDAR SELECTION */
          /* ============================================================ */
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-[var(--theme-h2-color,currentColor)] dark:text-white">What would you like to book?</h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: PRICING OPTIONS */}
              <div className="md:col-span-5 space-y-5">
                {/* 1. Base value */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[var(--theme-p-color,#64748b)] uppercase tracking-wide">Base value</span>
                  <div
                    onClick={handleSelectSingle}
                    style={
                      selectedType === "single"
                        ? {
                            borderColor: "var(--theme-primary, #059669)",
                            backgroundColor: "color-mix(in srgb, var(--theme-primary, #059669) 10%, transparent)",
                          }
                        : undefined
                    }
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedType === "single"
                        ? "ring-2 ring-[var(--theme-primary,#059669)]/30"
                        : "border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-800/80 hover:border-[var(--theme-primary,#059669)]/50"
                    }`}
                  >
                    <span className="text-sm font-medium text-[var(--theme-p-color,currentColor)] dark:text-slate-200">
                      Single session ({service.durationMinutes} minutes)
                    </span>
                    <span className="font-bold text-[var(--theme-h3-color,currentColor)] dark:text-white">${singleSession.price?.toLocaleString()}</span>
                  </div>
                </div>

                {/* 2. Package options */}
                {packs.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[var(--theme-p-color,#64748b)] uppercase tracking-wide">Package options</span>
                    {packs.map((pack, idx) => (
                      <div
                        key={pack.id || `pack-${idx}`}
                        onClick={() => handleSelectPack(pack)}
                        style={
                          selectedType === "pack" && selectedOptionId === pack.id
                            ? {
                                borderColor: "var(--theme-primary, #059669)",
                                backgroundColor: "color-mix(in srgb, var(--theme-primary, #059669) 10%, transparent)",
                              }
                            : undefined
                        }
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedType === "pack" && selectedOptionId === pack.id
                            ? "ring-2 ring-[var(--theme-primary,#059669)]/30"
                            : "border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-800/80 hover:border-[var(--theme-primary,#059669)]/50"
                        }`}
                      >
                        <span className="text-sm font-medium text-[var(--theme-p-color,currentColor)] dark:text-slate-200">{String(pack.name ?? "")}</span>
                        <span className="font-bold text-[var(--theme-h3-color,currentColor)] dark:text-white">${(pack.totalPrice ?? pack.price ?? 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Subscription */}
                {subscriptions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[var(--theme-p-color,#64748b)] uppercase tracking-wide">Subscription (monthly rate)</span>
                    {subscriptions.map((sub, idx) => (
                      <div
                        key={sub.id || `sub-${idx}`}
                        onClick={() => handleSelectSub(sub)}
                        style={
                          selectedType === "subscription" && selectedOptionId === sub.id
                            ? {
                                borderColor: "var(--theme-primary, #059669)",
                                backgroundColor: "color-mix(in srgb, var(--theme-primary, #059669) 10%, transparent)",
                              }
                            : undefined
                        }
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedType === "subscription" && selectedOptionId === sub.id
                            ? "ring-2 ring-[var(--theme-primary,#059669)]/30"
                            : "border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-800/80 hover:border-[var(--theme-primary,#059669)]/50"
                        }`}
                      >
                        <span className="text-sm font-medium text-[var(--theme-p-color,currentColor)] dark:text-slate-200">{String(sub.name ?? "")}</span>
                        <span className="font-bold text-[var(--theme-primary,#059669)]">${(sub.monthlyPrice ?? sub.price ?? 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: CALENDAR & SLOTS */}
              <div className="md:col-span-7 bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900 p-5 rounded-2xl border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <h3 className="font-bold text-[var(--theme-h3-color,currentColor)] dark:text-white text-base">Select Date & Time</h3>
                  <p className="text-xs text-[var(--theme-p-color,#64748b)] mt-1 leading-relaxed">
                    Choose the date and time of the first session. Subsequent sessions will be scheduled weekly on the same days and times:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[var(--theme-p-color,currentColor)]">Date</Label>
                    <DatePicker
                      value={selectedDate}
                      onChange={(val) => setSelectedDate(val)}
                      placeholder="Select date"
                      allowWeekends={availabilityRules ? availabilityRules.allowWeekends : true}
                      customDisabledDates={(availabilityRules?.customDisabledDates as string[]) || []}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[var(--theme-p-color,currentColor)]">Time</Label>
                    <TimePicker
                      value={selectedTime}
                      onChange={(val) => setSelectedTime(val)}
                      placeholder="Select time"
                      minTime={availabilityRules?.workStartHour || undefined}
                      maxTime={availabilityRules?.workEndHour || undefined}
                    />
                  </div>
                </div>

                {/* TIME SLOTS PREVIEW / SELECTION */}
                <div className="space-y-2 pt-2 border-t border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800">
                  <Label className="text-xs font-semibold text-[var(--theme-p-color,#64748b)] uppercase tracking-wide">Or choose standard slot</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.slice(0, 4).map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          const start = slot.split(" - ")[0];
                          if (start.includes("am") || start.includes("pm")) {
                            setSelectedSlot(slot);
                          }
                        }}
                        style={
                          selectedSlot === slot
                            ? {
                                borderColor: "var(--theme-primary, #059669)",
                                color: "var(--theme-primary, #059669)",
                                backgroundColor: "color-mix(in srgb, var(--theme-primary, #059669) 10%, transparent)",
                              }
                            : undefined
                        }
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                          selectedSlot === slot
                            ? "ring-2 ring-[var(--theme-primary,#059669)]/30"
                            : "border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 text-[var(--theme-p-color,currentColor)] dark:text-slate-200 hover:border-[var(--theme-primary,#059669)]/50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center pt-2">
              <Button
                onClick={handleConfirmStep1}
                style={{
                  backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary, #059669)))",
                  color: "var(--theme-button-text, var(--primary-foreground, #ffffff))",
                }}
                className="font-bold rounded-xl px-12 py-6 text-base shadow-md hover:shadow-lg hover:opacity-90 transition-all"
              >
                Confirm
              </Button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* STEP 2: SUMMARY & CUSTOMER FORM */
          /* ============================================================ */
          <form onSubmit={handleFinalBooking} className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[var(--theme-h2-color,currentColor)] dark:text-white leading-snug">
                You are one step away from boosting your wellness
              </h2>
              {selectedType === "subscription" ? (
                <p className="text-sm text-[var(--theme-p-color,#475569)] dark:text-slate-300 leading-relaxed">
                  You are subscribing to <strong>{String((selectedOptionDetails as SubscriptionOption).name ?? "")}</strong>.<br />
                  First session scheduled for <strong>Wednesday, September 21 at {selectedSlot}</strong>.
                </p>
              ) : (
                <p className="text-sm text-[var(--theme-p-color,#475569)] dark:text-slate-300 leading-relaxed">
                  You booked a <strong>{selectedType === "single" ? "Single Session" : String((selectedOptionDetails as PackOption).name ?? "")}</strong> of {service.title}:
                </p>
              )}
            </div>

            {/* SESSIONS BREAKDOWN */}
            {selectedType !== "subscription" && (
              <ul className="space-y-1.5 text-sm text-[var(--theme-p-color,currentColor)] dark:text-slate-200 list-disc list-inside bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900 p-4 rounded-xl border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 font-medium">
                <li><strong>First session:</strong> Wednesday, September 21 at {selectedSlot}</li>
                {selectedType === "pack" && (
                  <>
                    <li><strong>Second session:</strong> Wednesday, December 28 at {selectedSlot}</li>
                    <li><strong>Third session:</strong> Wednesday, January 5 at {selectedSlot}</li>
                  </>
                )}
              </ul>
            )}

            {/* PREPAID SUBSCRIPTION OPTIONS */}
            {selectedType === "subscription" && (
              <div className="space-y-3 bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900 p-4 rounded-xl border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800">
                <label className="flex items-center space-x-3 cursor-pointer text-sm font-medium">
                  <input type="radio" name="prepaid" checked={prepaidMonths === 0} onChange={() => setPrepaidMonths(0)} className="text-[var(--theme-primary,#059669)] focus:ring-[var(--theme-primary,#059669)]" />
                  <span>Standard monthly payment</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer text-sm font-medium">
                  <input type="radio" name="prepaid" checked={prepaidMonths === 6} onChange={() => setPrepaidMonths(6)} className="text-[var(--theme-primary,#059669)] focus:ring-[var(--theme-primary,#059669)]" />
                  <span>Pay 6 months in advance (10% discount)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer text-sm font-medium">
                  <input type="radio" name="prepaid" checked={prepaidMonths === 12} onChange={() => setPrepaidMonths(12)} className="text-[var(--theme-primary,#059669)] focus:ring-[var(--theme-primary,#059669)]" />
                  <span>Pay 12 months in advance (15% discount)</span>
                </label>
              </div>
            )}

            {/* CUSTOMER FORM */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--theme-p-color,currentColor)]">Full Name</Label>
                <Input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. John Doe" className="bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900 border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--theme-p-color,currentColor)]">Email Address</Label>
                <Input required type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="john@example.com" className="bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900 border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[var(--theme-p-color,currentColor)]">Phone Number</Label>
                <Input required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+1 555 123 4567" className="bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900 border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800" />
              </div>
            </div>

            {/* FINAL PRICE & CONFIRM */}
            <div className="space-y-3 pt-2">
              <div>
                <span className="text-3xl font-black text-[var(--theme-h2-color,currentColor)] dark:text-white">${calculateTotalAmount().toLocaleString()}</span>
                <span className="text-xs text-[var(--theme-p-color,#64748b)] block font-medium">
                  {selectedType === "subscription" ? "First month (Onsite payment)" : "Onsite payment"}
                </span>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-xl px-6">
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary, #059669)))",
                    color: "var(--theme-button-text, var(--primary-foreground, #ffffff))",
                  }}
                  className="font-bold rounded-xl px-10 py-6 text-base shadow-md hover:shadow-lg hover:opacity-90 transition-all"
                >
                  {loading ? "Booking..." : "Confirm & Pay Onsite"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
