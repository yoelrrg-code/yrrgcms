import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { saveMediaRecord } from "@/lib/actions/media";

// Helper para extraer texto plano legible de TipTap JSON o HTML
function extractPlainText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") {
    return content.replace(/<[^>]*>/g, " ").trim();
  }
  if (typeof content === "object") {
    try {
      const jsonStr = JSON.stringify(content);
      const matches = jsonStr.match(/"text":"([^"]+)"/g);
      if (matches) {
        return matches.map((m) => m.replace(/"text":"|"$/g, "")).join(" ");
      }
    } catch {
      // Ignore parse errors
    }
  }
  return String(content);
}

// Búsqueda en la Web Real de candidato de imágenes relacionadas por título
async function getWebImageCandidates(searchQuery: string): Promise<string[]> {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  };

  const candidates: string[] = [];

  try {
    // 1. Obtener vqd token de DuckDuckGo
    const tokenRes = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&t=h_&iax=images&ia=images`,
      { headers }
    );
    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=["']([^"']+)["']/i) || html.match(/vqd=([\d-]+)/i);
    const vqd = vqdMatch ? vqdMatch[1] : null;

    if (vqd) {
      const imgRes = await fetch(
        `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(searchQuery)}&vqd=${vqd}&f=,,,`,
        { headers }
      );

      if (imgRes.ok) {
        const data = await imgRes.json();
        const results = data.results || [];
        for (const item of results.slice(0, 10)) {
          if (item.image && (item.image.startsWith("http://") || item.image.startsWith("https://"))) {
            candidates.push(item.image);
          }
        }
      }
    }
  } catch (err) {
    console.warn("DuckDuckGo image search failed:", err);
  }

  // Fallback Unsplash
  try {
    const cleanQuery = encodeURIComponent(searchQuery);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${cleanQuery}&per_page=5&orientation=landscape&client_id=bK2xI4sWzP425Kj6aJ7jE6u6zO6uW9aZ7xI4sWzP425K`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.results) {
        for (const r of data.results) {
          const u = r.urls?.regular || r.urls?.full;
          if (u) candidates.push(u);
        }
      }
    }
  } catch (err) {
    console.warn("Unsplash fallback failed:", err);
  }

  return candidates;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API Key no está configurada en las variables de entorno." },
        { status: 500 }
      );
    }

    const { title, content } = await req.json();

    if (!title && !content) {
      return NextResponse.json(
        { error: "Se requiere título o contenido del post." },
        { status: 400 }
      );
    }

    const cleanText = extractPlainText(content);
    const userMessage = `Post Title: "${title || "Sin título"}"\n\nContent Excerpt:\n${(cleanText || title).slice(0, 2500)}`;

    const systemInstruction = `Sos un director de arte editorial y especialista en SEO.
Tu tarea es analizar el título y contenido de un post y devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "excerpt": "Un resumen extremadamente atractivo de 2 oraciones (máximo 160 caracteres) que enganche al lector.",
  "seoTitle": "Título SEO optimizado para motores de búsqueda (máximo 60 caracteres) con palabras clave principales.",
  "seoDescription": "Meta descripción atractiva para buscadores (entre 120 y 155 caracteres) con un llamado a la acción implícito.",
  "searchQuery": "Término de búsqueda conciso y preciso en inglés o español para encontrar en la web la imagen fotográfica real del producto, tema o noticia principal (ej: para 'Google Pixel 11 Pro XL...' -> 'Google Pixel smartphone', para un post de cafe -> 'artisan coffee espresso')"
}
Respondé SOLO el objeto JSON sin bloques de código markdown ni comillas innecesarias.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
        "X-Title": "YRRG CMS Post Metadata AI",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash:0731-cloud",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.error?.message || "Error al comunicarse con la API de IA de OpenRouter." },
        { status: response.status }
      );
    }

    const data = await response.json();
    let rawContent = data.choices?.[0]?.message?.content || "";

    // Limpieza de JSON
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawContent = jsonMatch[0];
    }

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawContent);
    } catch (parseError) {
      console.warn("Fallo al parsear JSON devuelto por IA:", rawContent);
      parsedData = {
        excerpt: cleanText.slice(0, 150) + "...",
        seoTitle: title,
        seoDescription: cleanText.slice(0, 140),
        searchQuery: title,
      };
    }

    // 1. Obtener candidatos de imágenes de la web
    const queryToSearch = parsedData.searchQuery || title;
    let candidates = await getWebImageCandidates(queryToSearch);
    if (candidates.length === 0 && title) {
      candidates = await getWebImageCandidates(title);
    }

    let vercelBlobUrl = "";

    // 2. Probar candidatos hasta que uno se descargue y se suba con exito a VERCEL BLOB
    for (const imgUrl of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const imgRes = await fetch(imgUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "image/jpeg,image/webp,image/png,image/*",
          },
        });
        clearTimeout(timeoutId);

        const contentType = imgRes.headers.get("content-type") || "";

        if (imgRes.ok && (contentType.includes("image") || contentType.includes("octet-stream"))) {
          const imageBuffer = await imgRes.arrayBuffer();

          if (imageBuffer.byteLength > 4000) {
            const safeSlug = (title || "post-featured")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            const filename = `web-featured-${safeSlug || "post"}-${Date.now()}.jpg`;

            // SUBIDA OBLIGATORIA A VERCEL BLOB
            const blob = await put(filename, imageBuffer, {
              access: "public",
              contentType: contentType.includes("image") ? contentType : "image/jpeg",
            });

            vercelBlobUrl = blob.url;

            // Registrar en biblioteca de medios del CMS
            saveMediaRecord({
              filename,
              url: blob.url,
              alt: parsedData.seoTitle || title || "Web Featured Image",
              mimeType: contentType.includes("image") ? contentType : "image/jpeg",
              size: imageBuffer.byteLength,
            }).catch((dbErr) => {
              console.warn("No se pudo registrar en biblioteca de medios:", dbErr);
            });

            // Una vez subida exitosamente a Vercel Blob, rompemos el ciclo
            break;
          }
        }
      } catch (uploadErr) {
        console.warn("Candidato fallido para Vercel Blob, probando el siguiente:", uploadErr);
      }
    }

    return NextResponse.json({
      excerpt: parsedData.excerpt || cleanText.slice(0, 150),
      seoTitle: parsedData.seoTitle || title,
      seoDescription: parsedData.seoDescription || cleanText.slice(0, 140),
      featuredImageUrl: vercelBlobUrl,
    });
  } catch (error: any) {
    console.error("AI Post Metadata Error:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno al generar metadatos con IA." },
      { status: 500 }
    );
  }
}
