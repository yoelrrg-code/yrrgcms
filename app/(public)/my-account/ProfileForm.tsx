"use client";

import React, { useState, useTransition } from "react";
import { updateProfileAction } from "@/lib/actions/user";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.success) {
        setMessage({ type: "success", text: "Profile updated successfully." });
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update profile." });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Full Name
        </label>
        <input
          name="name"
          type="text"
          defaultValue={user.name}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Email Address (Read-only)
        </label>
        <div className="relative">
          <input
            name="email"
            type="email"
            readOnly
            value={user.email}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm cursor-not-allowed pr-10"
          />
          <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password (Optional)</h3>
          <p className="text-xs text-slate-500">Leave fields blank if you do not wish to change your password.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Current Password
          </label>
          <input
            name="currentPassword"
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            New Password
          </label>
          <input
            name="newPassword"
            type="password"
            placeholder="Minimum 6 characters"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 font-bold text-sm rounded-xl transition disabled:opacity-50"
        style={{
          backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
          color: "var(--theme-button-text, #ffffff)",
          borderRadius: "var(--theme-button-radius, 0.75rem)",
        }}
      >
        {isPending ? "Saving Changes..." : "Save Changes"}
      </button>
    </form>
  );
}
