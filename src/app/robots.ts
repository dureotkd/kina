import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/content-store";
import { getAbsoluteUrl, normalizeSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  const content = await getSiteContent();
  const siteUrl = normalizeSiteUrl(content.seo.canonicalUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: getAbsoluteUrl(siteUrl, "/sitemap.xml"),
    host: siteUrl,
  };
}
