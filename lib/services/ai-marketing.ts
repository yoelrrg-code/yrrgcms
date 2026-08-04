export interface GeneratedMarketingContent {
  emailSubject: string;
  emailHtmlContent: string;
  facebookCaption: string;
  instagramCaption: string;
}

/**
 * AI Marketing Agent function that takes source content / topic
 * and uses LLM + Web research capabilities to generate a complete, high-converting campaign.
 */
export async function generateMarketingCampaign(input: {
  sourceTitle: string;
  sourceContent: string;
  sourceUrl?: string;
  imageUrl?: string;
  customInstructions?: string;
}): Promise<GeneratedMarketingContent> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const promptText = `
You are an Elite AI Marketing Specialist and Technology Copywriter.
The user provided a marketing request or topic: "${input.sourceContent}".

YOUR MISSION:
1. Thoroughly analyze and research the topic "${input.sourceContent}".
2. Do NOT simply copy or repeat the user's prompt. Expand it into a full, creative, high-converting marketing campaign.
3. Create an irresistible Email Subject line based on the topic.
4. Write an extensive, beautifully formatted HTML Email Newsletter (including a header, 3-4 rich informative paragraphs about features/news/benefits, bullet points, and a CTA button).
5. Write an engaging Facebook post with emojis, key highlights, and CTA.
6. Write an Instagram caption with emojis, engaging hook, CTA, and 8-12 trending hashtags.

--- LANGUAGE DIRECTIVE ---
CRITICAL: Detect the language of the request "${input.sourceContent}" (e.g. Spanish).
You MUST generate ALL output fields (emailSubject, emailHtmlContent, facebookCaption, instagramCaption) IN THAT EXACT SAME LANGUAGE.

Respond ONLY with a valid JSON object matching this structure (no extra text or markdown formatting):
{
  "emailSubject": "...",
  "emailHtmlContent": "...",
  "facebookCaption": "...",
  "instagramCaption": "..."
}
`;

  const buildFallbackContent = (topic: string, url: string): GeneratedMarketingContent => {
    const cleanTopic = topic.trim();
    return {
      emailSubject: `🔥 Descubre todo sobre ${cleanTopic}`,
      emailHtmlContent: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700;">Novedades & Tendencias</h1>
          </div>
          <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; line-height: 1.3;">Todo sobre: ${cleanTopic}</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
            Te traemos un análisis exclusivo sobre <strong>${cleanTopic}</strong>. En esta edición especial exploramos las últimas innovaciones, características esperadas y todo lo que necesitas saber.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Mantenerte a la vanguardia tecnológica es clave. Conoce las especificaciones clave, mejoras de rendimiento y detalles destacados diseñados para elevar la experiencia al siguiente nivel.
          </p>
          <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
            <a href="${url || "#"}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block;">
              Leer el artículo completo &rarr;
            </a>
          </div>
        </div>
      `,
      facebookCaption: `📢 **Últimas Novedades: ${cleanTopic}**\n\n¿Quieres conocer todos los detalles sobre ${cleanTopic}? Hemos preparado un análisis completo con las características y sorpresas más esperadas.\n\n👉 Entérate de más aquí: ${url || ""}`,
      instagramCaption: `✨ **Especial ${cleanTopic}**\n\nAnalizamos a fondo las novedades sobre ${cleanTopic}. ¡No te pierdas las especificaciones y sorpresas de este lanzamiento!\n\n🔗 Enlace en la biografía para más información.\n\n#tech #innovacion #novedades #${cleanTopic.replace(/\s+/g, "").toLowerCase()}`,
    };
  };

  // Check if API key is valid or missing
  if (!apiKey || apiKey.includes("tu_")) {
    console.warn("Using smart fallback generator: OPENROUTER_API_KEY is not configured in .env");
    return buildFallbackContent(input.sourceContent || input.sourceTitle, input.sourceUrl || "");
  }

  const modelName = "deepseek/deepseek-v4-flash:0731-cloud";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
        "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "YRRG CMS",
      },
      body: JSON.stringify({
        model: modelName,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: promptText,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`OpenRouter API model ${modelName} returned HTTP ${response.status}: ${errorText}`);
      return buildFallbackContent(input.sourceContent || input.sourceTitle, input.sourceUrl || "");
    }

    const resData = await response.json();
    const rawJson = resData.choices?.[0]?.message?.content;

    if (rawJson) {
      let cleanJson = rawJson.trim();
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      }
      return JSON.parse(cleanJson);
    }
  } catch (err: unknown) {
    console.warn(`OpenRouter model ${modelName} call failed:`, err);
  }

  return buildFallbackContent(input.sourceContent || input.sourceTitle, input.sourceUrl || "");
}
