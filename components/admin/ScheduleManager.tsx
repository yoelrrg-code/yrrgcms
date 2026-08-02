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
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Booking Type</TableHead>
                <TableHead>First Session</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Appointment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No appointments booked yet.
                  </TableCell>
                </TableRow>
              ) : (
                appointmentsList.map((app) => {
                  const sessions = (app.sessionsDates as SessionItem[]) || [];
                  const rawDate = sessions[0]?.date;
                  const parsedDate = rawDate ? new Date(rawDate) : null;
                  const firstSession = parsedDate && !isNaN(parsedDate.getTime())
                    ? parsedDate.toLocaleString()
                    : String(rawDate || "Pending date");

                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="font-semibold">{app.customerName}</div>
                        <div className="text-xs text-muted-foreground">{app.customerEmail} | {app.customerPhone}</div>
                      </TableCell>
                      <TableCell className="font-medium">{getServiceName(app.serviceId)}</TableCell>
                      <TableCell className="capitalize text-xs font-medium">
                        <Badge variant="outline">{app.bookingType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="size-3.5 text-muted-foreground" />
                          {firstSession}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.paymentStatus === "paid" ? "default" : "destructive"}>
                          {app.paymentStatus === "paid" ? "Paid" : "Pending Onsite Payment"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.status === "completed"
                              ? "default"
                              : app.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                          className={app.status === "cancelled" ? "bg-red-500/15 text-red-600 border-red-300 dark:border-red-900 dark:text-red-400 capitalize" : "capitalize"}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAppointment(app)}>
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
