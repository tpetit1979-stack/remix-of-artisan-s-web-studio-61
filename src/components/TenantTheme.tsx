import { useTenant } from "@/hooks/use-tenant";
import { useMemo } from "react";

/* ── Font map ── */
const FONT_MAP: Record<string, { family: string; import: string }> = {
  inter: {
    family: "'Inter', sans-serif",
    import: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  outfit: {
    family: "'Outfit', sans-serif",
    import: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap",
  },
  raleway: {
    family: "'Raleway', sans-serif",
    import: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap",
  },
};

/* ── Gradient generators ── */
function buildGradient(style: string, hex: string, oklch: { l: number; c: number; h: number }): string | null {
  const { l, c, h } = oklch;
  const lighter = `oklch(${Math.min(0.85, l * 1.15).toFixed(3)} ${(c * 0.9).toFixed(3)} ${((h + 15) % 360).toFixed(1)})`;
  const darker = `oklch(${(l * 0.7).toFixed(3)} ${(c * 1.1).toFixed(3)} ${((h - 10 + 360) % 360).toFixed(1)})`;

  switch (style) {
    case "diagonal":
      return `linear-gradient(135deg, ${hex}, ${lighter})`;
    case "radial":
      return `radial-gradient(ellipse at top left, ${lighter}, ${hex})`;
    case "dark":
      return `linear-gradient(135deg, ${darker}, ${hex})`;
    case "light-top":
      return `linear-gradient(180deg, ${lighter}, ${hex})`;
    default:
      return null;
  }
}

/**
 * Convert hex color to oklch values.
 */
function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bOk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + bOk * bOk);
  let H = (Math.atan2(bOk, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

/**
 * Generate full theme palette from a single primary color.
 */
function generatePalette(hex: string): Record<string, string> {
  const { l, c, h } = hexToOklch(hex);

  return {
    "--primary": `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`,
    "--primary-foreground": l > 0.6
      ? `oklch(0.15 0.02 ${h.toFixed(1)})`
      : `oklch(0.98 0.003 ${h.toFixed(1)})`,
    "--ring": `oklch(${(l * 0.85).toFixed(3)} ${(c * 0.6).toFixed(3)} ${h.toFixed(1)})`,
    "--accent": `oklch(${Math.min(0.97, l * 1.4).toFixed(3)} ${(c * 0.15).toFixed(3)} ${h.toFixed(1)})`,
    "--accent-foreground": `oklch(${(l * 0.8).toFixed(3)} ${(c * 0.9).toFixed(3)} ${h.toFixed(1)})`,
    "--chart-1": `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`,
    "--chart-2": `oklch(${l.toFixed(3)} ${(c * 0.8).toFixed(3)} ${((h + 60) % 360).toFixed(1)})`,
  };
}

/**
 * Injects tenant CSS custom properties on :root.
 * Handles primary_color, border_radius, gradient_style, font_family.
 */
export function TenantTheme() {
  const { settings } = useTenant();

  const { styleContent, fontImport } = useMemo(() => {
    const color = settings?.primary_color;
    const borderRadius = settings?.border_radius ?? 8;
    const gradientStyle = settings?.gradient_style ?? "flat";
    const fontFamily = settings?.font_family ?? "inter";

    const vars: string[] = [];

    // Color palette
    if (color && /^#[0-9a-fA-F]{6}$/.test(color)) {
      const palette = generatePalette(color);
      Object.entries(palette).forEach(([k, v]) => vars.push(`${k}: ${v};`));

      // Gradient custom property
      const oklch = hexToOklch(color);
      const gradient = buildGradient(gradientStyle, color, oklch);
      if (gradient) {
        vars.push(`--gradient-primary: ${gradient};`);
      }
    }

    // Border radius
    vars.push(`--radius: ${borderRadius}px;`);

    // Font family
    const font = FONT_MAP[fontFamily] ?? FONT_MAP.inter;
    vars.push(`--font-sans: ${font.family};`);

    const css = vars.length ? `:root {\n  ${vars.join("\n  ")}\n}\nbody { font-family: var(--font-sans); }` : null;

    return {
      styleContent: css,
      fontImport: font.import,
    };
  }, [settings?.primary_color, settings?.border_radius, settings?.gradient_style, settings?.font_family]);

  if (!styleContent) return null;

  return (
    <>
      <link rel="stylesheet" href={fontImport} />
      <style dangerouslySetInnerHTML={{ __html: styleContent }} />
    </>
  );
}
