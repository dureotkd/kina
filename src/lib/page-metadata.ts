import "server-only";

import type { Metadata } from "next";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/content-store";
import { getAbsoluteUrl } from "@/lib/seo";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
};

export async function createPageMetadata({
  title,
  description,
  path,
  keywords,
}: PageMetadataOptions): Promise<Metadata> {
  await connection();
  const { seo } = await getSiteContent();
  const pageUrl = getAbsoluteUrl(seo.canonicalUrl, path);

  return {
    title,
    description,
    keywords: [...new Set([...seo.keywords, ...keywords])],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ko_KR",
      siteName: seo.siteName,
      url: pageUrl,
      images: seo.ogImageUrl
        ? [
            {
              url: seo.ogImageUrl,
              width: seo.ogImageWidth,
              height: seo.ogImageHeight,
              alt: seo.ogImageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
  };
}
