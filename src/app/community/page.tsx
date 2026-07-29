import { MarketplacePage } from "@/components/MarketplacePage";
import { createPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return createPageMetadata({
    title: "아이온2 거래 정보 자유게시판 | 아이온거래소",
    description:
      "아이온2 키나 시세와 천족·마족 서버별 거래 정보를 자유롭게 공유하는 게시판입니다.",
    path: "/community",
    keywords: ["아이온2거래소", "아이온거래소", "아이온2 거래 정보"],
  });
}

export default function CommunityPage() {
  return <MarketplacePage view="community" />;
}
