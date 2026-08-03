"use client";

import React, { useState, useRef } from "react";
import { createOrderAction } from "@/lib/actions/ecommerce";
import { useRouter } from "next/navigation";
import { Upload, FileCheck, Loader2 } from "lucide-react";

interface CheckoutFormProps {
  product: {
    id: string;
    title: string;
    price: number;
    type: string;
  };
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

export default function CheckoutForm({ product, user }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = RouterHook();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          !res.ok
            ? `Error del servidor (${res.status}): ${responseText || "Sin respuesta"}`
            : "Formato de respuesta inválido del servidor"
        );
      }

      if (!res.ok) {
        const errorMsg = (data.error as string) || `Fallo la subida del comprobante (${res.status})`;
        throw new Error(errorMsg);
      }

      const uploadedUrl = (data.url as string) || ((data.media as { url?: string })?.url);
      if (uploadedUrl) {
        setProofUrl(uploadedUrl);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir el comprobante");
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("productId", product.id);
    if (user?.id) {
      formData.append("userId", user.id);
    }
    if (proofUrl) {
      formData.set("proofOfPaymentUrl", proofUrl);
    }

    const res = await createOrderAction(formData);
    setLoading(false);

    if (res.success && res.orderId) {
      setSuccessOrder(res.orderId);
    } else {
      setError(res.error || "Ocurrió un error al procesar el pedido.");
    }
  }

  function RouterHook() {
    try {
      return useRouter();
    } catch {
      return null;
    }
  }

  if (successOrder) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Placed Successfully!</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your order <span className="font-semibold text-slate-900 dark:text-white">#{successOrder.slice(0, 8)}</span> is currently <span className="text-amber-600 font-bold">Pending Payment</span>.
        </p>
        <p className="text-xs text-slate-500">
          Once the administrator verifies your transfer receipt, your order will be approved and you will receive an email with your access link or shipping confirmation.
        </p>
        <button
          onClick={() => router?.push(product.type === "VIRTUAL_COURSE" ? "/my-account/courses" : "/my-account")}
          className="mt-4 px-6 py-2.5 font-bold text-sm transition"
          style={{
            backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
            color: "var(--theme-button-text, #ffffff)",
            borderRadius: "var(--theme-button-radius, 0.75rem)",
          }}
        >
          Go to My Account
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-xl">{error}</div>}

      {!user?.id ? (
        <>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
            <span>Already have an account? Sign in to link your purchase automatically.</span>
            <a href={`/admin/login?callbackUrl=/checkout/${product.id}`} className="font-bold underline ml-2">
              Sign In
            </a>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Password (for tracking your order)
            </label>
            <input
              name="password"
              required
              type="password"
              minLength={6}
              placeholder="Create a password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </>
      ) : (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
          Purchasing as <span className="font-bold">{user.email}</span> (Logged in)
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
        <input
          name="customerName"
          defaultValue={user?.name || ""}
          required
          type="text"
          placeholder="John Doe"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
        <input
          name="customerEmail"
          defaultValue={user?.email || ""}
          required
          type="email"
          placeholder="john@example.com"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {product.type === "PHYSICAL" && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Shipping Address (Street, Number, City, Zip Code) *
          </label>
          <textarea
            name="shippingAddress"
            required
            rows={3}
            placeholder="Av. Providencia 1234, Apt 42, Santiago, Chile"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Payment Receipt Link or File (optional)
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              name="proofOfPaymentUrl"
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://my-files.com/receipt.pdf"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              ) : proofUrl ? (
                <FileCheck className="h-4 w-4 text-emerald-600" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading..." : proofUrl ? "Uploaded" : "Upload File"}
            </button>
          </div>
          {proofUrl && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              ✓ Receipt loaded successfully
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full py-3 font-bold transition disabled:opacity-50"
        style={{
          backgroundColor: "var(--theme-button-bg, var(--theme-primary, #4f46e5))",
          color: "var(--theme-button-text, #ffffff)",
          borderRadius: "var(--theme-button-radius, 0.75rem)",
        }}
      >
        {loading ? "Processing..." : "Confirm Order & Submit"}
      </button>
    </form>
  );
}
