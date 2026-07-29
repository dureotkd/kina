import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/content-store";
import { getAbsoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const content = await getSiteContent();
  const lastModified = new Date();

  return [
    {
      url: getAbsoluteUrl(content.seo.canonicalUrl),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: getAbsoluteUrl(content.seo.canonicalUrl, "/resale"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl(content.seo.canonicalUrl, "/bus"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl(content.seo.canonicalUrl, "/community"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: getAbsoluteUrl(content.seo.canonicalUrl, "/announcements"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: getAbsoluteUrl(content.seo.canonicalUrl, "/scammers"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];
}
