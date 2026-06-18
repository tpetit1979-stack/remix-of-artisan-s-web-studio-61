/**
 * Media resolver — UNIQUE source of truth for every image rendered in the app.
 *
 * Strict 3-level fallback hierarchy:
 *   1. tenant_media   → photo uploaded/assigned by the client (or super-admin for them)
 *   2. trade_media_library (via public_trade_media view) → trade template default
 *   3. placeholder neutral SVG → last resort, never breaks layout
 *
 * NO component should read image_url / logo_url / hero_image_url directly.
 * Always go through `useResolvedMedia` (React) or `resolveMedia` (loaders).
 *
 * Realtime: a single subscription per tenant invalidates the matching queries
 * when any row in `tenant_media` for that tenant changes — preview stays live.
 */
import { useEffect } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Domain categories shared across `tenant_media.category` and template mapping. */
export type MediaCategory =
  | "hero"
  | "logo"
  | "favicon"
  | "service"
  | "portfolio"
  | "certification"
  | "gallery"
  | "proof";

/**
 * Tenant categories → ordered list of template `media_type` candidates.
 * The resolver tries each candidate in order until one returns an image.
 * This lets a tenant `portfolio` slot fall back to `gallery` then `proof`,
 * and a `certification` slot fall back to `proof`, while `service` cards
 * stay on the dedicated `service_card` pool.
 */
function templateMediaTypesFor(category: MediaCategory): string[] {
  switch (category) {
    case "hero":
      return ["hero"];
    case "service":
      return ["service_card"];
    case "portfolio":
      return ["gallery", "proof", "service_card"];
    case "certification":
      return ["proof"];
    case "gallery":
      return ["gallery"];
    case "proof":
      return ["proof"];
    case "logo":
    case "favicon":
      // Trade templates never provide a tenant-specific logo/favicon.
      return [];
  }
}

export interface ResolvedMedia {
  url: string;
  alt: string;
  /** Where the image came from — useful for badges in the admin UI. */
  source: "tenant" | "template" | "placeholder";
}

/** Neutral inline SVG so we never depend on a static asset that could 404.
 *  Soft gradient only — never any "Photo à venir" / "Image en cours d'ajout"
 *  text that would visibly admit the absence of an image. */
const PLACEHOLDER_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e5e7eb"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`,
  );

const PLACEHOLDER: ResolvedMedia = {
  url: PLACEHOLDER_DATA_URL,
  alt: "",
  source: "placeholder",
};

export interface ResolveMediaInput {
  tenantId: string | null | undefined;
  tradeTemplateId: string | null | undefined;
  category: MediaCategory;
  /** services.id / portfolio.id / tenant_certifications.id — required for those categories. */
  targetId?: string | null;
  /** Meaningful alt fallback when neither tenant nor template provides one. */
  altFallback?: string | null;
}

/** Stable query key used by both the hook and the Realtime invalidator. */
export function resolvedMediaQueryKey(input: ResolveMediaInput) {
  return [
    "resolved-media",
    input.tenantId ?? null,
    input.category,
    input.targetId ?? null,
    input.tradeTemplateId ?? null,
  ] as const;
}

/**
 * Standalone resolver — usable from route loaders, server functions or anywhere
 * outside React. Same logic as the hook below.
 */
export async function resolveMedia(input: ResolveMediaInput): Promise<ResolvedMedia> {
  const { tenantId, tradeTemplateId, category, targetId, altFallback } = input;

  // Level 1 — tenant override.
  // When `targetId` is provided (service/portfolio/certification card),
  // we look for the exact row first. If none exists for that target,
  // we DO NOT fall back to a global tenant row — we go straight to the
  // template so each card gets its own distinct image.
  if (tenantId) {
    let q = supabase
      .from("tenant_media")
      .select("public_url, alt_text")
      .eq("tenant_id", tenantId)
      .eq("category", category)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1);

    q = targetId
      ? q.eq("target_id" as never, targetId as never)
      : q.is("target_id" as never, null);

    const { data, error } = await q.maybeSingle();
    if (!error && data?.public_url) {
      return {
        url: data.public_url as string,
        alt: ((data.alt_text as string | null) ?? altFallback ?? "").trim(),
        source: "tenant",
      };
    }
  }

  // Level 2 — trade template default.
  // Try each candidate media_type in order. For categories like portfolio
  // (gallery → proof → service_card) this gives richer template coverage.
  // When `targetId` is provided, we deterministically pick the Nth template
  // image (hashed by targetId) so cards stay distinct and stable across
  // renders, instead of all rendering the same first image.
  const candidates = templateMediaTypesFor(category);
  if (tradeTemplateId && candidates.length > 0) {
    for (const mediaType of candidates) {
      const { data, error } = await supabase
        .from("public_trade_media")
        .select("image_path, alt_text")
        .eq("trade_template_id", tradeTemplateId)
        .eq("media_type", mediaType)
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) continue;

      const pick = targetId
        ? data[stableIndex(targetId, data.length)]
        : data[0];

      const { data: pub } = supabase.storage
        .from("trade-media")
        .getPublicUrl(pick.image_path as string);
      return {
        url: pub.publicUrl,
        alt: ((pick.alt_text as string | null) ?? altFallback ?? "").trim(),
        source: "template",
      };
    }
  }

  // Level 3 — neutral placeholder
  return { ...PLACEHOLDER, alt: (altFallback ?? "").trim() };
}

/** Deterministic 0..length-1 index from any string id (FNV-1a hash). */
function stableIndex(id: string, length: number): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash % length;
}

/**
 * React hook — use everywhere a component renders an image.
 * Returns ResolvedMedia immediately (placeholder) while the query loads,
 * then updates with the real value. Never returns null.
 */
export function useResolvedMedia(input: ResolveMediaInput) {
  const qc = useQueryClient();

  // Realtime channel per tenant. We must:
  //  1. Register .on() BEFORE .subscribe() (Supabase throws otherwise).
  //  2. Use a UNIQUE channel name per mount so React StrictMode's
  //     double-invoke doesn't try to attach two listeners on the same
  //     channel name (which triggers
  //     "cannot add postgres_changes callbacks after subscribe()").
  //  3. Always remove the channel on cleanup.
  const tenantId = input.tenantId ?? null;
  useEffect(() => {
    if (!tenantId) return;

    let cancelled = false;
    const channel = supabase.channel(
      `tenant_media:${tenantId}:${Math.random().toString(36).slice(2)}`,
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tenant_media",
        filter: `tenant_id=eq.${tenantId}`,
      },
      () => {
        if (cancelled) return;
        qc.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "resolved-media" &&
            query.queryKey[1] === tenantId,
        });
      },
    );

    channel.subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [tenantId, qc]);

  const query = useQuery({
    queryKey: resolvedMediaQueryKey(input),
    queryFn: () => resolveMedia(input),
    // Resolver result is cheap to recompute and guaranteed non-null.
    staleTime: 30_000,
    placeholderData: { ...PLACEHOLDER, alt: (input.altFallback ?? "").trim() },
  });

  return query.data ?? { ...PLACEHOLDER, alt: (input.altFallback ?? "").trim() };
}

/**
 * Imperative invalidation — call after a successful upload/delete in the
 * Médiathèque so the resolver re-runs immediately for that tenant.
 */
export function invalidateResolvedMedia(qc: QueryClient, tenantId: string) {
  qc.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === "resolved-media" && query.queryKey[1] === tenantId,
  });
}
