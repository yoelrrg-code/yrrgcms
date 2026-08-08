import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, pages, posts, formSubmissions, orders } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API Key no configurada." },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Se requiere historial de mensajes." },
        { status: 400 }
      );
    }

    // Obtener estadísticas reales del CMS en tiempo real para alimentar el contexto del modelo
    const [
      [{ count: productsCount }],
      [{ count: pagesCount }],
      [{ count: postsCount }],
      [{ count: submissionsCount }],
      [{ count: ordersCount }],
    ] = await Promise.all([
      db.select({ count: count() }).from(products),
      db.select({ count: count() }).from(pages),
      db.select({ count: count() }).from(posts),
      db.select({ count: count() }).from(formSubmissions),
      db.select({ count: count() }).from(orders),
    ]);

    const systemPrompt = `Sos el Copiloto Ejecutivo y Asistente Autónomo del Panel de Administración de YRRG CMS.
Tenés acceso en tiempo real a las métricas del sistema:
- Cursos y Productos registrados: ${productsCount}
- Páginas construidas: ${pagesCount}
- Artículos de Blog publicados: ${postsCount}
- Mensajes y formularios recibidos: ${submissionsCount}
- Pedidos/Órdenes procesadas: ${ordersCount}

Tu rol es ayudar al administrador a:
1. Analizar el estado de su plataforma y dar recomendaciones de crecimiento, marketing y SEO.
2. Guiar o sugerir cómo crear nuevos contenidos, cursos y páginas.
3. Redactar respuestas para clientes o mensajes para campañas de email.
4. Explicar el funcionamiento de cualquier módulo de YRRG CMS.

Responded siempre de forma profesional, clara, entusiasta y directa en español rioplatense natural (usando voseo cuando corresponda). Formateá tus respuestas con markdown limpio (títulos ##, viñetas, **negritas**).`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
        "X-Title": "YRRG CMS Executive Copilot",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash:0731-cloud",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.error?.message || "Error de comunicación con OpenRouter API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const replyContent = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      role: "assistant",
      content: replyContent
    });
  } catch (error) {
    console.error("Executive Copilot error:", error);
    return NextResponse.json(
      { error: "Error interno en el Copiloto Ejecutivo." },
      { status: 500 }
    );
  }
}
