"use client";

import {
  Bell,
  Bus,
  MessageCircle,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type {
  AnnouncementEntry,
  BoardEntry,
  CommunityBoardKey,
  CommunityData,
} from "@/lib/community-types";

type BoardTab = {
  id: CommunityBoardKey;
  label: string;
  icon: LucideIcon;
};

const boardTabs: BoardTab[] = [
  { id: "announcements", label: "공지사항", icon: Bell },
  { id: "sales", label: "키나 판매", icon: ShoppingBag },
  { id: "buses", label: "육성버스", icon: Bus },
  { id: "community", label: "자유게시판", icon: MessageCircle },
  { id: "scammers", label: "사기꾼", icon: ShieldAlert },
];

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[#d7cfbf] bg-white px-3 text-sm font-semibold text-[#181512] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10";
const textareaClass =
  "mt-2 min-h-32 w-full resize-y rounded-lg border border-[#d7cfbf] bg-white px-3 py-3 text-sm font-semibold leading-6 text-[#181512] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10";

export function CommunityAdminPanel({
  initialData,
}: {
  initialData: CommunityData;
}) {
  const [data, setData] = useState(initialData);
  const [activeBoard, setActiveBoard] =
    useState<CommunityBoardKey>("announcements");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [important, setImportant] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function addAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "announcements",
        payload: {
          title: noticeTitle,
          content: noticeContent,
          important,
        },
      }),
    });
    const result = (await response.json()) as AnnouncementEntry & {
      message?: string;
    };

    if (!response.ok) {
      setMessage(result.message ?? "공지사항을 등록하지 못했습니다.");
      setBusy(false);
      return;
    }

    setData((current) => ({
      ...current,
      announcements: [result, ...current.announcements],
    }));
    setNoticeTitle("");
    setNoticeContent("");
    setImportant(false);
    setMessage("공지사항이 등록되었습니다.");
    setBusy(false);
  }

  async function removeEntry(type: CommunityBoardKey, id: string) {
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/community", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      setMessage(result.message ?? "게시글을 삭제하지 못했습니다.");
      setBusy(false);
      return;
    }

    const result = (await response.json()) as CommunityData;
    setData(result);
    setMessage("게시글이 삭제되었습니다.");
    setBusy(false);
  }

  const entries = data[activeBoard];

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-black text-[#8b5f10]">게시판</p>
        <h2 className="mt-1 text-2xl font-black">게시판 관리</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#655c4e]">
          사용자 등록글을 확인하고 삭제하거나 새 공지사항을 작성할 수 있습니다.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {boardTabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeBoard;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveBoard(tab.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-black transition ${
                active
                  ? "bg-[#113c3a] text-white"
                  : "bg-[#f5f0e6] text-[#5f574b] hover:bg-[#ece4d5]"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {tab.label} {data[tab.id].length}
            </button>
          );
        })}
      </div>

      {activeBoard === "announcements" ? (
        <form
          onSubmit={addAnnouncement}
          className="grid gap-4 rounded-lg border border-[#e1d8c7] bg-[#faf7f0] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black">공지사항 작성</h3>
              <p className="mt-1 text-xs font-semibold text-[#746b5d]">
                등록 즉시 사용자 공지사항 메뉴에 표시됩니다.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-black text-[#5f574b]">
              <input
                type="checkbox"
                checked={important}
                onChange={(event) => setImportant(event.target.checked)}
                className="h-4 w-4 accent-[#c87818]"
              />
              중요 공지
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-black text-[#4e473c]">제목</span>
            <input
              className={inputClass}
              value={noticeTitle}
              onChange={(event) => setNoticeTitle(event.target.value)}
              placeholder="공지 제목"
              maxLength={100}
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#4e473c]">내용</span>
            <textarea
              className={textareaClass}
              value={noticeContent}
              onChange={(event) => setNoticeContent(event.target.value)}
              placeholder="공지 내용을 입력하세요."
              maxLength={2000}
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#c87818] px-4 text-sm font-black text-white disabled:opacity-60"
          >
            <Plus size={17} aria-hidden="true" />
            {busy ? "등록 중" : "공지 등록"}
          </button>
        </form>
      ) : null}

      {message ? (
        <p className="rounded-lg bg-[#eef6f1] px-3 py-2 text-sm font-bold text-[#176442]">
          {message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-[#e1d8c7]">
        {entries.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm font-bold text-[#8b8172]">
            등록된 글이 없습니다.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-4 border-t border-[#eee7db] px-4 py-4 first:border-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {"important" in entry && entry.important ? (
                    <span className="shrink-0 rounded-full bg-[#fff0dc] px-2 py-1 text-[11px] font-black text-[#a85f0f]">
                      중요
                    </span>
                  ) : null}
                  <h3 className="truncate text-sm font-black">
                    {entryTitle(entry)}
                  </h3>
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#756c5f]">
                  {entrySummary(entry)}
                </p>
                <p className="mt-2 text-[11px] font-bold text-[#9a9185]">
                  {formatDate(entry.createdAt)} · 조회 {entry.views}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeEntry(activeBoard, entry.id)}
                disabled={busy}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#ead6d2] text-[#b94c3f] transition hover:bg-[#fff1ee] disabled:opacity-50"
                aria-label="게시글 삭제"
                title="게시글 삭제"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function entryTitle(entry: BoardEntry) {
  if ("title" in entry) return entry.title;
  return `${entry.server} 서버 / ${entry.characterName}`;
}

function entrySummary(entry: BoardEntry) {
  if ("content" in entry) return entry.content;
  return `${entry.amount} · ${entry.price}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
