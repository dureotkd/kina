import { MarketplacePage } from "@/components/MarketplacePage";
import { createPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return createPageMetadata({
    title: "아이온2 거래 사기 제보 · 확인 | 키나거래소",
    description:
      "아이온2 키나 거래 전 사기 피해 사례와 제보 목록을 확인하고 안전한 거래 정보를 공유하세요.",
    path: "/scammers",
    keywords: ["아이온2 거래 사기", "아이온2키나거래", "키나거래소"],
  });
}

export default function ScammersPage() {
  return <MarketplacePage view="scammers" />;
}
