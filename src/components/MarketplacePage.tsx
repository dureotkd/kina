import {
  PublicExchange,
  type MarketplaceView,
} from "@/components/PublicExchange";
import { getCommunityData } from "@/lib/community-store";
import { getSiteContent } from "@/lib/content-store";

export async function MarketplacePage({
  view,
}: {
  view: MarketplaceView;
}) {
  const [content, communityData] = await Promise.all([
    getSiteContent(),
    getCommunityData(),
  ]);

  return (
    <PublicExchange
      content={content}
      initialCommunityData={communityData}
      view={view}
    />
  );
}
