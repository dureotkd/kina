export type CommunityBoardKey =
  | "sales"
  | "buses"
  | "community"
  | "announcements"
  | "scammers";

export type BoardEntryBase = {
  id: string;
  createdAt: string;
  views: number;
};

export type SaleEntry = BoardEntryBase & {
  characterName: string;
  server: string;
  amount: string;
  price: string;
  kakaoUrl: string;
};

export type BusEntry = BoardEntryBase & {
  title: string;
  author: string;
  server: string;
  content: string;
  kakaoUrl: string;
};

export type CommunityComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type CommunityEntry = BoardEntryBase & {
  title: string;
  author: string;
  content: string;
  comments: CommunityComment[];
};

export type AnnouncementEntry = BoardEntryBase & {
  title: string;
  content: string;
  important: boolean;
};

export type ScammerEntry = BoardEntryBase & {
  title: string;
  scammerName: string;
  server: string;
  reporter: string;
  content: string;
};

export type CommunityData = {
  sales: SaleEntry[];
  buses: BusEntry[];
  community: CommunityEntry[];
  announcements: AnnouncementEntry[];
  scammers: ScammerEntry[];
};

export type BoardEntry =
  | SaleEntry
  | BusEntry
  | CommunityEntry
  | AnnouncementEntry
  | ScammerEntry;
