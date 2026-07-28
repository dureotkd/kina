import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "아이온2 키나 거래소 | 시세 · 판매 · 구매";
const siteDescription =
  "아이온2 키나 실시간 시세 확인, 안전한 거래, 대리판매 서비스를 제공합니다. 월드거래소, 일반거래소 시세를 한눈에 확인하세요.";
const socialImageUrl =
  "https://fizz-download.playnccdn.com/download/v2/buckets/purple/files/19912837684-7f24d48d-b1c8-422a-8a36-f6009a287f32";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: socialImageUrl,
        width: 3840,
        height: 2160,
        alt: "아이온2 키나 거래소",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImageUrl],
  },
};

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
