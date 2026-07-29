import { MarketplacePage } from "@/components/MarketplacePage";
import { createPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return createPageMetadata({
    title: "아이온2 육성버스 모집 · 거래 | 키나거래소",
    description:
      "아이온2 천족과 마족의 육성버스, 던전, 내실 모집 정보를 서버별로 확인하고 상담하세요.",
    path: "/bus",
    keywords: ["아이온2 육성버스", "아이온2 천족", "아이온2마족"],
  });
}

export default function BusPage() {
  return <MarketplacePage view="buses" />;
}
