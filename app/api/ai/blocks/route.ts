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
        { error: "OpenRouter API Key no está configurada." },
        { status: 500 }
      );
    }

    const { prompt, type } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Se requiere prompt de descripción." },
        { status: 400 }
      );
    }

    let systemInstruction = "";
    let userMessage = "";

    if (type === "page_blocks") {
      systemInstruction = `Sos un diseñador web y arquitecto de contenido para YRRG CMS.
Tus respuestas deben ser ÚNICAMENTE un arreglo JSON (Array) válido de bloques de página con la estructura esperada, sin markdown \`\`\`json ni texto explicativo.

Los tipos de bloques disponibles y sus campos son:
1. HeroBanner:
   {
     "type": "HeroBanner",
     "props": {
       "title": "...",
       "subtitle": "...",
       "badgeText": "...",
       "buttonText": "...",
       "buttonUrl": "/cursos",
       "secondaryButtonText": "Saber más",
       "secondaryButtonUrl": "#features",
       "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80"
     }
   }

2. TestimonialsBlock:
   {
     "type": "TestimonialsBlock",
     "props": {
       "title": "Lo que dicen nuestros estudiantes",
       "subtitle": "Testimonios reales de profesionales que se capacitaron con nosotros",
       "testimonials": [
         { "id": "t1", "name": "...", "role": "...", "company": "...", "content": "...", "avatar": "https://i.pravatar.cc/150?u=1", "rating": 5 }
       ]
     }
   }

3. PricingTable:
   {
     "type": "PricingTable",
     "props": {
       "title": "Planes y Precios",
       "subtitle": "Elegí el plan ideal para tu crecimiento",
       "plans": [
         { "id": "p1", "name": "Inicial", "price": 49, "billingPeriod": "mes", "description": "...", "features": ["..."], "ctaText": "Comenzar hoy", "ctaUrl": "/cursos", "highlighted": false },
         { "id": "p2", "name": "Pro", "price": 99, "billingPeriod": "mes", "description": "...", "features": ["..."], "ctaText": "Obtener acceso Pro", "ctaUrl": "/cursos", "highlighted": true }
       ]
     }
   }

4. CallToAction:
   {
     "type": "CallToAction",
     "props": {
       "title": "...",
       "subtitle": "...",
       "buttonText": "...",
       "buttonUrl": "/cursos"
     }
   }

5. ContactFormBlock:
   {
     "type": "ContactFormBlock",
     "props": {
       "title": "Ponete en contacto",
       "subtitle": "Estamos acá para responder todas tus dudas.",
       "submitButtonText": "Enviar mensaje"
     }
   }

Generá un arreglo de bloques coherentes con el tema pedido.`;

      userMessage = `Diseñá los bloques para una página web sobre: "${prompt}"`;
    } else if (type === "course_outline") {
      systemInstruction = `Sos un experto en pedagogía y diseño curricular para plataformas de e-learning.
Respondé ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
{
  "title": "Título sugerido del curso",
  "shortDescription": "Descripción corta y atractiva",
  "description": "Descripción completa y fundamentación pedagógica en HTML limpio (<p>, <ul>, <strong>)",
  "level": "Principiante" | "Intermedio" | "Avanzado",
  "price": 99,
  "currency": "USD",
  "modules": [
    {
      "title": "Módulo 1: ...",
      "description": "...",
      "lessons": [
        { "title": "Lección 1.1: ...", "durationMinutes": 15, "description": "..." },
        { "title": "Lección 1.2: ...", "durationMinutes": 20, "description": "..." }
      ]
    }
  ]
}
Sin bloques \`\`\`json ni texto explicativo.`;

      userMessage = `Diseñá el temario completo del curso sobre: "${prompt}"`;
    } else {
      return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
        "X-Title": "YRRG CMS Block Architect",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash:0731-cloud",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.error?.message || "Error al comunicarse con OpenRouter API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    let rawContent = data.choices?.[0]?.message?.content || "";

    // Limpieza de marcadores de markdown json si los hubiera
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsedJson = JSON.parse(rawContent);
      return NextResponse.json({ result: parsedJson });
    } catch (parseErr) {
      console.error("JSON parse error from DeepSeek:", rawContent);
      return NextResponse.json({
        error: "El modelo devolvió un JSON inválido. Reintentá tu solicitud.",
        raw: rawContent
      }, { status: 500 });
    }
  } catch (error) {
    console.error("AI Blocks API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar bloques de IA." },
      { status: 500 }
    );
  }
}
