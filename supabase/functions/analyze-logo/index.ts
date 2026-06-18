// Analyse un logo via Lovable AI (gemini-2.5-flash-lite, vision + tool calling)
// Retourne palette + style + 3 variantes de design cohérentes

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { logo_url, trade_name } = await req.json();
    if (!logo_url) {
      return new Response(JSON.stringify({ error: "logo_url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `Tu es un expert en design de marque pour artisans français${
      trade_name ? ` (métier: ${trade_name})` : ""
    }. Analyse le logo fourni et propose une identité visuelle cohérente.`;

    const userPrompt = `Analyse ce logo et retourne :
1. La palette dominante (couleur principale en hex)
2. Le style perçu (moderne, traditionnel, industriel, premium, chaleureux...)
3. Trois variantes de design pour son site web :
   - "Fidèle" : reprend exactement les couleurs et l'esprit du logo
   - "Harmonique" : palette complémentaire raffinée (théorie des couleurs)
   - "Premium" : version sombre/élégante, plus haut de gamme

Pour chaque variante, propose : primary_color (hex), gradient_style (flat/diagonal/radial/dark/light-top), font_family (inter/outfit/raleway), header_style (solid/gradient/dark/light), border_radius (0-16).`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: logo_url } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_brand_analysis",
              description: "Retourne l'analyse de marque structurée",
              parameters: {
                type: "object",
                properties: {
                  palette: {
                    type: "object",
                    properties: {
                      primary: { type: "string", description: "Hex #RRGGBB" },
                      secondary: { type: "string" },
                      accent: { type: "string" },
                    },
                    required: ["primary"],
                  },
                  style: { type: "string", description: "Ex: moderne, industriel, premium" },
                  mood: { type: "string", description: "Ex: professionnel, chaleureux, technique" },
                  variants: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", enum: ["Fidèle", "Harmonique", "Premium"] },
                        description: { type: "string" },
                        primary_color: { type: "string" },
                        gradient_style: { type: "string", enum: ["flat", "diagonal", "radial", "dark", "light-top"] },
                        font_family: { type: "string", enum: ["inter", "outfit", "raleway"] },
                        header_style: { type: "string", enum: ["solid", "gradient", "dark", "light"] },
                        border_radius: { type: "number" },
                      },
                      required: ["name", "primary_color", "gradient_style", "font_family", "header_style", "border_radius"],
                    },
                  },
                },
                required: ["palette", "style", "variants"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_brand_analysis" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit, réessayez dans un instant." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits Lovable AI épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    analysis.analyzed_at = new Date().toISOString();

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-logo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
