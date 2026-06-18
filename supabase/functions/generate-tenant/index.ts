import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { brief } = await req.json();
    if (!brief || typeof brief !== "string" || brief.length > 20000) {
      return new Response(
        JSON.stringify({ error: "Brief requis (max 20000 caractères)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Tu es un assistant spécialisé dans la création de sites web pour artisans du bâtiment en France.
À partir du brief fourni, génère une configuration complète pour un site d'artisan.

Tu DOIS répondre UNIQUEMENT avec l'appel de fonction suggest_tenant_config. Pas de texte en dehors.`;

    const userPrompt = `Brief client :\n${brief}\n\nGénère la configuration complète du tenant.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_tenant_config",
                description:
                  "Génère la configuration complète d'un tenant artisan à partir d'un brief.",
                parameters: {
                  type: "object",
                  properties: {
                    company_name: {
                      type: "string",
                      description: "Nom de l'entreprise",
                    },
                    city: {
                      type: "string",
                      description: "Ville principale",
                    },
                    phone: {
                      type: "string",
                      description: "Numéro de téléphone si mentionné",
                    },
                    email: {
                      type: "string",
                      description: "Email si mentionné",
                    },
                    hero_title: {
                      type: "string",
                      description:
                        "Titre hero accrocheur (max 60 caractères), orienté conversion",
                    },
                    hero_subtitle: {
                      type: "string",
                      description:
                        "Sous-titre hero descriptif (max 160 caractères) avec mots-clés SEO",
                    },
                    cta_text: {
                      type: "string",
                      description: "Texte du bouton CTA (ex: Demander un devis)",
                    },
                    primary_color: {
                      type: "string",
                      description:
                        "Couleur primaire hex adaptée au métier (ex: #D2691E pour chauffage)",
                    },
                    seo_meta_title: {
                      type: "string",
                      description: "Meta title SEO (max 60 caractères)",
                    },
                    seo_meta_description: {
                      type: "string",
                      description: "Meta description SEO (max 160 caractères)",
                    },
                    seo_boost_text: {
                      type: "string",
                      description:
                        "Texte SEO différenciant mentionnant marques, spécialités, certifications",
                    },
                    services: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: {
                            type: "string",
                            description: "Description courte du service (1-2 phrases)",
                          },
                          is_featured: { type: "boolean" },
                        },
                        required: ["name", "description", "is_featured"],
                      },
                      description: "Liste des services proposés (3-8 services)",
                    },
                    cities: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "Liste des villes d'intervention (5-15 villes proches)",
                    },
                  },
                  required: [
                    "company_name",
                    "city",
                    "hero_title",
                    "hero_subtitle",
                    "cta_text",
                    "primary_color",
                    "seo_meta_title",
                    "seo_meta_description",
                    "services",
                    "cities",
                  ],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "suggest_tenant_config" },
          },
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques secondes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés. Ajoutez des crédits dans Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const config = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(config), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-tenant error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Erreur inconnue",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
