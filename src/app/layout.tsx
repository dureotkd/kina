import type { Metadata } from "next";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/content-store";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const { seo } = await getSiteContent();
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
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      type: "website",
      locale: "ko_KR",
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
