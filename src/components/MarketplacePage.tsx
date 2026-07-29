import {
  PublicExchange,
  type MarketplaceView,
} from "@/components/PublicExchange";
import { getCommunityData } from "@/lib/community-store";
import { getSiteContent } from "@/lib/content-store";
import { normalizeSiteUrl } from "@/lib/seo";

export async function MarketplacePage({
  view,
}: {
  view: MarketplaceView;
}) {
  const [content, communityData] = await Promise.all([
    getSiteContent(),
    getCommunityData(),
  ]);
  const structuredData =
    view === "home" ? createHomeStructuredData(content) : null;

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <PublicExchange
        content={content}
        initialCommunityData={communityData}
        view={view}
      />
    </>
  );
}

function createHomeStructuredData(
  content: Awaited<ReturnType<typeof getSiteContent>>,
) {
  const siteUrl = normalizeSiteUrl(content.seo.canonicalUrl);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: content.seo.siteName,
        alternateName: ["키나거래소", "아이온2거래소", "아이온거래소"],
        inLanguage: "ko-KR",
      },
      {
        "@type": "WebPage",
        "@id": siteUrl,
        url: siteUrl,
        name: content.seo.title,
        description: content.seo.description,
        isPartOf: {
          "@id": `${siteUrl}#website`,
        },
        about: [
          { "@type": "Thing", name: "아이온2 키나 거래" },
          { "@type": "Thing", name: "아이온2 키나 시세" },
          { "@type": "Thing", name: "아이온2 천족과 마족 거래" },
        ],
        inLanguage: "ko-KR",
      },
    ],
  };
}
