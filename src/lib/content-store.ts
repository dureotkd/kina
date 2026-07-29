import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { defaultSiteContent } from "./default-content";
import type { SiteContent } from "./site-types";

const dataDirectory = path.join(process.cwd(), "data");
const contentFilePath = path.join(dataDirectory, "site-content.json");
const uploadDirectory = path.join(process.cwd(), "public", "uploads");

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const maxUploadBytes = 5 * 1024 * 1024;

export async function getSiteContent(): Promise<SiteContent> {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    const raw = await fs.readFile(contentFilePath, "utf8");
    return normalizeContent(JSON.parse(raw) as Partial<SiteContent>);
  } catch (error) {
    if (isMissingFile(error)) {
      await writeSiteContent(defaultSiteContent);
    }

    return defaultSiteContent;
  }
}

export async function writeSiteContent(content: SiteContent) {
  const normalized = normalizeContent(content);
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.writeFile(
    contentFilePath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8",
  );
  return normalized;
}

export async function saveUploadedImage(file: File) {
  if (!imageTypes.has(file.type)) {
    throw new Error("지원하지 않는 이미지 형식입니다.");
  }

  if (file.size > maxUploadBytes) {
    throw new Error("이미지는 5MB 이하만 업로드할 수 있습니다.");
  }

  const extension = imageTypes.get(file.type);
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const destination = path.join(uploadDirectory, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(destination, bytes);

  return `/uploads/${fileName}`;
}

function normalizeContent(content: Partial<SiteContent>): SiteContent {
  return {
    ...defaultSiteContent,
    ...content,
    seo: {
      ...defaultSiteContent.seo,
      ...content.seo,
      keywords: content.seo?.keywords?.length
        ? content.seo.keywords
        : defaultSiteContent.seo.keywords,
    },
    brand: {
      ...defaultSiteContent.brand,
      ...content.brand,
    },
    navigation: content.navigation?.length
      ? content.navigation
      : defaultSiteContent.navigation,
    hero: {
      ...defaultSiteContent.hero,
      ...content.hero,
      trustBadges: content.hero?.trustBadges?.length
        ? content.hero.trustBadges
        : defaultSiteContent.hero.trustBadges,
      stats: content.hero?.stats?.length
        ? content.hero.stats
        : defaultSiteContent.hero.stats,
    },
    noticeModal: {
      ...defaultSiteContent.noticeModal,
      ...content.noticeModal,
    },
    market: {
      ...defaultSiteContent.market,
      ...content.market,
      buy: {
        ...defaultSiteContent.market.buy,
        ...content.market?.buy,
      },
      sell: {
        ...defaultSiteContent.market.sell,
        ...content.market?.sell,
      },
      notes: content.market?.notes?.length
        ? content.market.notes
        : defaultSiteContent.market.notes,
    },
    exchanges: content.exchanges?.length
      ? content.exchanges
      : defaultSiteContent.exchanges,
    sellers: content.sellers?.length ? content.sellers : defaultSiteContent.sellers,
    services: content.services?.length
      ? content.services
      : defaultSiteContent.services,
    support: {
      ...defaultSiteContent.support,
      ...content.support,
    },
    footer: {
      ...defaultSiteContent.footer,
      ...content.footer,
      links: content.footer?.links?.length
        ? content.footer.links
        : defaultSiteContent.footer.links,
    },
  };
}

function isMissingFile(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
