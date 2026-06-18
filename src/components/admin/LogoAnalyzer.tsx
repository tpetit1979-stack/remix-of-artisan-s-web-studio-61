import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Variant = {
  name: string;
  description?: string;
  primary_color: string;
  gradient_style: string;
  font_family: string;
  header_style: string;
  border_radius: number;
};

type Analysis = {
  palette: { primary: string; secondary?: string; accent?: string };
  style: string;
  mood?: string;
  variants: Variant[];
  analyzed_at?: string;
};

interface Props {
  logoUrl: string | null;
  tenantId: string;
  tradeName?: string;
  cachedAnalysis: Analysis | null;
  onApply: (variant: Variant) => void;
  onAnalyzed: (analysis: Analysis) => void;
}

/* ── Extraction couleurs 100% gratuite via canvas ── */
async function extractDominantColor(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          // skip very light or very dark (likely background)
          const lum = (r + g + b) / 3;
          if (lum > 240 || lum < 15) continue;
          // skip near-grey
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          if (max - min < 20) continue;
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const bucket = buckets.get(key);
          if (bucket) {
            bucket.r += r; bucket.g += g; bucket.b += b; bucket.count++;
          } else {
            buckets.set(key, { r, g, b, count: 1 });
          }
        }
        let best: { r: number; g: number; b: number; count: number } | null = null;
        for (const v of buckets.values()) {
          if (!best || v.count > best.count) best = v;
        }
        if (!best) return resolve(null);
        const r = Math.round(best.r / best.count);
        const g = Math.round(best.g / best.count);
        const b = Math.round(best.b / best.count);
        resolve("#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join(""));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function LogoAnalyzer({ logoUrl, tenantId, tradeName, cachedAnalysis, onApply, onAnalyzed }: Props) {
  const [loading, setLoading] = useState(false);
  const [quickColor, setQuickColor] = useState<string | null>(null);

  async function handleQuickExtract() {
    if (!logoUrl) return;
    setLoading(true);
    const color = await extractDominantColor(logoUrl);
    setLoading(false);
    if (!color) {
      toast.error("Impossible d'extraire la couleur");
      return;
    }
    setQuickColor(color);
    toast.success(`Couleur dominante détectée : ${color}`);
  }

  async function handleAIAnalyze() {
    if (!logoUrl) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-logo", {
        body: { logo_url: logoUrl, trade_name: tradeName },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Cache result
      await supabase
        .from("site_settings")
        .update({ ai_analysis: data })
        .eq("tenant_id", tenantId);

      onAnalyzed(data);
      toast.success("Analyse IA terminée");
    } catch (e: any) {
      toast.error(e.message || "Échec de l'analyse");
    } finally {
      setLoading(false);
    }
  }

  if (!logoUrl) {
    return (
      <p className="text-sm text-muted-foreground">
        Uploadez d'abord votre logo pour activer l'analyse de marque.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleQuickExtract}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Extraction rapide (gratuit)
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleAIAnalyze}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Analyser avec l'IA
        </Button>
      </div>

      {/* Quick color result */}
      {quickColor && !cachedAnalysis && (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <div className="h-10 w-10 rounded-lg border" style={{ backgroundColor: quickColor }} />
          <div className="flex-1">
            <p className="text-sm font-medium">Couleur dominante</p>
            <p className="text-xs text-muted-foreground font-mono">{quickColor}</p>
          </div>
          <Button size="sm" onClick={() => onApply({
            name: "Quick",
            primary_color: quickColor,
            gradient_style: "flat",
            font_family: "inter",
            header_style: "solid",
            border_radius: 8,
          })}>
            Appliquer
          </Button>
        </div>
      )}

      {/* AI variants */}
      {cachedAnalysis && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Style détecté : <span className="font-medium text-foreground">{cachedAnalysis.style}</span></span>
            {cachedAnalysis.mood && <span>· {cachedAnalysis.mood}</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cachedAnalysis.variants.map((v) => (
              <Card key={v.name} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{v.name}</p>
                  <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: v.primary_color }} />
                </div>
                {v.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{v.description}</p>
                )}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Couleur</span><span className="font-mono">{v.primary_color}</span></div>
                  <div className="flex justify-between"><span>Police</span><span>{v.font_family}</span></div>
                  <div className="flex justify-between"><span>Header</span><span>{v.header_style}</span></div>
                </div>
                <Button size="sm" className="w-full gap-1" onClick={() => onApply(v)}>
                  <Check className="h-3.5 w-3.5" /> Appliquer
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
