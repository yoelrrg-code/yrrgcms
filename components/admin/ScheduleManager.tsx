"use client";

import { Appointment, Service } from "@/lib/db/schema";
import { useState, useMemo } from "react";
import { updateAppointmentStatus, deleteAppointment } from "@/lib/actions/services";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  DollarSign,
  List,
  ChevronLeft,
  ChevronRight,
  User,
  Info,
  Zap,
  Package,
  Repeat,
  Trash2
} from "lucide-react";
import { sileo } from "sileo";

interface ScheduleManagerProps {
  initialAppointments: Appointment[];
  services: Service[];
}

interface SessionItem {
  sessionIndex?: number;
  date?: string;
  [key: string]: unknown;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ScheduleManager({ initialAppointments, services }: ScheduleManagerProps) {
  const [appointmentsList, setAppointmentsList] = useState(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calendar View Month/Year State
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const getServiceName = (serviceId: string) => {
    const s = services.find((srv) => srv.id === serviceId);
    return s ? s.title : "Service";
  };

  const handleDeleteAppointment = (id: string) => {
    sileo.action({
      title: "Delete Appointment?",
      description: "Are you sure you want to permanently delete this cancelled appointment?",
      button: {
        title: "Confirm Delete",
        onClick: async () => {
          setDeletingId(id);
          const res = await deleteAppointment(id);
          setDeletingId(null);
          if (res.success) {
            setAppointmentsList((prev) => prev.filter((app) => app.id !== id));
            if (selectedAppointment?.id === id) {
              setSelectedAppointment(null);
            }
            sileo.success({
              title: "Appointment Deleted",
              description: "The cancelled appointment has been permanently removed.",
            });
          } else {
            sileo.error({
              title: "Error",
              description: res.error || "Failed to delete appointment.",
            });
          }
        },
      },
    });
  };

  const handleUpdateStatus = async (
    id: string,
    status: "confirmed" | "completed" | "cancelled" | "no_show",
    paymentStatus?: "pending_onsite" | "paid"
  ) => {
    const res = await updateAppointmentStatus(id, status, paymentStatus);
    if (res.success && res.data) {
      setAppointmentsList(appointmentsList.map((app) => (app.id === id ? res.data : app)));
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(res.data);
      }
    }
  };

  // Map appointments to dates YYYY-MM-DD
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, { appointment: Appointment; sessionInfo: SessionItem }[]> = {};

    appointmentsList.forEach((app) => {
      const sessions = (app.sessionsDates as SessionItem[]) || [];
      sessions.forEach((s) => {
        if (s.date) {
          let key = "";
          const strDate = String(s.date);
          const dateMatch = strDate.match(/\d{4}-\d{2}-\d{2}/);
          if (dateMatch) {
            key = dateMatch[0];
          } else {
            const dateObj = new Date(s.date);
            if (!isNaN(dateObj.getTime())) {
              const year = dateObj.getUTCFullYear();
              const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
              const day = String(dateObj.getUTCDate()).padStart(2, "0");
              key = `${year}-${month}-${day}`;
            }
          }

          if (key) {
            if (!map[key]) map[key] = [];
            map[key].push({ appointment: app, sessionInfo: s });
          }
        }
      });
    });

    return map;
  }, [appointmentsList]);

  // Calendar grid calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  return (
    <div className="space-y-6">
      {/* LAYOUT SELECTOR & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg border">
          <Button
            type="button"
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="rounded-md font-semibold text-xs transition-all"
          >
            <CalendarIcon className="mr-1.5 size-4" /> Calendar View
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-md font-semibold text-xs transition-all"
          >
            <List className="mr-1.5 size-4" /> List View
          </Button>
        </div>

        {viewMode === "calendar" && (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleToday} className="text-xs font-semibold">
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="size-8">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm font-bold w-36 text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="size-8">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* CALENDAR VIEW */}
      {/* ============================================================ */}
      {viewMode === "calendar" ? (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col min-h-[680px]">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b bg-muted/40 text-center font-semibold text-xs py-3 text-muted-foreground">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr flex-1 divide-x divide-y border-b text-xs">
            {/* Empty slots for month start alignment */}
            {Array.from({ length: startDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-muted/10 min-h-[100px] p-2" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedMonth = String(currentMonth + 1).padStart(2, "0");
              const formattedDay = String(dayNum).padStart(2, "0");
              const dateKey = `${currentYear}-${formattedMonth}-${formattedDay}`;

              const dayItems = appointmentsByDate[dateKey] || [];
              const isToday = dateKey === todayStr;

              return (
                <div
                  key={dayNum}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    isToday ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`inline-flex items-center justify-center size-6 rounded-full font-bold text-xs ${
                        isToday
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                        {dayItems.length} {dayItems.length === 1 ? "booking" : "bookings"}
                      </span>
                    )}
                  </div>

                  {/* Appointments list inside cell */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[120px] pr-1">
                    {dayItems.map(({ appointment, sessionInfo }, idx) => {
                      const isCompleted = appointment.status === "completed";
                      const isCancelled = appointment.status === "cancelled";
                      const isPaid = appointment.paymentStatus === "paid";

                      // Icon based on booking type
                      const TypeIcon =
                        appointment.bookingType === "pack"
                          ? Package
                          : appointment.bookingType === "subscription"
                          ? Repeat
                          : Zap;

                      return (
                        <Tooltip key={`${appointment.id}-${idx}`}>
                          <TooltipTrigger>
                            <div
                              onClick={() => setSelectedAppointment(appointment)}
                              className={`group cursor-pointer p-1.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-1.5 shadow-2xs ${
                                isCancelled
                                  ? "bg-muted/50 border-dashed opacity-60 line-through"
                                  : isCompleted
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                                  : isPaid
                                  ? "bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-200"
                                  : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <div className="size-5 rounded-full bg-background border flex items-center justify-center shrink-0">
                                  <User className="size-3 text-muted-foreground" />
                                </div>
                                <span className="font-semibold truncate text-[11px]">
                                  {appointment.customerName}
                                </span>
                              </div>

                              <TypeIcon className="size-3.5 shrink-0 opacity-70" />
                            </div>
                          </TooltipTrigger>

                          <TooltipContent side="top" className="flex flex-col items-stretch w-72 max-w-sm p-4 space-y-3 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-800 text-xs">
                            <div className="border-b border-slate-800 pb-2">
                              <p className="font-bold text-sm text-white flex items-center gap-1.5">
                                <User className="size-3.5 shrink-0" /> {appointment.customerName}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{appointment.customerEmail} • {appointment.customerPhone}</p>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-300">
                              <p><strong className="text-slate-400">Service:</strong> {getServiceName(appointment.serviceId)}</p>
                              <p><strong className="text-slate-400">Booking Type:</strong> <span className="capitalize">{appointment.bookingType}</span></p>
                              <p>
                                <strong className="text-slate-400">Amount:</strong>{" "}
                                <span className="text-emerald-400 font-bold">${appointment.totalAmount.toLocaleString()} {appointment.currency}</span>{" "}
                                {appointment.status === "cancelled" ? (
                                  <span className="text-red-500 font-semibold">(cancelled)</span>
                                ) : (
                                  `(${appointment.paymentStatus})`
                                )}
                              </p>
                              {sessionInfo?.date && (
                                <p>
                                  <strong className="text-slate-400">Time:</strong>{" "}
                                  {(() => {
                                    const str = String(sessionInfo.date);
                                    const d = new Date(str.replace(" ", "T"));
                                    return !isNaN(d.getTime()) ? d.toLocaleString() : str;
                                  })()}
                                </p>
                              )}
                            </div>

                            <div className="pt-1 border-t border-slate-800 flex justify-end">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointment(appointment);
                                }}
                                className="h-7 text-xs font-semibold px-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                              >
                                <Info className="mr-1 size-3" /> View Details
                              </Button>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* LIST VIEW */
        /* ============================================================ */
        <div className="space-y-4">
          {/* Desktop table >=1024px */}
          <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Service</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Booking Type</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">First Session</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Payment Status</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Appointment Status</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointmentsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        No appointments booked yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointmentsList.map((app) => {
                      const sessions = (app.sessionsDates as SessionItem[]) || [];
                      const rawDate = sessions[0]?.date;
                      const parsedDate = rawDate ? new Date(rawDate) : null;
                      const firstSession = parsedDate && !isNaN(parsedDate.getTime())
                        ? parsedDate.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : String(rawDate || "Pending date");

                      return (
                        <TableRow key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                          <TableCell className="font-medium">
                            <div className="font-bold text-slate-900 dark:text-white">{app.customerName}</div>
                            <div className="text-xs text-slate-500 font-mono">{app.customerEmail} | {app.customerPhone}</div>
                          </TableCell>
                          <TableCell className="font-bold text-slate-900 dark:text-white">{getServiceName(app.serviceId)}</TableCell>
                          <TableCell className="capitalize text-xs font-medium">
                            <Badge variant="outline" className="font-bold rounded-lg uppercase text-[10px]">{app.bookingType}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 font-mono whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
                              {firstSession}
                            </div>
                          </TableCell>
                          <TableCell>
                            {app.paymentStatus === "paid" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                                Pending Onsite
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {app.status === "completed" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 capitalize">
                                Completed
                              </span>
                            ) : app.status === "cancelled" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 capitalize">
                                Cancelled
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 capitalize">
                                {app.status}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedAppointment(app)} className="rounded-xl text-xs font-bold">
                              Details
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
            {appointmentsList.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                No appointments booked yet.
              </div>
            ) : (
              appointmentsList.map((app) => {
                const sessions = (app.sessionsDates as SessionItem[]) || [];
                const rawDate = sessions[0]?.date;
                const parsedDate = rawDate ? new Date(rawDate) : null;
                const firstSession = parsedDate && !isNaN(parsedDate.getTime())
                  ? parsedDate.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                  : String(rawDate || "Pending date");

                return (
                  <div key={app.id} className="rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{app.customerName}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{app.customerEmail}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        <Badge variant="outline" className="font-bold rounded-lg uppercase text-[10px]">{app.bookingType}</Badge>
                        {app.status === "completed" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 whitespace-nowrap capitalize">
                            Completed
                          </span>
                        ) : app.status === "cancelled" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 whitespace-nowrap capitalize">
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 whitespace-nowrap capitalize">
                            {app.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{getServiceName(app.serviceId)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 font-mono">
                        <CalendarIcon className="size-3" />
                        {firstSession}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                      <div>
                        {app.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            Pending Onsite
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(app)} className="text-xs font-bold rounded-xl">
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* APPOINTMENT DETAILS DIALOG */}
      {/* ============================================================ */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div className="border-b pb-3">
                <p className="font-semibold text-base flex items-center gap-2">
                  <User className="size-4 text-primary" /> {selectedAppointment.customerName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedAppointment.customerEmail} • {selectedAppointment.customerPhone}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Booked Service</p>
                <p className="font-medium">{getServiceName(selectedAppointment.serviceId)} (<span className="capitalize">{selectedAppointment.bookingType}</span>)</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Amount (Onsite Payment)</p>
                <p className="text-lg font-bold text-emerald-600">${selectedAppointment.totalAmount.toLocaleString()} {selectedAppointment.currency}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">Booked Session Dates</p>
                <div className="space-y-1.5 bg-muted p-2.5 rounded-lg text-xs">
                  {((selectedAppointment.sessionsDates as SessionItem[]) || []).map((s, idx) => {
                    const parsed = s.date ? new Date(s.date) : null;
                    const isValid = parsed && !isNaN(parsed.getTime());
                    return (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-medium text-muted-foreground">Session #{idx + 1}:</span>
                        <span className="font-semibold">{isValid ? parsed.toLocaleString() : String(s.date || "Pending")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                {selectedAppointment.status === "cancelled" ? (
                  <Button
                    variant="destructive"
                    disabled={deletingId === selectedAppointment.id}
                    onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                    className="w-full"
                  >
                    <Trash2 className="mr-1.5 size-4" /> {deletingId === selectedAppointment.id ? "Deleting..." : "Delete Permanently"}
                  </Button>
                ) : (
                  <>
                    {selectedAppointment.paymentStatus === "pending_onsite" && (
                      <Button onClick={() => handleUpdateStatus(selectedAppointment.id, selectedAppointment.status, "paid")} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                        <DollarSign className="mr-1.5 size-4" /> Mark as Paid Onsite
                      </Button>
                    )}
                    {selectedAppointment.status === "confirmed" && (
                      <Button onClick={() => handleUpdateStatus(selectedAppointment.id, "completed", selectedAppointment.paymentStatus)} className="w-full">
                        <CheckCircle className="mr-1.5 size-4" /> Mark Session Completed
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedAppointment.id, "cancelled", selectedAppointment.paymentStatus)} className="w-full text-destructive">
                      <XCircle className="mr-1.5 size-4" /> Cancel Appointment
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
