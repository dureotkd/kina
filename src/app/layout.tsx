import type { Metadata } from "next";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/content-store";
import { normalizeSiteUrl } from "@/lib/seo";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const { seo } = await getSiteContent();
  const canonicalUrl = normalizeSiteUrl(seo.canonicalUrl);
  const ogImages = seo.ogImageUrl
    ? [
        {
          url: seo.ogImageUrl,
          width: seo.ogImageWidth,
          height: seo.ogImageHeight,
          alt: seo.ogImageAlt,
        },
      ]
    : undefined;

  return {
    metadataBase: new URL(canonicalUrl),
    applicationName: seo.siteName,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: "hbChHAXSDgJVsJiq7H47vX8BdTdd31qefctm5uuEpp0",
    },
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      type: "website",
      locale: "ko_KR",
      siteName: seo.siteName,
      url: canonicalUrl,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
