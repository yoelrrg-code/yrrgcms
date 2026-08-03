import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import CheckoutForm from "./CheckoutForm";

interface CheckoutProps {
  params: Promise<{ productId: string }>;
}

export default async function CheckoutPage({ params }: CheckoutProps) {
  const { productId } = await params;
  const session = await auth();

  const [product] = await db.select().from(products).where(eq(products.id, productId));

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Producto no disponible</h1>
        <Link href="/cursos" className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-xl">
          Volver a Cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-3xl font-extrabold mb-8 text-center"
          style={{ color: "var(--theme-text, inherit)" }}
          data-aos="fade-down"
        >
          Checkout / Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Resumen del Pedido */}
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
            data-aos="fade-right"
          >
            <h2 className="text-xl font-bold" style={{ color: "var(--theme-text, inherit)" }}>
              Resumen del Pedido
            </h2>
            <div className="flex items-center gap-4">
              {product.imageUrl && <img src={product.imageUrl} alt={product.title} className="w-20 h-20 object-cover rounded-xl" />}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{product.title}</h3>
                <p className="text-sm text-slate-500">
                  {product.type === "VIRTUAL_COURSE"
                    ? "Virtual Course"
                    : product.type === "DIGITAL_DOWNLOAD"
                    ? "Digital Download"
                    : product.type === "PHYSICAL"
                    ? "Physical Product"
                    : product.type}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-lg font-bold border-t border-slate-100 dark:border-slate-800 pt-4">
              <span>Total:</span>
              <span style={{ color: "var(--theme-primary, #4f46e5)" }}>
                ${product.price.toLocaleString()} {product.currency}
              </span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-sm text-amber-800 dark:text-amber-300">
              <p className="font-bold mb-1">Datos para Transferencia Bancaria:</p>
              <p>Banco: Banco Central</p>
              <p>CBU / Alias: 00000031000847291048 / YRRG.CMS.PAGOS</p>
              <p>Titular: YRRG CMS Inc.</p>
            </div>
          </div>

          {/* Formulario de Checkout */}
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
            data-aos="fade-left"
          >
            <CheckoutForm product={product} user={session?.user} />
          </div>
        </div>
      </div>
    </div>
  );
}
