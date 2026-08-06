"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { User, LogOut, ChevronRight, ShieldCheck, GraduationCap, ShoppingBag } from "lucide-react";

interface UserDrawerProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  editHref?: string;
  isAdminArea?: boolean;
}

export function UserDrawer({ user, editHref, isAdminArea }: UserDrawerProps) {
  const [open, setOpen] = useState(false);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const initials = getInitials(user.name, user.email);
  const roleDisplay = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Customer";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            className="btn-hover-effect relative inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all shadow-sm hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 shrink-0"
            style={{
              backgroundColor: "var(--theme-primary, #4f46e5)",
              color: "#ffffff",
            }}
            aria-label="User Account Menu"
          >
            {initials}
          </button>
        }
      />

      <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
        <div>
          <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 text-left">
            <SheetTitle className="text-xl font-extrabold tracking-tight">Account Overview</SheetTitle>
          </SheetHeader>

          {/* User Details Box */}
          <div className="py-6 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-lg text-white shrink-0 shadow-md transition-transform duration-300 hover:scale-110"
              style={{ backgroundColor: "var(--theme-primary, #4f46e5)" }}
            >
              {initials}
            </div>
            <div className="space-y-1 overflow-hidden flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                  {user.name || "User Account"}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  {roleDisplay}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email || "no-email@example.com"}
              </p>
            </div>
          </div>

          {/* Quick Menu Links */}
          <div className="py-4 space-y-2.5">
            {user.role?.toLowerCase() === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20 transition-all duration-300 hover:shadow-md font-bold text-sm group"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-amber-500 transition-transform" />
                  <span>Admin Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </Link>
            )}

            <Link
              href={editHref || "/my-account"}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between p-3.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-indigo-950/40 transition-all duration-300 hover:shadow-sm font-medium text-sm group"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-all" />
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Edit Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-all duration-300" />
            </Link>

            {!isAdminArea && (
              <>
                <Link
                  href="/my-account/orders"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-all duration-300 hover:translate-x-1.5 hover:shadow-sm font-medium text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                    <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">My Orders & Downloads</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                </Link>

                <Link
                  href="/my-account/courses"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-all duration-300 hover:translate-x-1.5 hover:shadow-sm font-medium text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                    <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">My Enrolled Courses</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Footer Sign Out */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="btn-hover-effect w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
