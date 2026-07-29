import { MarketplacePage } from "@/components/MarketplacePage";
import { createPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return createPageMetadata({
    title: "아이온2 키나 거래 · 판매 · 구매 | 키나거래소",
    description:
      "아이온2 키나 거래소에서 서버별 판매 수량과 구매 가격, 실시간 키나 시세를 확인하세요.",
    path: "/resale",
    keywords: ["아이온2키나거래", "아이온2거래", "아이온2 키나 판매"],
  });
}

export default function ResalePage() {
  return <MarketplacePage view="sales" />;
}
