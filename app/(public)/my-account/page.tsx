import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { GraduationCap, User, ShoppingBag, ShieldCheck } from "lucide-react";
import ProfileForm from "./ProfileForm";
import { AccountBreadcrumbs } from "@/components/AccountBreadcrumbs";

export const metadata = {
  title: "My Account | CMS",
};

export default async function MyAccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login?callbackUrl=/my-account");
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 space-y-8">
      <AccountBreadcrumbs />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Account</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your account profile, access your purchased digital/physical products, and view enrolled courses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Access Cards */}
        <div className="md:col-span-1 space-y-6">
          {/* Purchased Orders & Digital Downloads Card */}
          <div 
            className="group card-hover-effect text-white rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-md border border-slate-800/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            style={{
              backgroundColor: "var(--theme-primary, #4f46e5)",
            }}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#ffffff" }}>My Orders & Downloads</h2>
              <p className="text-xs opacity-90 leading-relaxed" style={{ color: "#ffffff" }}>
                Download digital files, view physical product shipment tracking, and review order history.
              </p>
            </div>

            <Link
              href="/my-account/orders"
              className="btn-hover-effect w-full py-3 font-bold text-sm rounded-xl text-center transition-all duration-300 block shadow-sm hover:scale-105 active:scale-95 theme-btn-link"
              style={{
                backgroundColor: "#ffffff",
                color: "var(--theme-primary, #4f46e5)",
                borderRadius: "var(--theme-button-radius, 0.75rem)",
              }}
            >
              View Orders & Downloads →
            </Link>
          </div>

          {/* Course Access Card */}
          <div 
            className="group card-hover-effect text-white rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-md border border-slate-800/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            style={{
              backgroundColor: "var(--theme-secondary, #0f172a)",
            }}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#ffffff" }}>My Courses</h2>
              <p className="text-xs opacity-90 leading-relaxed" style={{ color: "#ffffff" }}>
                Access video lessons, guides, and materials for all enrolled virtual courses.
              </p>
            </div>

            <Link
              href="/my-account/courses"
              className="btn-hover-effect w-full py-3 font-bold text-sm rounded-xl text-center transition-all duration-300 block border border-white/20 hover:bg-white/10 hover:scale-105 active:scale-95"
              style={{
                color: "#ffffff",
                borderRadius: "var(--theme-button-radius, 0.75rem)",
              }}
            >
              View My Courses →
            </Link>
          </div>
        </div>

        {/* Profile Details & Password Update */}
        <div className="card-hover-effect md:col-span-2 bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <User className="h-5 w-5" style={{ color: "var(--theme-primary, #4f46e5)" }} />
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--theme-h2-color, var(--theme-text, inherit))" }}>Profile Information</h2>
              <p className="text-xs" style={{ color: "var(--theme-p-color, inherit)" }}>Your personal account details</p>
            </div>
          </div>

          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
