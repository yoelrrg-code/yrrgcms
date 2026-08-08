import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

    const { prompt, mode, text } = await req.json();

    if (!prompt && !text) {
      return NextResponse.json(
        { error: "Se requiere prompt o texto de entrada." },
        { status: 400 }
      );
    }

    let systemInstruction = "Sos un asistente editorial experto y redactor senior especializado en CMS, e-learning y marketing de contenidos. Responded siempre en formato HTML limpio para editores de texto enriquecido (usando etiquetas <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>, <blockquote>), sin bloques de código ```html ni rodeos redundantes.";

    let userMessage = "";

    switch (mode) {
      case "draft":
        systemInstruction += " Generá un artículo bien estructurado, atractivo y educativo.";
        userMessage = `Escribí un artículo completo y profesional sobre el siguiente tema:\n"${prompt}"`;
        break;
      case "improve":
        systemInstruction += " Mejorá el texto manteniendo la esencia pero perfeccionando la gramática, claridad y persuasión.";
        userMessage = `Mejorá y optimizá el siguiente texto:\n\n"${text}"\n\nInstrucción adicional: ${prompt || "Hazlo más claro y atractivo."}`;
        break;
      case "summarize":
        systemInstruction = "Sos un asistente editorial. Generá un resumen conciso de máximo 2 o 3 oraciones en texto plano (sin etiquetas HTML), ideal para una meta descripción o excerpt de entrada.";
        userMessage = `Resumí de forma atractiva el siguiente contenido:\n\n"${text}"`;
        break;
      case "seo":
        systemInstruction = "Sos un experto en SEO. Respondé en formato JSON con la estructura exacta: { \"seoTitle\": \"...\", \"metaDescription\": \"...\", \"keywords\": [\"...\"] } sin bloques ```json ni texto adicional.";
        userMessage = `Generá la configuración SEO optimizada para este contenido:\n\n"${text || prompt}"`;
        break;
      case "translate":
        systemInstruction += " Traducí fielmente el texto manteniendo el formato de etiquetas HTML intacto.";
        userMessage = `Traducí el siguiente texto al ${prompt || "inglés"}:\n\n"${text}"`;
        break;
      default:
        userMessage = prompt || text;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
        "X-Title": "YRRG CMS AI Assistant",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash:0731-cloud",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API Error:", errorData);
      return NextResponse.json(
        { error: errorData?.error?.message || "Error al comunicarse con OpenRouter API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ result: generatedText });
  } catch (error) {
    console.error("AI Editorial API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar la solicitud con IA." },
      { status: 500 }
    );
  }
}
