import { MarketplacePage } from "@/components/MarketplacePage";
import { createPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return createPageMetadata({
    title: "아이온2 키나 거래소 공지사항",
    description:
      "아이온2 키나 판매·구매와 거래소 이용 전 확인해야 할 운영 공지와 안전 거래 안내입니다.",
    path: "/announcements",
    keywords: ["키나거래소 공지", "아이온2키나거래", "아이온2 안전거래"],
  });
}

export default function AnnouncementsPage() {
  return <MarketplacePage view="announcements" />;
}
