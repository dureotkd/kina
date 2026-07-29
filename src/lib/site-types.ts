export type QuoteTrend = "up" | "down" | "flat";

export type PriceQuote = {
  label: string;
  price: string;
  unit: string;
  change: string;
  trend: QuoteTrend;
};

export type ExchangeSection = {
  id: string;
  title: string;
  description: string;
  buyLabel: string;
  buyPrice: string;
  sellLabel: string;
  sellPrice: string;
  unit: string;
  features: string[];
};

export type SellerListing = {
  id: string;
  server: string;
  seller: string;
  price: string;
  unit: string;
  amount: string;
  timeAgo: string;
  contactLabel: string;
  featured: boolean;
};

export type ServiceCard = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  actionLabel: string;
  href: string;
};

export type NoticeModal = {
  enabled: boolean;
  title: string;
  body: string;
  buttonLabel: string;
};

export type SeoSettings = {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  ogImageAlt: string;
  ogImageWidth: number;
  ogImageHeight: number;
};

export type SiteContent = {
  seo: SeoSettings;
  brand: {
    name: string;
    shortName: string;
    logoUrl: string;
    logoAlt: string;
    heroImageUrl: string;
    heroImageAlt: string;
    noticeTitle: string;
    noticeBody: string;
    kakaoId: string;
    kakaoUrl: string;
  };
  navigation: {
    label: string;
    href: string;
  }[];
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    trustBadges: string[];
    stats: {
      label: string;
      value: string;
      helper: string;
    }[];
  };
  noticeModal: NoticeModal;
  market: {
    title: string;
    description: string;
    baseUnit: string;
    updatedAt: string;
    paymentNotice: string;
    buy: PriceQuote;
    sell: PriceQuote;
    notes: string[];
  };
  exchanges: ExchangeSection[];
  sellers: SellerListing[];
  services: ServiceCard[];
  support: {
    title: string;
    description: string;
    hours: string;
    response: string;
    kakaoLabel: string;
    kakaoImageUrl: string;
  };
  footer: {
    companyName: string;
    description: string;
    links: string[];
    copyright: string;
  };
};
