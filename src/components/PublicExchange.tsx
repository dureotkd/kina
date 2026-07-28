/* eslint-disable @next/next/no-img-element -- Logo and Kakao images are managed by the admin CMS. */

"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bell,
  Bus,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  Home,
  Info,
  MessageCircle,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import type {
  AnnouncementEntry,
  BoardEntry,
  BusEntry,
  CommunityBoardKey,
  CommunityData,
  CommunityEntry,
  SaleEntry,
  ScammerEntry,
} from "@/lib/community-types";
import type { PriceQuote, SiteContent } from "@/lib/site-types";

export type MarketplaceView =
  | "home"
  | "sales"
  | "buses"
  | "community"
  | "announcements"
  | "scammers";

type PublicExchangeProps = {
  content: SiteContent;
  initialCommunityData: CommunityData;
  view?: MarketplaceView;
};

type FormMode = Exclude<MarketplaceView, "home" | "announcements">;

type FormValues = {
  title: string;
  characterName: string;
  author: string;
  server: string;
  amount: string;
  price: string;
  kakaoUrl: string;
  scammerName: string;
  reporter: string;
  content: string;
};

const shellClass = "mx-auto w-full max-w-[1024px] px-4 sm:px-6";
const panelClass = "rounded-lg border border-[#e2e6ec] bg-white shadow-sm";
const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[#d8dde5] bg-white px-3 text-sm font-semibold text-[#1c2430] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10";
const textareaClass =
  "mt-2 min-h-32 w-full resize-y rounded-lg border border-[#d8dde5] bg-white px-3 py-3 text-sm font-semibold leading-6 text-[#1c2430] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10";

const navigation: {
  view: Exclude<MarketplaceView, "home">;
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
}[] = [
  {
    view: "sales",
    label: "키나 판매",
    href: "/resale",
    icon: ShoppingBag,
    color: "#0f766e",
  },
  {
    view: "buses",
    label: "육성버스",
    href: "/bus",
    icon: Bus,
    color: "#4f5fc7",
  },
  {
    view: "community",
    label: "자유게시판",
    href: "/community",
    icon: MessageCircle,
    color: "#7656c9",
  },
  {
    view: "announcements",
    label: "공지사항",
    href: "/announcements",
    icon: Bell,
    color: "#c87818",
  },
  {
    view: "scammers",
    label: "사기꾼",
    href: "/scammers",
    icon: ShieldAlert,
    color: "#c54249",
  },
];

const emptyForm: FormValues = {
  title: "",
  characterName: "",
  author: "",
  server: "",
  amount: "",
  price: "",
  kakaoUrl: "",
  scammerName: "",
  reporter: "",
  content: "",
};

export function PublicExchange({
  content,
  initialCommunityData,
  view = "home",
}: PublicExchangeProps) {
  const [communityData, setCommunityData] = useState(initialCommunityData);
  const [noticeOpen, setNoticeOpen] = useState(
    view === "home" && content.noticeModal.enabled,
  );
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [selectedEntry, setSelectedEntry] = useState<{
    type: CommunityBoardKey;
    entry: BoardEntry;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const contactHref = content.brand.kakaoUrl || "#";

  function openForm(mode: FormMode) {
    setFormValues(emptyForm);
    setFormMessage("");
    setFormMode(mode);
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formMode) return;

    const type = viewToBoardKey(formMode);
    setSubmitting(true);
    setFormMessage("");

    const response = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        payload: formValues,
      }),
    });

    const result = (await response.json()) as BoardEntry & { message?: string };

    if (!response.ok) {
      setFormMessage(result.message ?? "등록하지 못했습니다.");
      setSubmitting(false);
      return;
    }

    setCommunityData((current) => ({
      ...current,
      [type]: [result, ...current[type]],
    }));
    setFormMode(null);
    setSubmitting(false);
  }

  async function openDetail(type: CommunityBoardKey, entry: BoardEntry) {
    const updatedEntry = { ...entry, views: entry.views + 1 };
    setSelectedEntry({ type, entry: updatedEntry });
    setCommunityData((current) => ({
      ...current,
      [type]: current[type].map((item) =>
        item.id === entry.id ? updatedEntry : item,
      ),
    }));

    await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view", type, id: entry.id }),
    }).catch(() => undefined);
  }

  function updateForm<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#19212d]">
      <SiteHeader
        content={content}
        view={view}
        contactHref={contactHref}
      />

      {view === "home" ? (
        <HomeView
          content={content}
          communityData={communityData}
          contactHref={contactHref}
          openDetail={openDetail}
        />
      ) : null}

      {view === "sales" ? (
        <SalesView
          entries={communityData.sales}
          contactHref={contactHref}
          onCreate={() => openForm("sales")}
        />
      ) : null}

      {view === "buses" ? (
        <BusesView
          entries={communityData.buses}
          contactHref={contactHref}
          onCreate={() => openForm("buses")}
          onDetail={(entry) => openDetail("buses", entry)}
        />
      ) : null}

      {view === "community" ? (
        <CommunityView
          entries={communityData.community}
          onCreate={() => openForm("community")}
          onDetail={(entry) => openDetail("community", entry)}
        />
      ) : null}

      {view === "announcements" ? (
        <AnnouncementsView
          entries={communityData.announcements}
          onDetail={(entry) => openDetail("announcements", entry)}
        />
      ) : null}

      {view === "scammers" ? (
        <ScammersView
          entries={communityData.scammers}
          onCreate={() => openForm("scammers")}
          onDetail={(entry) => openDetail("scammers", entry)}
        />
      ) : null}

      <SiteFooter content={content} />

      {noticeOpen ? (
        <NoticeModal
          notice={content.noticeModal}
          onClose={() => setNoticeOpen(false)}
        />
      ) : null}

      {formMode ? (
        <EntryFormModal
          mode={formMode}
          values={formValues}
          submitting={submitting}
          message={formMessage}
          updateForm={updateForm}
          onClose={() => setFormMode(null)}
          onSubmit={submitEntry}
        />
      ) : null}

      {selectedEntry ? (
        <EntryDetailModal
          selected={selectedEntry}
          contactHref={contactHref}
          onClose={() => setSelectedEntry(null)}
          setCommunityData={setCommunityData}
          setSelectedEntry={setSelectedEntry}
        />
      ) : null}
    </main>
  );
}

function SiteHeader({
  content,
  view,
  contactHref,
}: {
  content: SiteContent;
  view: MarketplaceView;
  contactHref: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e1e5eb] bg-white/95 backdrop-blur">
      <div className={`${shellClass} flex h-[76px] items-center gap-4`}>
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
          {content.brand.logoUrl ? (
            <img
              src={content.brand.logoUrl}
              alt={content.brand.logoAlt}
              className="h-12 w-auto max-w-[210px] object-contain sm:h-14"
            />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#19212d] text-sm font-black text-white">
              K2
            </span>
          )}
          <span className="hidden min-w-0 sm:block">
            <strong className="block truncate text-base font-black text-[#19212d]">
              {content.brand.name}
            </strong>
            <small className="block truncate text-xs font-semibold text-[#7a8492]">
              실시간 시세·거래 게시판
            </small>
          </span>
        </Link>

        <a
          href={contactHref}
          {...externalLinkProps(contactHref)}
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center"
          aria-label={content.support.kakaoLabel}
          title={content.support.kakaoLabel}
        >
          {content.support.kakaoImageUrl ? (
            <img
              src={content.support.kakaoImageUrl}
              alt={content.support.kakaoLabel}
              className="h-14 w-14 object-contain"
            />
          ) : (
            <MessageCircle size={28} className="text-[#19212d]" />
          )}
        </a>
      </div>

      <nav className="border-t border-[#edf0f4] bg-white" aria-label="주요 메뉴">
        <div
          className={`${shellClass} flex gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          <Link
            href="/"
            aria-current={view === "home" ? "page" : undefined}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-black transition ${
              view === "home"
                ? "bg-[#19212d] text-white"
                : "text-[#5d6674] hover:bg-[#f3f5f8]"
            }`}
          >
            <Home size={16} aria-hidden="true" />
            홈
          </Link>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.view === view;

            return (
              <Link
                key={item.view}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-black transition ${
                  active
                    ? "text-white"
                    : "text-[#5d6674] hover:bg-[#f3f5f8]"
                }`}
                style={active ? { backgroundColor: item.color } : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

function HomeView({
  content,
  communityData,
  contactHref,
  openDetail,
}: {
  content: SiteContent;
  communityData: CommunityData;
  contactHref: string;
  openDetail: (type: CommunityBoardKey, entry: BoardEntry) => void;
}) {
  return (
    <>
      <section className={`${shellClass} pb-5 pt-8`}>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="brand-heading max-w-[650px]">
              {content.hero.title}
            </h1>
            <p className="mt-4 max-w-[620px] whitespace-pre-line text-base font-semibold leading-7 text-[#626c7a]">
              {content.hero.subtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {content.hero.trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-black text-[#4e5968] ring-1 ring-[#e2e6ec]"
                >
                  <CheckCircle2
                    size={14}
                    className="text-[#0f766e]"
                    aria-hidden="true"
                  />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <QuoteCard quote={content.market.buy} kind="buy" />
            <QuoteCard quote={content.market.sell} kind="sell" />
          </div>
        </div>
      </section>

      <section className={`${shellClass} pb-6`}>
        <div className="rounded-lg border border-[#eadfbf] bg-[#fffaf0] p-4">
          <div className="flex gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#b07b1b]"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm font-black text-[#765315]">
                {content.brand.noticeTitle}
              </h2>
              <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-6 text-[#6b614f]">
                {content.brand.noticeBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${shellClass} pb-7`}>
        <SectionHeading
          eyebrow={content.market.updatedAt}
          title={content.market.title}
          description={content.market.description}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {content.exchanges.map((exchange) => (
            <article key={exchange.id} className={`${panelClass} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black">{exchange.title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#6d7684]">
                    {exchange.description}
                  </p>
                </div>
                <Store
                  size={20}
                  className="shrink-0 text-[#0f766e]"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 border-t border-[#edf0f4] pt-4">
                <PriceValue
                  label={exchange.buyLabel}
                  value={exchange.buyPrice}
                  unit={exchange.unit}
                />
                <PriceValue
                  label={exchange.sellLabel}
                  value={exchange.sellPrice}
                  unit={exchange.unit}
                  right
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${shellClass} pb-7`}>
        <div className="mb-4 flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="실시간 등록"
            title="최근 키나 판매"
            description="판매자와 구매자를 직접 연결합니다."
            compact
          />
          <Link
            href="/resale"
            className="shrink-0 text-sm font-black text-[#0f766e]"
          >
            전체보기
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {communityData.sales.slice(0, 3).map((entry) => (
            <SaleCard
              key={entry.id}
              entry={entry}
              contactHref={entry.kakaoUrl || contactHref}
            />
          ))}
        </div>
      </section>

      <section className={`${shellClass} pb-8`}>
        <div className="grid gap-3 md:grid-cols-2">
          <BoardPreview
            title="공지사항"
            href="/announcements"
            icon={Bell}
            accent="#c87818"
          >
            {communityData.announcements.slice(0, 3).map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => openDetail("announcements", entry)}
                className="flex w-full items-center justify-between gap-3 border-t border-[#edf0f4] py-3 text-left first:border-0"
              >
                <span className="truncate text-sm font-bold">{entry.title}</span>
                <span className="shrink-0 text-xs font-semibold text-[#8a93a0]">
                  {formatDate(entry.createdAt)}
                </span>
              </button>
            ))}
          </BoardPreview>

          <BoardPreview
            title="자유게시판"
            href="/community"
            icon={MessageCircle}
            accent="#7656c9"
          >
            {communityData.community.slice(0, 3).map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => openDetail("community", entry)}
                className="flex w-full items-center justify-between gap-3 border-t border-[#edf0f4] py-3 text-left first:border-0"
              >
                <span className="truncate text-sm font-bold">{entry.title}</span>
                <span className="shrink-0 text-xs font-semibold text-[#8a93a0]">
                  댓글 {entry.comments.length}
                </span>
              </button>
            ))}
          </BoardPreview>
        </div>
      </section>

      <section className={`${shellClass} pb-10`}>
        <div className="flex flex-col gap-4 rounded-lg bg-[#19212d] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#f6c453]">
              {content.support.title}
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#d9dee5]">
              {content.support.description}
            </p>
          </div>
          <a
            href={contactHref}
            {...externalLinkProps(contactHref)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#f6c453] px-5 text-sm font-black text-[#26200e]"
          >
            <MessageCircle size={17} aria-hidden="true" />
            카카오톡 문의
          </a>
        </div>
      </section>
    </>
  );
}

function SalesView({
  entries,
  contactHref,
  onCreate,
}: {
  entries: SaleEntry[];
  contactHref: string;
  onCreate: () => void;
}) {
  return (
    <BoardPage
      icon={ShoppingBag}
      title="키나 판매"
      subtitle="서버별 판매 수량과 가격을 확인하세요."
      accent="#0f766e"
      actionLabel="판매 등록하기"
      onCreate={onCreate}
      guide={[
        "판매 수량과 가격을 정확하게 입력해주세요.",
        "게시글별 카카오 링크를 비우면 사이트 기본 상담 링크가 사용됩니다.",
        "거래 전 상대방 캐릭터명과 입금자 정보를 다시 확인해주세요.",
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((entry) => (
          <SaleCard
            key={entry.id}
            entry={entry}
            contactHref={entry.kakaoUrl || contactHref}
          />
        ))}
      </div>
      <EmptyState visible={entries.length === 0} label="등록된 판매글이 없습니다." />
    </BoardPage>
  );
}

function BusesView({
  entries,
  contactHref,
  onCreate,
  onDetail,
}: {
  entries: BusEntry[];
  contactHref: string;
  onCreate: () => void;
  onDetail: (entry: BusEntry) => void;
}) {
  return (
    <BoardPage
      icon={Bus}
      title="육성버스"
      subtitle="육성·던전·내실 모집 정보를 확인하세요."
      accent="#4f5fc7"
      actionLabel="육성버스 등록하기"
      onCreate={onCreate}
      guide={[
        "서비스 범위와 예상 소요 시간을 상세히 적어주세요.",
        "참여 전 진행 방법과 비용을 카카오톡으로 확인해주세요.",
        "계정 정보 전달이 필요한 경우 보안 설정을 먼저 점검해주세요.",
      ]}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {entries.map((entry) => (
          <article key={entry.id} className={`${panelClass} overflow-hidden`}>
            <div className="border-b border-[#e7e9ee] bg-[#f0f2ff] px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">{entry.title}</h2>
                  <p className="mt-1 text-sm font-bold text-[#5966a9]">
                    {entry.server}
                  </p>
                </div>
                <Bus
                  size={20}
                  className="shrink-0 text-[#4f5fc7]"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="p-5">
              <MetaRow
                author={entry.author}
                createdAt={entry.createdAt}
                views={entry.views}
              />
              <p className="mt-4 line-clamp-3 min-h-[72px] text-sm font-semibold leading-6 text-[#626c7a]">
                {entry.content}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onDetail(entry)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#4f5fc7] text-sm font-black text-white"
                >
                  <FileText size={16} aria-hidden="true" />
                  상세보기
                </button>
                <a
                  href={entry.kakaoUrl || contactHref}
                  {...externalLinkProps(entry.kakaoUrl || contactHref)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#f6c453] text-sm font-black text-[#2d260f]"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  모집 문의
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <EmptyState visible={entries.length === 0} label="등록된 육성버스 글이 없습니다." />
    </BoardPage>
  );
}

function CommunityView({
  entries,
  onCreate,
  onDetail,
}: {
  entries: CommunityEntry[];
  onCreate: () => void;
  onDetail: (entry: CommunityEntry) => void;
}) {
  return (
    <BoardPage
      icon={MessageCircle}
      title="자유게시판"
      subtitle="아이온2 정보와 이야기를 자유롭게 나누세요."
      accent="#7656c9"
      actionLabel="글쓰기"
      onCreate={onCreate}
      guide={[
        "아이온2 관련 정보, 팁, 질문을 자유롭게 공유할 수 있습니다.",
        "개인정보와 거래 계좌는 게시글에 공개하지 마세요.",
        "비방과 광고성 게시글은 관리자 판단에 따라 삭제될 수 있습니다.",
      ]}
    >
      <div className={`${panelClass} overflow-hidden`}>
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onDetail(entry)}
            className="block w-full border-t border-[#e8ebef] px-5 py-5 text-left transition first:border-0 hover:bg-[#faf9ff]"
          >
            <h2 className="text-lg font-black">{entry.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#66707e]">
              {entry.content}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold text-[#8a93a0]">
              <span className="inline-flex items-center gap-1">
                <User size={13} aria-hidden="true" />
                {entry.author}
              </span>
              <span>{formatDate(entry.createdAt)}</span>
              <span className="inline-flex items-center gap-1">
                <Eye size={13} aria-hidden="true" />
                {entry.views}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle size={13} aria-hidden="true" />
                {entry.comments.length}
              </span>
            </div>
          </button>
        ))}
      </div>
      <EmptyState visible={entries.length === 0} label="등록된 게시글이 없습니다." />
    </BoardPage>
  );
}

function AnnouncementsView({
  entries,
  onDetail,
}: {
  entries: AnnouncementEntry[];
  onDetail: (entry: AnnouncementEntry) => void;
}) {
  return (
    <BoardPage
      icon={Bell}
      title="공지사항"
      subtitle="거래 전에 운영 공지를 꼭 확인해주세요."
      accent="#c87818"
      guide={[
        "사이트 운영과 거래 안전에 관한 중요한 소식을 안내합니다.",
        "중요 표기가 있는 공지는 거래 전에 반드시 확인해주세요.",
      ]}
    >
      <div className={`${panelClass} overflow-hidden`}>
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onDetail(entry)}
            className={`block w-full border-t border-[#e8ebef] px-5 py-5 text-left transition first:border-0 hover:bg-[#fffaf3] ${
              entry.important ? "bg-[#fff8ee]" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {entry.important ? (
                <span className="mt-0.5 shrink-0 rounded-full bg-[#e88422] px-2 py-1 text-[11px] font-black text-white">
                  중요
                </span>
              ) : null}
              <div className="min-w-0">
                <h2 className="text-lg font-black">{entry.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#66707e]">
                  {entry.content}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-bold text-[#8a93a0]">
                  <span>관리자</span>
                  <span>{formatDate(entry.createdAt)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye size={13} aria-hidden="true" />
                    {entry.views}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <EmptyState visible={entries.length === 0} label="등록된 공지사항이 없습니다." />
    </BoardPage>
  );
}

function ScammersView({
  entries,
  onCreate,
  onDetail,
}: {
  entries: ScammerEntry[];
  onCreate: () => void;
  onDetail: (entry: ScammerEntry) => void;
}) {
  return (
    <BoardPage
      icon={ShieldAlert}
      title="사기꾼"
      subtitle="피해 사례를 공유하고 거래 전 목록을 확인하세요."
      accent="#c54249"
      actionLabel="사기꾼 신고하기"
      onCreate={onCreate}
      guide={[
        "확인 가능한 피해 사실만 작성해주세요.",
        "전화번호와 계좌번호는 일부를 가려서 등록해주세요.",
        "허위 신고와 개인정보 무단 공개는 법적 책임이 발생할 수 있습니다.",
      ]}
    >
      <div className={`${panelClass} overflow-hidden`}>
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onDetail(entry)}
            className="block w-full border-t border-[#e8ebef] px-5 py-5 text-left transition first:border-0 hover:bg-[#fff8f8]"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fff0f1] text-[#c54249]">
                <ShieldAlert size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-black">{entry.title}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#fff0f1] px-2 py-1 text-xs font-black text-[#b5373f]">
                    {entry.scammerName}
                  </span>
                  <span className="rounded-full bg-[#f1f3f6] px-2 py-1 text-xs font-bold text-[#626c7a]">
                    {entry.server}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-[#66707e]">
                  {entry.content}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-bold text-[#8a93a0]">
                  <span>신고자 {entry.reporter}</span>
                  <span>{formatDate(entry.createdAt)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye size={13} aria-hidden="true" />
                    {entry.views}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <EmptyState visible={entries.length === 0} label="등록된 신고 글이 없습니다." />
    </BoardPage>
  );
}

function BoardPage({
  icon: Icon,
  title,
  subtitle,
  accent,
  actionLabel,
  onCreate,
  guide,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  accent: string;
  actionLabel?: string;
  onCreate?: () => void;
  guide: string[];
  children: ReactNode;
}) {
  return (
    <section className={`${shellClass} pb-12 pt-7`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-white"
            style={{ backgroundColor: accent }}
          >
            <Icon size={23} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm font-semibold text-[#6d7684]">
              {subtitle}
            </p>
          </div>
        </div>

        {actionLabel && onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black text-white shadow-sm"
            style={{ backgroundColor: accent }}
          >
            <Plus size={17} aria-hidden="true" />
            {actionLabel}
          </button>
        ) : null}
      </div>

      <div className="my-6 rounded-lg border border-[#dfe4eb] bg-white p-4">
        <div className="flex gap-3">
          <Info
            size={18}
            className="mt-0.5 shrink-0"
            style={{ color: accent }}
            aria-hidden="true"
          />
          <ul className="grid gap-1 text-sm font-semibold leading-6 text-[#65707e]">
            {guide.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {children}
    </section>
  );
}

function SaleCard({
  entry,
  contactHref,
}: {
  entry: SaleEntry;
  contactHref: string;
}) {
  return (
    <article className={`${panelClass} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black">{entry.server} 서버</h2>
          <p className="mt-1 truncate text-sm font-bold text-[#7a8492]">
            판매자 {maskName(entry.characterName)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-black text-[#0f766e]">{entry.price}</p>
          <p className="text-xs font-bold text-[#8a93a0]">100만 키나</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-[#f2f7f6] px-3 py-3">
        <span className="text-xs font-bold text-[#6d7684]">판매 수량</span>
        <strong className="text-sm font-black">{entry.amount}</strong>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#8a93a0]">
        <span>{formatDate(entry.createdAt)}</span>
        <span className="inline-flex items-center gap-1">
          <Eye size={13} aria-hidden="true" />
          {entry.views}
        </span>
      </div>
      <a
        href={contactHref}
        {...externalLinkProps(contactHref)}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#19212d] text-sm font-black text-white"
      >
        <MessageCircle size={16} aria-hidden="true" />
        연락하기
      </a>
    </article>
  );
}

function EntryFormModal({
  mode,
  values,
  submitting,
  message,
  updateForm,
  onClose,
  onSubmit,
}: {
  mode: FormMode;
  values: FormValues;
  submitting: boolean;
  message: string;
  updateForm: <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const labels: Record<FormMode, { title: string; color: string }> = {
    sales: { title: "키나 판매 등록", color: "#0f766e" },
    buses: { title: "육성버스 등록", color: "#4f5fc7" },
    community: { title: "게시글 작성", color: "#7656c9" },
    scammers: { title: "사기꾼 신고", color: "#c54249" },
  };
  const label = labels[mode];

  return (
    <ModalFrame title={label.title} accent={label.color} onClose={onClose}>
      <form onSubmit={onSubmit} className="grid gap-4 p-5 sm:p-6">
        {mode === "sales" ? (
          <>
            <FormInput
              label="캐릭터명"
              placeholder="판매자 캐릭터명"
              value={values.characterName}
              onChange={(value) => updateForm("characterName", value)}
            />
            <FormInput
              label="서버"
              placeholder="예: 트리니엘"
              value={values.server}
              onChange={(value) => updateForm("server", value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="판매 수량"
                placeholder="예: 3000"
                type="number"
                suffix="만 키나"
                value={values.amount}
                onChange={(value) => updateForm("amount", value)}
              />
              <FormInput
                label="판매 가격"
                placeholder="예: 2950"
                type="number"
                suffix="원"
                value={values.price}
                onChange={(value) => updateForm("price", value)}
              />
            </div>
            <FormInput
              label="카카오톡 링크 (선택)"
              placeholder="비워두면 기본 상담 링크 사용"
              value={values.kakaoUrl}
              onChange={(value) => updateForm("kakaoUrl", value)}
            />
          </>
        ) : null}

        {mode === "buses" ? (
          <>
            <FormInput
              label="제목"
              placeholder="육성버스 제목"
              value={values.title}
              onChange={(value) => updateForm("title", value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="작성자"
                placeholder="캐릭터명"
                value={values.author}
                onChange={(value) => updateForm("author", value)}
              />
              <FormInput
                label="서버"
                placeholder="예: 아스펠"
                value={values.server}
                onChange={(value) => updateForm("server", value)}
              />
            </div>
            <FormTextarea
              label="상세 내용"
              placeholder="서비스 범위, 일정, 비용 안내를 입력하세요."
              value={values.content}
              onChange={(value) => updateForm("content", value)}
              maxLength={500}
            />
            <FormInput
              label="카카오톡 링크 (선택)"
              placeholder="비워두면 기본 상담 링크 사용"
              value={values.kakaoUrl}
              onChange={(value) => updateForm("kakaoUrl", value)}
            />
          </>
        ) : null}

        {mode === "community" ? (
          <>
            <FormInput
              label="제목"
              placeholder="제목을 입력하세요."
              value={values.title}
              onChange={(value) => updateForm("title", value)}
            />
            <FormInput
              label="작성자"
              placeholder="닉네임을 입력하세요."
              value={values.author}
              onChange={(value) => updateForm("author", value)}
            />
            <FormTextarea
              label="내용"
              placeholder="내용을 입력하세요."
              value={values.content}
              onChange={(value) => updateForm("content", value)}
              maxLength={1000}
            />
          </>
        ) : null}

        {mode === "scammers" ? (
          <>
            <FormInput
              label="제목"
              placeholder="예: 거래 사기 주의"
              value={values.title}
              onChange={(value) => updateForm("title", value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="사기꾼 닉네임"
                placeholder="캐릭터명"
                value={values.scammerName}
                onChange={(value) => updateForm("scammerName", value)}
              />
              <FormInput
                label="서버"
                placeholder="예: 시엘"
                value={values.server}
                onChange={(value) => updateForm("server", value)}
              />
            </div>
            <FormInput
              label="신고자"
              placeholder="신고자 닉네임"
              value={values.reporter}
              onChange={(value) => updateForm("reporter", value)}
            />
            <FormTextarea
              label="피해 내용"
              placeholder="개인정보 일부를 가린 뒤 피해 내용을 작성해주세요."
              value={values.content}
              onChange={(value) => updateForm("content", value)}
              maxLength={1000}
            />
          </>
        ) : null}

        {message ? (
          <p className="rounded-lg bg-[#fff0f1] px-3 py-2 text-sm font-bold text-[#b5373f]">
            {message}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-lg border border-[#d8dde5] bg-white text-sm font-black text-[#596372]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-lg text-sm font-black text-white disabled:opacity-60"
            style={{ backgroundColor: label.color }}
          >
            {submitting ? "등록 중" : mode === "scammers" ? "신고하기" : "등록하기"}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

function EntryDetailModal({
  selected,
  contactHref,
  onClose,
  setCommunityData,
  setSelectedEntry,
}: {
  selected: { type: CommunityBoardKey; entry: BoardEntry };
  contactHref: string;
  onClose: () => void;
  setCommunityData: React.Dispatch<React.SetStateAction<CommunityData>>;
  setSelectedEntry: React.Dispatch<
    React.SetStateAction<{
      type: CommunityBoardKey;
      entry: BoardEntry;
    } | null>
  >;
}) {
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const { type, entry } = selected;
  const title = getEntryTitle(entry);
  const accent = getBoardAccent(type);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (type !== "community") return;

    setCommentSubmitting(true);
    setCommentMessage("");
    const response = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "comment",
        id: entry.id,
        payload: { author: commentAuthor, content: commentContent },
      }),
    });
    const result = (await response.json()) as
      | CommunityEntry["comments"][number]
      | { message?: string };

    if (!response.ok || !("id" in result)) {
      setCommentMessage(
        "message" in result && result.message
          ? result.message
          : "댓글을 등록하지 못했습니다.",
      );
      setCommentSubmitting(false);
      return;
    }

    const updatedEntry = {
      ...(entry as CommunityEntry),
      comments: [...(entry as CommunityEntry).comments, result],
    };
    setCommunityData((current) => ({
      ...current,
      community: current.community.map((item) =>
        item.id === entry.id ? updatedEntry : item,
      ),
    }));
    setSelectedEntry({ type, entry: updatedEntry });
    setCommentAuthor("");
    setCommentContent("");
    setCommentSubmitting(false);
  }

  return (
    <ModalFrame title={title} accent={accent} onClose={onClose} wide>
      <div className="p-5 sm:p-6">
        <EntryDetailBody type={type} entry={entry} />

        {type === "buses" ? (
          <a
            href={(entry as BusEntry).kakaoUrl || contactHref}
            {...externalLinkProps((entry as BusEntry).kakaoUrl || contactHref)}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#f6c453] text-sm font-black text-[#2d260f]"
          >
            <MessageCircle size={16} aria-hidden="true" />
            모집 문의
          </a>
        ) : null}

        {type === "community" ? (
          <div className="mt-7 border-t border-[#e4e8ed] pt-6">
            <h3 className="flex items-center gap-2 text-lg font-black">
              <MessageCircle size={18} aria-hidden="true" />
              댓글 {(entry as CommunityEntry).comments.length}
            </h3>
            <div className="mt-4 grid gap-3">
              {(entry as CommunityEntry).comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-[#f6f7fa] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-black">{comment.author}</strong>
                    <span className="text-xs font-bold text-[#8a93a0]">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-[#5f6977]">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={submitComment} className="mt-5 grid gap-3">
              <input
                className={inputClass}
                value={commentAuthor}
                onChange={(event) => setCommentAuthor(event.target.value)}
                placeholder="닉네임"
                aria-label="댓글 닉네임"
              />
              <textarea
                className={textareaClass}
                value={commentContent}
                onChange={(event) => setCommentContent(event.target.value)}
                placeholder="댓글을 입력하세요."
                aria-label="댓글 내용"
                maxLength={500}
              />
              {commentMessage ? (
                <p className="text-sm font-bold text-[#b5373f]">
                  {commentMessage}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={commentSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#7656c9] text-sm font-black text-white disabled:opacity-60"
              >
                <Send size={16} aria-hidden="true" />
                {commentSubmitting ? "등록 중" : "댓글 작성"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </ModalFrame>
  );
}

function EntryDetailBody({
  type,
  entry,
}: {
  type: CommunityBoardKey;
  entry: BoardEntry;
}) {
  if (type === "buses") {
    const bus = entry as BusEntry;
    return (
      <>
        <MetaRow
          author={bus.author}
          createdAt={bus.createdAt}
          views={bus.views}
        />
        <p className="mt-5 whitespace-pre-line text-base font-semibold leading-8 text-[#4f5967]">
          {bus.content}
        </p>
        <p className="mt-4 rounded-lg bg-[#f0f2ff] px-4 py-3 text-sm font-black text-[#4f5fc7]">
          {bus.server} 서버
        </p>
      </>
    );
  }

  if (type === "community") {
    const post = entry as CommunityEntry;
    return (
      <>
        <MetaRow
          author={post.author}
          createdAt={post.createdAt}
          views={post.views}
        />
        <p className="mt-5 whitespace-pre-line text-base font-semibold leading-8 text-[#4f5967]">
          {post.content}
        </p>
      </>
    );
  }

  if (type === "announcements") {
    const notice = entry as AnnouncementEntry;
    return (
      <>
        <MetaRow
          author="관리자"
          createdAt={notice.createdAt}
          views={notice.views}
        />
        <p className="mt-5 whitespace-pre-line text-base font-semibold leading-8 text-[#4f5967]">
          {notice.content}
        </p>
      </>
    );
  }

  const scammer = entry as ScammerEntry;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-[#fff0f1] px-3 py-1.5 text-sm font-black text-[#b5373f]">
          {scammer.scammerName}
        </span>
        <span className="rounded-full bg-[#f1f3f6] px-3 py-1.5 text-sm font-bold text-[#626c7a]">
          {scammer.server}
        </span>
      </div>
      <MetaRow
        author={`신고자 ${scammer.reporter}`}
        createdAt={scammer.createdAt}
        views={scammer.views}
      />
      <p className="mt-5 whitespace-pre-line text-base font-semibold leading-8 text-[#4f5967]">
        {scammer.content}
      </p>
      <div className="mt-5 flex gap-3 rounded-lg border border-[#f0d3d5] bg-[#fff7f7] p-4">
        <AlertTriangle
          size={19}
          className="mt-0.5 shrink-0 text-[#c54249]"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold leading-6 text-[#715155]">
          게시된 제보는 참고 자료이며 사실관계가 확정된 판결을 의미하지
          않습니다. 거래 전 추가 확인이 필요합니다.
        </p>
      </div>
    </>
  );
}

function ModalFrame({
  title,
  accent,
  onClose,
  wide = false,
  children,
}: {
  title: string;
  accent: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/55 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-lg bg-white shadow-[0_24px_80px_rgba(0,0,0,0.3)] ${
          wide ? "max-w-[720px]" : "max-w-[600px]"
        }`}
      >
        <div
          className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-3 border-b border-white/20 px-5 py-4 text-white"
          style={{ backgroundColor: accent }}
        >
          <h2 className="text-lg font-black sm:text-xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white transition hover:bg-white/15"
            aria-label="닫기"
            title="닫기"
          >
            <X size={21} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NoticeModal({
  notice,
  onClose,
}: {
  notice: SiteContent["noticeModal"];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/55 px-5 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-modal-title"
    >
      <div className="w-full max-w-[560px] overflow-hidden rounded-lg border border-[#e4d8c3] bg-[#FBF6EB] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="border-b border-[#e4d8c3] px-7 py-6 sm:px-8">
          <h2
            id="notice-modal-title"
            className="text-2xl font-black text-[#2f2922]"
          >
            {notice.title}
          </h2>
        </div>
        <div className="px-7 pb-7 pt-7 sm:px-8">
          <p className="whitespace-pre-line text-[17px] font-medium leading-8 text-[#404959]">
            {notice.body}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-9 h-[56px] w-full rounded-lg border border-[#d7c8ae] bg-[#FBF6EB] text-lg font-black text-[#2f2922] transition hover:bg-[#f1eadc]"
          >
            {notice.buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function BoardPreview({
  title,
  href,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  children: ReactNode;
}) {
  return (
    <article className={`${panelClass} p-5`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <Icon size={19} style={{ color: accent }} aria-hidden="true" />
          {title}
        </h2>
        <Link href={href} className="text-xs font-black" style={{ color: accent }}>
          전체보기
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "mb-4"}>
      <p className="text-xs font-black text-[#0f766e]">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#6d7684]">
        {description}
      </p>
    </div>
  );
}

function QuoteCard({
  quote,
  kind,
}: {
  quote: PriceQuote;
  kind: "buy" | "sell";
}) {
  const Icon = kind === "buy" ? ArrowDown : ArrowUp;
  const styles =
    kind === "buy"
      ? "border-[#cde9e1] bg-[#f0faf7] text-[#0f766e]"
      : "border-[#f0d5d8] bg-[#fff5f6] text-[#bd3d49]";

  return (
    <article className={`rounded-lg border p-4 ${styles}`}>
      <div className="flex items-center gap-2 text-sm font-black">
        <Icon size={17} aria-hidden="true" />
        {quote.label}
      </div>
      <p className="mt-3 text-2xl font-black">{quote.price}</p>
      <p className="mt-1 text-xs font-bold opacity-70">{quote.unit}</p>
    </article>
  );
}

function PriceValue({
  label,
  value,
  unit,
  right = false,
}: {
  label: string;
  value: string;
  unit: string;
  right?: boolean;
}) {
  return (
    <div className={right ? "border-l border-[#e8ebef] pl-4" : "pr-4"}>
      <p className="text-xs font-black text-[#7c8592]">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
      <p className="mt-1 text-[11px] font-bold text-[#929aa6]">{unit}</p>
    </div>
  );
}

function MetaRow({
  author,
  createdAt,
  views,
}: {
  author: string;
  createdAt: string;
  views: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#89929f]">
      <span className="inline-flex items-center gap-1">
        <User size={13} aria-hidden="true" />
        {author}
      </span>
      <span className="inline-flex items-center gap-1">
        <CalendarDays size={13} aria-hidden="true" />
        {formatDate(createdAt)}
      </span>
      <span className="inline-flex items-center gap-1">
        <Eye size={13} aria-hidden="true" />
        {views}
      </span>
    </div>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  suffix,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#46505e]">{label}</span>
      <div className="relative">
        <input
          className={`${inputClass} ${suffix ? "pr-20" : ""}`}
          type={type}
          min={type === "number" ? "1" : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 top-2 flex items-center text-xs font-black text-[#7e8794]">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#46505e]">{label}</span>
      <textarea
        className={textareaClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <span className="mt-1 block text-right text-xs font-bold text-[#929aa6]">
        {value.length} / {maxLength}자
      </span>
    </label>
  );
}

function EmptyState({ visible, label }: { visible: boolean; label: string }) {
  if (!visible) return null;

  return (
    <div className={`${panelClass} grid min-h-40 place-items-center p-6`}>
      <p className="text-sm font-bold text-[#89929f]">{label}</p>
    </div>
  );
}

function SiteFooter({ content }: { content: SiteContent }) {
  return (
    <footer className="border-t border-[#e1e5eb] bg-white">
      <div className={`${shellClass} py-7`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-black">{content.footer.companyName}</h2>
            <p className="mt-1 max-w-[600px] text-sm font-semibold leading-6 text-[#747e8c]">
              {content.footer.description}
            </p>
          </div>
          <p className="text-xs font-semibold text-[#939ba6]">
            {content.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

function getEntryTitle(entry: BoardEntry) {
  if ("title" in entry) return entry.title;
  return `${entry.server} 서버 키나 판매`;
}

function getBoardAccent(type: CommunityBoardKey) {
  return {
    sales: "#0f766e",
    buses: "#4f5fc7",
    community: "#7656c9",
    announcements: "#c87818",
    scammers: "#c54249",
  }[type];
}

function viewToBoardKey(view: FormMode): CommunityBoardKey {
  return {
    sales: "sales",
    buses: "buses",
    community: "community",
    scammers: "scammers",
  }[view] as CommunityBoardKey;
}

function maskName(name: string) {
  if (name.length <= 1) return `${name}**`;
  return `${name.slice(0, Math.min(3, name.length))}***`;
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

function externalLinkProps(href: string) {
  if (!href.startsWith("http")) return {};

  return {
    target: "_blank",
    rel: "noreferrer",
  };
}
