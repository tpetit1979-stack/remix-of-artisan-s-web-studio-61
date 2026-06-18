import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type QualitenrData = {
  description: string;
  competences: string[];
  logo_url: string;
  certifications: { name: string; logo_url: string; cert_url: string }[];
  photos: string[];
  address: string;
  phone: string;
};

const inputSchema = z.object({
  companyName: z.string().min(1),
});

/**
 * Build a slug from company name to match qualit-enr.org URL pattern.
 * "ATEXE GROUP" → "atexe-group"
 * "BOIS ENERGIE SUD" → "bois-energie-sud"
 */
function toQualitenrSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractBetween(html: string, startMarker: string, endMarker: string): string {
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) return "";
  const afterStart = startIdx + startMarker.length;
  const endIdx = html.indexOf(endMarker, afterStart);
  if (endIdx === -1) return html.slice(afterStart);
  return html.slice(afterStart, endIdx);
}

export const scrapeQualitenr = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<QualitenrData> => {
    const slug = toQualitenrSlug(data.companyName);
    const url = `https://www.qualit-enr.org/entreprises/${slug}/`;

    const empty: QualitenrData = {
      description: "",
      competences: [],
      logo_url: "",
      certifications: [],
      photos: [],
      address: "",
      phone: "",
    };

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LovableBot/1.0)",
          Accept: "text/html",
        },
      });

      if (!res.ok) {
        console.error(`Qualit'EnR page not found: ${res.status} for ${url}`);
        return empty;
      }

      const html = await res.text();

      // Extract description: text between </figure> (after logo) and "Nos compétences"
      let description = "";
      // Look for the main content area - paragraphs after the company logo
      const descMatch = html.match(
        /class="company-description"[^>]*>([\s\S]*?)<\/div>/i
      );
      if (descMatch) {
        description = descMatch[1]
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      } else {
        // Fallback: extract paragraphs from the entry-content area
        const contentMatch = html.match(
          /class="entry-content[^"]*"[^>]*>([\s\S]*?)(?:<h2|<div class="company-skills|<section)/i
        );
        if (contentMatch) {
          // Get only <p> tags content
          const pTags = contentMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
          description = pTags
            .map((p) => p.replace(/<[^>]+>/g, "").trim())
            .filter((t) => t.length > 20)
            .join("\n\n");
        }
      }

      // If still no description, try broader approach
      if (!description) {
        // Get text between h1 and "Nos compétences" heading
        const h1Idx = html.indexOf("</h1>");
        const compIdx = html.indexOf("Nos comp");
        if (h1Idx > -1 && compIdx > h1Idx) {
          const section = html.slice(h1Idx + 5, compIdx);
          const pTags = section.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
          description = pTags
            .map((p) => p.replace(/<[^>]+>/g, "").trim())
            .filter((t) => t.length > 20)
            .join("\n\n");
        }
      }

      // Extract competences list
      const competences: string[] = [];
      const skillsSection = extractBetween(html, "Nos comp", "Certificats de qualification");
      if (skillsSection) {
        const liMatches = skillsSection.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
        for (const li of liMatches) {
          const text = li.replace(/<[^>]+>/g, "").trim();
          if (text.length > 2) competences.push(text);
        }
      }

      // Extract company logo
      let logo_url = "";
      const logoMatch = html.match(
        /class="[^"]*company[^"]*logo[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i
      );
      if (logoMatch) {
        logo_url = logoMatch[1];
      } else {
        // Fallback: first image in the content after h1
        const h1Pos = html.indexOf("</h1>");
        if (h1Pos > -1) {
          const afterH1 = html.slice(h1Pos, h1Pos + 2000);
          const imgMatch = afterH1.match(/<img[^>]+src="(https:\/\/www\.qualit-enr\.org\/wp-content\/uploads\/[^"]+)"/i);
          if (imgMatch) logo_url = imgMatch[1];
        }
      }

      // Extract certification logos and links
      const certifications: { name: string; logo_url: string; cert_url: string }[] = [];
      const certSection = extractBetween(html, "Certificats de qualification", "Nous contacter");
      if (certSection) {
        // Find cert blocks with logo + download link
        const certBlocks = certSection.match(/<img[^>]+src="([^"]+Logo[^"]*RGE[^"]*)"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>/gi) || [];
        for (const block of certBlocks) {
          const imgM = block.match(/src="([^"]+)"/);
          const linkM = block.match(/href="([^"]+)"/);
          const nameM = block.match(/Logo-([^-]+)-RGE/i);
          certifications.push({
            name: nameM ? nameM[1] : "RGE",
            logo_url: imgM ? imgM[1] : "",
            cert_url: linkM ? linkM[1] : "",
          });
        }
      }

      // Extract photos (carousel images)
      const photos: string[] = [];
      const photoMatches = html.match(
        /src="(https:\/\/www\.qualit-enr\.org\/wp-content\/uploads\/[^"]+\.(jpg|jpeg|png|webp))"/gi
      ) || [];
      for (const m of photoMatches) {
        const urlM = m.match(/src="([^"]+)"/);
        if (urlM && !urlM[1].includes("logo") && !urlM[1].includes("Logo") && !urlM[1].includes("icon") && !urlM[1].includes("audit")) {
          if (!photos.includes(urlM[1])) photos.push(urlM[1]);
        }
      }

      // Extract phone
      let phone = "";
      const phoneMatch = html.match(/href="tel:([^"]+)"/);
      if (phoneMatch) phone = phoneMatch[1].trim();

      // Extract address
      let address = "";
      const addrMatch = html.match(/(\d{1,4}\s+(?:rue|avenue|boulevard|chemin|impasse|place|allée|route)[^<]+)/i);
      if (addrMatch) address = addrMatch[1].trim();

      return {
        description,
        competences,
        logo_url,
        certifications,
        photos,
        address,
        phone,
      };
    } catch (err) {
      console.error("Qualit'EnR scraping error:", err);
      return empty;
    }
  });
