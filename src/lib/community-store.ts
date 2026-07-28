import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { defaultCommunityData } from "./default-community-data";
import type {
  AnnouncementEntry,
  BoardEntry,
  BusEntry,
  CommunityBoardKey,
  CommunityComment,
  CommunityData,
  CommunityEntry,
  SaleEntry,
  ScammerEntry,
} from "./community-types";

const dataDirectory = path.join(process.cwd(), "data");
const communityFilePath = path.join(dataDirectory, "community-data.json");

let mutationQueue: Promise<unknown> = Promise.resolve();

export async function getCommunityData(): Promise<CommunityData> {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    const raw = await fs.readFile(communityFilePath, "utf8");
    return normalizeCommunityData(JSON.parse(raw) as Partial<CommunityData>);
  } catch (error) {
    if (isMissingFile(error)) {
      await writeCommunityData(defaultCommunityData);
    }

    return defaultCommunityData;
  }
}

export async function writeCommunityData(data: CommunityData) {
  const normalized = normalizeCommunityData(data);
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.writeFile(
    communityFilePath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8",
  );
  return normalized;
}

export function createCommunityEntry(
  type: CommunityBoardKey,
  payload: unknown,
): Promise<BoardEntry> {
  return queueMutation(async () => {
    const data = await getCommunityData();
    const entry = buildEntry(type, payload);
    prependEntry(data, type, entry);
    await writeCommunityData(data);
    return entry;
  });
}

export function addCommunityComment(
  entryId: string,
  payload: unknown,
): Promise<CommunityComment> {
  return queueMutation(async () => {
    const data = await getCommunityData();
    const entry = data.community.find((item) => item.id === entryId);

    if (!entry) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    const source = asRecord(payload);
    const comment: CommunityComment = {
      id: randomUUID(),
      author: requiredText(source.author, "닉네임", 30),
      content: requiredText(source.content, "댓글", 500),
      createdAt: new Date().toISOString(),
    };

    entry.comments.push(comment);
    await writeCommunityData(data);
    return comment;
  });
}

export function incrementEntryViews(
  type: CommunityBoardKey,
  entryId: string,
): Promise<number> {
  return queueMutation(async () => {
    const data = await getCommunityData();
    const entry = data[type].find((item) => item.id === entryId);

    if (!entry) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    entry.views += 1;
    await writeCommunityData(data);
    return entry.views;
  });
}

export function deleteCommunityEntry(
  type: CommunityBoardKey,
  entryId: string,
): Promise<CommunityData> {
  return queueMutation(async () => {
    const data = await getCommunityData();
    removeEntry(data, type, entryId);
    return writeCommunityData(data);
  });
}

function prependEntry(
  data: CommunityData,
  type: CommunityBoardKey,
  entry: BoardEntry,
) {
  if (type === "sales") {
    data.sales = [entry as SaleEntry, ...data.sales];
    return;
  }

  if (type === "buses") {
    data.buses = [entry as BusEntry, ...data.buses];
    return;
  }

  if (type === "community") {
    data.community = [entry as CommunityEntry, ...data.community];
    return;
  }

  if (type === "announcements") {
    data.announcements = [
      entry as AnnouncementEntry,
      ...data.announcements,
    ];
    return;
  }

  data.scammers = [entry as ScammerEntry, ...data.scammers];
}

function removeEntry(
  data: CommunityData,
  type: CommunityBoardKey,
  entryId: string,
) {
  if (type === "sales") {
    data.sales = data.sales.filter((item) => item.id !== entryId);
    return;
  }

  if (type === "buses") {
    data.buses = data.buses.filter((item) => item.id !== entryId);
    return;
  }

  if (type === "community") {
    data.community = data.community.filter((item) => item.id !== entryId);
    return;
  }

  if (type === "announcements") {
    data.announcements = data.announcements.filter(
      (item) => item.id !== entryId,
    );
    return;
  }

  data.scammers = data.scammers.filter((item) => item.id !== entryId);
}

function buildEntry(type: CommunityBoardKey, payload: unknown): BoardEntry {
  const source = asRecord(payload);
  const base = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    views: 0,
  };

  if (type === "sales") {
    return {
      ...base,
      characterName: requiredText(source.characterName, "캐릭터명", 30),
      server: requiredText(source.server, "서버", 30),
      amount: appendUnit(requiredText(source.amount, "판매 수량", 30), "만 키나"),
      price: appendUnit(requiredText(source.price, "판매 가격", 30), "원"),
      kakaoUrl: optionalText(source.kakaoUrl, 300),
    } satisfies SaleEntry;
  }

  if (type === "buses") {
    return {
      ...base,
      title: requiredText(source.title, "제목", 80),
      author: requiredText(source.author, "작성자", 30),
      server: requiredText(source.server, "서버", 30),
      content: requiredText(source.content, "내용", 500),
      kakaoUrl: optionalText(source.kakaoUrl, 300),
    } satisfies BusEntry;
  }

  if (type === "community") {
    return {
      ...base,
      title: requiredText(source.title, "제목", 100),
      author: requiredText(source.author, "작성자", 30),
      content: requiredText(source.content, "내용", 1000),
      comments: [],
    } satisfies CommunityEntry;
  }

  if (type === "announcements") {
    return {
      ...base,
      title: requiredText(source.title, "제목", 100),
      content: requiredText(source.content, "내용", 2000),
      important: Boolean(source.important),
    } satisfies AnnouncementEntry;
  }

  return {
    ...base,
    title: requiredText(source.title, "제목", 100),
    scammerName: requiredText(source.scammerName, "사기꾼 닉네임", 50),
    server: requiredText(source.server, "서버", 30),
    reporter: requiredText(source.reporter, "신고자", 30),
    content: requiredText(source.content, "피해 내용", 1000),
  } satisfies ScammerEntry;
}

function queueMutation<T>(mutation: () => Promise<T>): Promise<T> {
  const task = mutationQueue.then(mutation, mutation);
  mutationQueue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

function normalizeCommunityData(
  data: Partial<CommunityData>,
): CommunityData {
  return {
    sales: Array.isArray(data.sales) ? data.sales : defaultCommunityData.sales,
    buses: Array.isArray(data.buses) ? data.buses : defaultCommunityData.buses,
    community: Array.isArray(data.community)
      ? data.community.map((entry) => ({
          ...entry,
          comments: Array.isArray(entry.comments) ? entry.comments : [],
        }))
      : defaultCommunityData.community,
    announcements: Array.isArray(data.announcements)
      ? data.announcements
      : defaultCommunityData.announcements,
    scammers: Array.isArray(data.scammers)
      ? data.scammers
      : defaultCommunityData.scammers,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("입력값을 확인해주세요.");
  }

  return value as Record<string, unknown>;
}

function requiredText(value: unknown, label: string, maxLength: number) {
  const text = optionalText(value, maxLength);

  if (!text) {
    throw new Error(`${label}을(를) 입력해주세요.`);
  }

  return text;
}

function optionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function appendUnit(value: string, unit: string) {
  return value.endsWith(unit) ? value : `${value}${unit}`;
}

function isMissingFile(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
