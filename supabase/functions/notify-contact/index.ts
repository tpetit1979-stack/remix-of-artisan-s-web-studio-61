// Sends a plain notification email to a tenant when a visitor submits the
// public contact form. Called client-side, fire-and-forget, right after the
// `contacts` insert succeeds (see src/routes/contact.tsx).
//
// Security model (this endpoint is reachable by anyone, unauthenticated):
//  - the row is "claimed" via a single atomic UPDATE (notified_at IS NULL AND
//    created_at within NOTIFY_WINDOW_MS) — a contactId can trigger at most one
//    email, ever, and only shortly after the real submission. An old or
//    already-used id does nothing, silently.
//  - the response never echoes contact data back to the caller, only
//    { ok: boolean }.
//  - RESEND_API_KEY and the service role key are read from Deno env
//    (Supabase secrets) only — never sent to or readable by the client.
//
// Known tradeoff: notified_at is set before the Resend call, not after — if
// the email send fails past that point, the contact is marked notified but
// no email went out (no retry). Chosen deliberately: "never double-send" is
// worth more here than guaranteed delivery, and the contact stays visible in
// Super Admin either way.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTIFY_WINDOW_MS = 30 * 60 * 1000; // 30 min — blocks replay of an old contactId
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 60; // 60h, within the requested 48-72h window
const CONTACT_UPLOADS_BUCKET = "contact-uploads";

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { contactId } = await req.json().catch(() => ({}));
    if (!contactId || typeof contactId !== "string") {
      return respond(400, { ok: false });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !RESEND_API_KEY) {
      console.error("notify-contact: missing env config");
      return respond(500, { ok: false });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Atomic claim: exists, not already notified, submitted recently. Any
    // failure of these conditions returns 0 rows -- treated uniformly below,
    // no detail leaked about which condition failed.
    const cutoffIso = new Date(Date.now() - NOTIFY_WINDOW_MS).toISOString();
    const { data: contact, error: claimErr } = await supabase
      .from("contacts")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", contactId)
      .is("notified_at", null)
      .gte("created_at", cutoffIso)
      .select("id, tenant_id, name, phone, email, message, photo_urls, service_id")
      .maybeSingle();

    if (claimErr) {
      console.error("notify-contact: claim error", claimErr);
      return respond(500, { ok: false });
    }
    if (!contact) {
      return respond(200, { ok: false });
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("email")
      .eq("id", contact.tenant_id)
      .single();

    if (!tenant?.email?.trim()) {
      // Skip cleanly -- no tenant email configured (real case: 3/17 tenants today).
      return respond(200, { ok: true, skipped: "no_tenant_email" });
    }

    let serviceName: string | null = null;
    if (contact.service_id) {
      const { data: service } = await supabase
        .from("services")
        .select("name")
        .eq("id", contact.service_id)
        .single();
      serviceName = service?.name ?? null;
    }

    const photoLinks: string[] = [];
    for (const path of contact.photo_urls ?? []) {
      const { data: signed } = await supabase.storage
        .from(CONTACT_UPLOADS_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      if (signed?.signedUrl) photoLinks.push(signed.signedUrl);
    }

    const lines = [`Nom : ${contact.name}`, `Téléphone : ${contact.phone ?? "non renseigné"}`];
    if (contact.email) lines.push(`Email : ${contact.email}`);
    if (serviceName) lines.push(`Service concerné : ${serviceName}`);
    lines.push("", "Message :", contact.message?.trim() || "(aucun message)");
    if (photoLinks.length > 0) {
      lines.push("", "Photos jointes :");
      photoLinks.forEach((url, i) => lines.push(`${i + 1}. ${url}`));
      lines.push("", `(liens valables ${Math.round(SIGNED_URL_TTL_SECONDS / 3600)}h)`);
    }
    const text = lines.join("\n");
    const escapedHtml = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("NOTIFY_FROM_EMAIL") || "onboarding@resend.dev",
        to: tenant.email,
        subject: `Nouvelle demande — ${contact.name}`,
        text,
        html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.5">${escapedHtml}</div>`,
      }),
    });

    if (!resendResp.ok) {
      console.error("notify-contact: Resend error", resendResp.status, await resendResp.text());
      return respond(200, { ok: false });
    }

    return respond(200, { ok: true });
  } catch (e) {
    console.error("notify-contact error:", e);
    return respond(500, { ok: false });
  }
});
