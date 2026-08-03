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

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Fallo la subida del comprobante");
      }

      const data = await res.json();
      const uploadedUrl = data.url || data.media?.url;
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
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">¡Orden Registrada!</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tu orden <span className="font-semibold text-slate-900 dark:text-white">#{successOrder.slice(0, 8)}</span> está en estado <span className="text-amber-600 font-bold">Pendiente de Pago</span>.
        </p>
        <p className="text-xs text-slate-500">
          Una vez que el administrador verifique tu comprobante de transferencia, el curso se activará en tu panel.
        </p>
        <button
          onClick={() => router?.push("/my-account/courses")}
          className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm"
        >
          Ir a Mis Cursos
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-xl">{error}</div>}

      {!user?.id ? (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
          <span>¿Ya tienes cuenta? Inicia sesión para vincular tu compra automáticamente.</span>
          <a href={`/auth/signin?callbackUrl=/checkout/${product.id}`} className="font-bold underline ml-2">
            Iniciar sesión
          </a>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
          Comprando como <span className="font-bold">{user.email}</span> (Sesión iniciada)
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
        <input
          name="customerName"
          defaultValue={user?.name || ""}
          required
          type="text"
          placeholder="Juan Pérez"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
        <input
          name="customerEmail"
          defaultValue={user?.email || ""}
          required
          type="email"
          placeholder="juan@ejemplo.com"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          URL o Enlace del Comprobante (opcional)
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              name="proofOfPaymentUrl"
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://mis-archivos.com/comprobante.pdf"
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
              {uploading ? "Subiendo..." : proofUrl ? "Subido" : "Subir Archivo"}
            </button>
          </div>
          {proofUrl && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              ✓ Comprobante cargado correctamente
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
      >
        {loading ? "Procesando..." : "Confirmar Orden y Registrar"}
      </button>
    </form>
  );
}
