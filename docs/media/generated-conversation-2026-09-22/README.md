# SUPORDO — Generated media handoff (2026-09-22)

## Purpose

This branch is a handoff point between the ChatGPT image-production conversation and Claude Code.

The conversation currently contains **63 generated image files / 62 unique binary images**. User-supplied brief sheets and reference images were excluded from this inventory.

Families:
- 23 legacy SUPORDO brand / editorial 3D assets
- 11 Atelier du Feu demo assets
- 13 Martin Confort demo assets
- 5 Toitures Durand demo assets
- 11 Berger Électricité demo assets

## Important governance

**Do not import this inventory blindly into `trade_media_library`.**

There are three distinct destinations:

1. **Brand/editorial assets** — historical SUPORDO 3D universe. Keep separate from tenant media.
2. **Demo-company assets** — Atelier du Feu, Martin Confort, Toitures Durand, Berger Électricité. These simulate specific companies and may include company-specific people/vehicles/branding. Keep them scoped to demo tenants.
3. **Generic trade-media candidates** — only images that are generic, unbranded and visually approved may be promoted into Supabase Storage `trade-media` + `trade_media_library`.

The existing product architecture already resolves public images through:
`tenant_media -> trade_media_library -> placeholder`.

Follow `docs/runtime/media/MEDIA_STYLE_GUIDE_V1.md` before approving any media for production use.

## Binary package

ChatGPT prepared a local transfer package named:

`supordo-generated-media-all-2026-09-22.zip`

It contains:
- `raw/`: original generated files
- `webp/`: optimized WebP copies (aspect ratio preserved, long edge <= 1600 px)
- `manifest-all.csv`: inventory, family, dimensions, SHA-256, dedupe and WebP mapping
- `summary.json`

The GitHub connector available to the conversation can write branches/commits but cannot directly stream the local binary files from the ChatGPT container into GitHub/Supabase Storage. Therefore this branch deliberately stores the **handoff specification and inventory**, not fake/empty image placeholders.

Claude Code should import the ZIP contents only after receiving the package, preserving the manifest as the source mapping.

## Rules for Claude Code

- Do not overwrite existing media or change `main` blindly.
- Do not create a second generic media system.
- Do not treat demo-company images as global trade defaults.
- Preserve `source_type = 'ai_generated'` for generated generic media.
- Stage new generic media as `review_status='pending'`, `is_active=false` until visually approved.
- Keep demo-specific assets separate from generic `trade_media_library`.
- Use the manifest SHA-256 to avoid duplicate imports.

## Suggested next technical step

1. Receive/extract the ZIP locally.
2. Review `manifest-all.csv`.
3. Import demo-company assets into the demo-site media path/tenant-specific mechanism chosen by the existing code.
4. Separately shortlist generic candidates.
5. Upload shortlisted generic candidates to Supabase Storage bucket `trade-media`.
6. Insert matching `trade_media_library` rows with provenance metadata.
7. Run media/resolver checks and visual regression checks.
