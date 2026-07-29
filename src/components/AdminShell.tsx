/* eslint-disable @next/next/no-img-element -- Admin-managed image URLs can be local uploads or external assets. */

"use client";

import {
  ClipboardList,
  ExternalLink,
  ImagePlus,
  LayoutDashboard,
  ListPlus,
  LogOut,
  MessageCircle,
  Plus,
  Save,
  Search,
  Settings2,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { defaultSiteContent } from "@/lib/default-content";
import { CommunityAdminPanel } from "@/components/CommunityAdminPanel";
import { defaultCommunityData } from "@/lib/default-community-data";
import type { CommunityData } from "@/lib/community-types";
import type {
  ExchangeSection,
  PriceQuote,
  QuoteTrend,
  SellerListing,
  ServiceCard,
  SiteContent,
} from "@/lib/site-types";

type AdminShellProps = {
  isAuthenticated: boolean;
  initialContent: SiteContent | null;
  initialCommunityData: CommunityData | null;
};

type TabId =
  | "brand"
  | "seo"
  | "market"
  | "sellers"
  | "services"
  | "boards"
  | "footer";

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "brand", label: "기본", icon: LayoutDashboard },
  { id: "seo", label: "SEO 설정", icon: Search },
  { id: "market", label: "시세", icon: Store },
  { id: "sellers", label: "판매", icon: ListPlus },
  { id: "services", label: "서비스", icon: Settings2 },
  { id: "boards", label: "게시판 관리", icon: ClipboardList },
  { id: "footer", label: "상담/하단", icon: MessageCircle },
];

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[#d7cfbf] bg-white px-3 text-sm font-semibold text-[#181512] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10";

const textareaClass =
  "mt-2 min-h-28 w-full resize-y rounded-lg border border-[#d7cfbf] bg-white px-3 py-3 text-sm font-semibold leading-6 text-[#181512] outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10";

export function AdminShell({
  isAuthenticated,
  initialContent,
  initialCommunityData,
}: AdminShellProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("brand");
  const [content, setContent] = useState<SiteContent>(
    initialContent ?? defaultSiteContent,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "idle" | "success" | "error";
    text: string;
  }>({ type: "idle", text: "" });

  const totalSellerAmount = useMemo(
    () => `${content.sellers.length}개 판매 목록`,
    [content.sellers.length],
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage({ type: "idle", text: "" });

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setMessage({ type: "error", text: "비밀번호가 올바르지 않습니다." });
      return;
    }

    setPassword("");
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function saveContent() {
    setSaving(true);
    setMessage({ type: "idle", text: "" });

    const response = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      setMessage({ type: "error", text: "저장하지 못했습니다." });
      setSaving(false);
      return;
    }

    const saved = (await response.json()) as SiteContent;
    setContent(saved);
    setMessage({ type: "success", text: "저장되었습니다." });
    setSaving(false);
    router.refresh();
  }

  async function uploadImage(file: File, onUrl: (url: string) => void) {
    setUploading(true);
    setMessage({ type: "idle", text: "" });

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      setMessage({
        type: "error",
        text: payload.message ?? "이미지를 업로드하지 못했습니다.",
      });
      setUploading(false);
      return;
    }

    const payload = (await response.json()) as { url: string };
    onUrl(payload.url);
    setMessage({ type: "success", text: "이미지가 추가되었습니다." });
    setUploading(false);
  }

  function updateBrand(patch: Partial<SiteContent["brand"]>) {
    setContent((current) => ({
      ...current,
      brand: { ...current.brand, ...patch },
    }));
  }

  function updateHero(patch: Partial<SiteContent["hero"]>) {
    setContent((current) => ({
      ...current,
      hero: { ...current.hero, ...patch },
    }));
  }

  function updateNoticeModal(patch: Partial<SiteContent["noticeModal"]>) {
    setContent((current) => ({
      ...current,
      noticeModal: { ...current.noticeModal, ...patch },
    }));
  }

  function updateSeo(patch: Partial<SiteContent["seo"]>) {
    setContent((current) => ({
      ...current,
      seo: { ...current.seo, ...patch },
    }));
  }

  function updateMarket(patch: Partial<SiteContent["market"]>) {
    setContent((current) => ({
      ...current,
      market: { ...current.market, ...patch },
    }));
  }

  function updateQuote(kind: "buy" | "sell", patch: Partial<PriceQuote>) {
    setContent((current) => ({
      ...current,
      market: {
        ...current.market,
        [kind]: { ...current.market[kind], ...patch },
      },
    }));
  }

  function updateExchange(index: number, patch: Partial<ExchangeSection>) {
    setContent((current) => ({
      ...current,
      exchanges: current.exchanges.map((exchange, itemIndex) =>
        itemIndex === index ? { ...exchange, ...patch } : exchange,
      ),
    }));
  }

  function addExchange() {
    setContent((current) => ({
      ...current,
      exchanges: [
        ...current.exchanges,
        {
          id: createId("exchange"),
          title: "새 거래소 가격",
          description: "거래소 설명을 입력하세요.",
          buyLabel: "매입가",
          buyPrice: "0원",
          sellLabel: "매도가",
          sellPrice: "0원",
          unit: "100만 키나 기준",
          features: ["특징을 입력하세요"],
        },
      ],
    }));
  }

  function removeExchange(index: number) {
    setContent((current) => ({
      ...current,
      exchanges: current.exchanges.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateSeller(index: number, patch: Partial<SellerListing>) {
    setContent((current) => ({
      ...current,
      sellers: current.sellers.map((seller, itemIndex) =>
        itemIndex === index ? { ...seller, ...patch } : seller,
      ),
    }));
  }

  function addSeller() {
    setContent((current) => ({
      ...current,
      sellers: [
        ...current.sellers,
        {
          id: createId("seller"),
          server: "신규 서버",
          seller: "판매자***",
          price: "0원",
          unit: "100만 키나",
          amount: "0만 키나",
          timeAgo: "방금 전",
          contactLabel: "연락하기",
          featured: false,
        },
      ],
    }));
  }

  function removeSeller(index: number) {
    setContent((current) => ({
      ...current,
      sellers: current.sellers.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateService(index: number, patch: Partial<ServiceCard>) {
    setContent((current) => ({
      ...current,
      services: current.services.map((service, itemIndex) =>
        itemIndex === index ? { ...service, ...patch } : service,
      ),
    }));
  }

  function addService() {
    setContent((current) => ({
      ...current,
      services: [
        ...current.services,
        {
          id: createId("service"),
          title: "새 서비스",
          description: "서비스 설명을 입력하세요.",
          bullets: ["항목을 입력하세요"],
          actionLabel: "문의하기",
          href: "#support",
        },
      ],
    }));
  }

  function removeService(index: number) {
    setContent((current) => ({
      ...current,
      services: current.services.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  if (!isAuthenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f0e6] px-4 text-[#181512]">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-lg border border-[#d8cfbd] bg-white p-7 shadow-[0_22px_55px_rgba(47,39,23,0.12)]"
        >
          <div className="mb-7">
            <p className="text-sm font-black text-[#8b5f10]">관리자</p>
            <h1 className="mt-2 text-3xl font-black">사이트 관리</h1>
            <p className="mt-3 text-sm leading-6 text-[#655c4e]">
              비밀번호를 입력하면 콘텐츠 편집 화면으로 이동합니다.
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-black text-[#4e473c]">비밀번호</span>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
          </label>

          {message.type === "error" ? (
            <p className="mt-3 text-sm font-bold text-[#b23626]">
              {message.text}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#113c3a] px-4 text-sm font-black text-white transition hover:bg-[#0d302e]"
          >
            <Store size={18} aria-hidden="true" />
            로그인
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f0e6] text-[#181512]">
      <header className="border-b border-[#d8cfbd] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black text-[#8b5f10]">관리자</p>
            <h1 className="text-2xl font-black">{content.brand.name}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d8cfbd] bg-white px-3 text-sm font-black text-[#181512] transition hover:bg-[#f8f4eb]"
            >
              <ExternalLink size={16} aria-hidden="true" />
              사용자 사이트
            </a>
            <button
              type="button"
              onClick={saveContent}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#113c3a] px-4 text-sm font-black text-white transition hover:bg-[#0d302e] disabled:opacity-60"
            >
              <Save size={16} aria-hidden="true" />
              {saving ? "저장 중" : "저장"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d8cfbd] bg-white px-3 text-sm font-black text-[#181512] transition hover:bg-[#f8f4eb]"
            >
              <LogOut size={16} aria-hidden="true" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_320px] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="grid gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-black transition ${
                    active
                      ? "bg-[#113c3a] text-white"
                      : "bg-white text-[#4f473b] hover:bg-[#f8f4eb]"
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {message.text ? (
            <p
              className={`mt-4 rounded-lg px-3 py-2 text-sm font-bold ${
                message.type === "success"
                  ? "bg-[#e8f6ed] text-[#0b6b43]"
                  : "bg-[#fff0ed] text-[#b23626]"
              }`}
            >
              {message.text}
            </p>
          ) : null}
        </aside>

        <section className="min-w-0 rounded-lg border border-[#d8cfbd] bg-white p-5 shadow-[0_18px_45px_rgba(47,39,23,0.08)]">
          {activeTab === "brand" ? (
            <BrandPanel
              content={content}
              updateBrand={updateBrand}
              updateHero={updateHero}
              updateNoticeModal={updateNoticeModal}
              uploadImage={uploadImage}
              uploading={uploading}
            />
          ) : null}
          {activeTab === "seo" ? (
            <SeoPanel
              content={content}
              updateSeo={updateSeo}
              uploadImage={uploadImage}
              uploading={uploading}
            />
          ) : null}
          {activeTab === "market" ? (
            <MarketPanel
              content={content}
              updateMarket={updateMarket}
              updateQuote={updateQuote}
              updateExchange={updateExchange}
              addExchange={addExchange}
              removeExchange={removeExchange}
            />
          ) : null}
          {activeTab === "sellers" ? (
            <SellersPanel
              sellers={content.sellers}
              updateSeller={updateSeller}
              addSeller={addSeller}
              removeSeller={removeSeller}
            />
          ) : null}
          {activeTab === "services" ? (
            <ServicesPanel
              services={content.services}
              updateService={updateService}
              addService={addService}
              removeService={removeService}
            />
          ) : null}
          {activeTab === "boards" ? (
            <CommunityAdminPanel
              initialData={initialCommunityData ?? defaultCommunityData}
            />
          ) : null}
          {activeTab === "footer" ? (
            <FooterPanel content={content} setContent={setContent} />
          ) : null}
        </section>

        <aside className="rounded-lg border border-[#d8cfbd] bg-white p-4 shadow-[0_18px_45px_rgba(47,39,23,0.08)] lg:sticky lg:top-6 lg:self-start">
          <p className="text-sm font-black text-[#8b5f10]">미리보기</p>
          <div className="mt-3 overflow-hidden rounded-lg border border-[#ded4be]">
            <img
              src={content.brand.heroImageUrl || "/kina-market-hero.png"}
              alt={content.brand.heroImageAlt}
              className="h-36 w-full object-cover"
            />
            <div className="p-4">
              {content.hero.eyebrow ? (
                <p className="text-xs font-black text-[#8b5f10]">
                  {content.hero.eyebrow}
                </p>
              ) : null}
              <h2 className="mt-2 text-xl font-black leading-7">
                {content.hero.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#655c4e]">
                {content.hero.subtitle}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <PreviewMetric label="매입가" value={content.market.buy.price} />
            <PreviewMetric label="매도가" value={content.market.sell.price} />
            <PreviewMetric label="판매 목록" value={totalSellerAmount} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function BrandPanel({
  content,
  updateBrand,
  updateHero,
  updateNoticeModal,
  uploadImage,
  uploading,
}: {
  content: SiteContent;
  updateBrand: (patch: Partial<SiteContent["brand"]>) => void;
  updateHero: (patch: Partial<SiteContent["hero"]>) => void;
  updateNoticeModal: (patch: Partial<SiteContent["noticeModal"]>) => void;
  uploadImage: (file: File, onUrl: (url: string) => void) => Promise<void>;
  uploading: boolean;
}) {
  return (
    <div className="grid gap-8">
      <PanelHeader title="기본 정보" description="브랜드, 공지, 카카오 상담 연결" />

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="사이트 이름"
          value={content.brand.name}
          onChange={(name) => updateBrand({ name })}
        />
        <TextInput
          label="짧은 브랜드명"
          value={content.brand.shortName}
          onChange={(shortName) => updateBrand({ shortName })}
        />
        <TextInput
          label="카카오톡 ID"
          value={content.brand.kakaoId}
          onChange={(kakaoId) => updateBrand({ kakaoId })}
        />
        <TextInput
          label="카카오 링크"
          value={content.brand.kakaoUrl}
          onChange={(kakaoUrl) => updateBrand({ kakaoUrl })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="공지 제목"
          value={content.brand.noticeTitle}
          onChange={(noticeTitle) => updateBrand({ noticeTitle })}
        />
        <TextArea
          label="공지 내용"
          value={content.brand.noticeBody}
          onChange={(noticeBody) => updateBrand({ noticeBody })}
        />
      </div>

      <PanelHeader
        title="공지 팝업"
        description="사용자 사이트 접속 시 모달로 띄우는 공지"
      />

      <div className="grid gap-4 rounded-lg bg-[#f8f4eb] p-4">
        <ToggleField
          label="공지 팝업 사용"
          description="켜두면 사용자 사이트 접속 시 공지 모달이 먼저 표시됩니다."
          checked={content.noticeModal.enabled}
          onChange={(enabled) => updateNoticeModal({ enabled })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="팝업 제목"
            value={content.noticeModal.title}
            onChange={(title) => updateNoticeModal({ title })}
          />
          <TextInput
            label="버튼 문구"
            value={content.noticeModal.buttonLabel}
            onChange={(buttonLabel) => updateNoticeModal({ buttonLabel })}
          />
        </div>
        <TextArea
          label="팝업 내용"
          value={content.noticeModal.body}
          onChange={(body) => updateNoticeModal({ body })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ImageField
          label="로고"
          value={content.brand.logoUrl}
          alt={content.brand.logoAlt}
          uploading={uploading}
          onUrl={(logoUrl) => updateBrand({ logoUrl })}
          onAlt={(logoAlt) => updateBrand({ logoAlt })}
          uploadImage={uploadImage}
        />
        <ImageField
          label="메인 배너"
          value={content.brand.heroImageUrl}
          alt={content.brand.heroImageAlt}
          uploading={uploading}
          onUrl={(heroImageUrl) => updateBrand({ heroImageUrl })}
          onAlt={(heroImageAlt) => updateBrand({ heroImageAlt })}
          uploadImage={uploadImage}
        />
      </div>

      <PanelHeader title="첫 화면 문구" description="상단 배너에 노출되는 문구" />

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="상단 라벨"
          value={content.hero.eyebrow}
          onChange={(eyebrow) => updateHero({ eyebrow })}
        />
        <TextInput
          label="제목"
          value={content.hero.title}
          onChange={(title) => updateHero({ title })}
        />
        <TextInput
          label="상담 버튼"
          value={content.hero.primaryCta}
          onChange={(primaryCta) => updateHero({ primaryCta })}
        />
        <TextInput
          label="보조 버튼"
          value={content.hero.secondaryCta}
          onChange={(secondaryCta) => updateHero({ secondaryCta })}
        />
      </div>

      <TextArea
        label="설명"
        value={content.hero.subtitle}
        onChange={(subtitle) => updateHero({ subtitle })}
      />
      <TextArea
        label="신뢰 배지"
        value={toLines(content.hero.trustBadges)}
        onChange={(value) => updateHero({ trustBadges: fromLines(value) })}
      />
    </div>
  );
}

function SeoPanel({
  content,
  updateSeo,
  uploadImage,
  uploading,
}: {
  content: SiteContent;
  updateSeo: (patch: Partial<SiteContent["seo"]>) => void;
  uploadImage: (file: File, onUrl: (url: string) => void) => Promise<void>;
  uploading: boolean;
}) {
  const { seo } = content;

  return (
    <div className="grid gap-8">
      <PanelHeader
        title="SEO 설정"
        description="검색 결과와 링크 공유 미리보기에 표시되는 정보"
      />

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="사이트 이름"
            value={seo.siteName}
            onChange={(siteName) => updateSeo({ siteName })}
          />
          <TextInput
            label="대표 주소 (Canonical)"
            value={seo.canonicalUrl}
            onChange={(canonicalUrl) => updateSeo({ canonicalUrl })}
          />
        </div>
        <TextInput
          label="페이지 제목"
          value={seo.title}
          onChange={(title) => updateSeo({ title })}
        />
        <TextArea
          label="페이지 설명"
          value={seo.description}
          onChange={(description) => updateSeo({ description })}
        />
        <TextArea
          label="검색 키워드"
          value={toLines(seo.keywords)}
          onChange={(value) => updateSeo({ keywords: fromLines(value) })}
        />
      </div>

      <PanelHeader
        title="공유 미리보기"
        description="카카오톡과 SNS에서 링크를 공유할 때 사용하는 Open Graph 정보"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="OG 제목"
          value={seo.ogTitle}
          onChange={(ogTitle) => updateSeo({ ogTitle })}
        />
        <TextArea
          label="OG 설명"
          value={seo.ogDescription}
          onChange={(ogDescription) => updateSeo({ ogDescription })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <ImageField
          label="OG 대표 이미지"
          value={seo.ogImageUrl}
          alt={seo.ogImageAlt}
          uploading={uploading}
          onUrl={(ogImageUrl) => updateSeo({ ogImageUrl })}
          onAlt={(ogImageAlt) => updateSeo({ ogImageAlt })}
          uploadImage={uploadImage}
        />
        <div className="grid content-start gap-4 rounded-lg bg-[#f8f4eb] p-4">
          <NumberInput
            label="이미지 너비"
            value={seo.ogImageWidth}
            onChange={(ogImageWidth) => updateSeo({ ogImageWidth })}
          />
          <NumberInput
            label="이미지 높이"
            value={seo.ogImageHeight}
            onChange={(ogImageHeight) => updateSeo({ ogImageHeight })}
          />
          <p className="text-xs font-semibold leading-5 text-[#766b58]">
            업로드한 원본 이미지의 실제 픽셀 크기를 입력하세요.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#d8cfbd] bg-white">
        {seo.ogImageUrl ? (
          <img
            src={seo.ogImageUrl}
            alt={seo.ogImageAlt}
            className="aspect-video w-full object-cover"
          />
        ) : null}
        <div className="p-4">
          <p className="text-xs font-black text-[#8b5f10]">공유 미리보기</p>
          <h3 className="mt-2 text-lg font-black leading-6 text-[#181512]">
            {seo.ogTitle || seo.title}
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#655c4e]">
            {seo.ogDescription || seo.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function MarketPanel({
  content,
  updateMarket,
  updateQuote,
  updateExchange,
  addExchange,
  removeExchange,
}: {
  content: SiteContent;
  updateMarket: (patch: Partial<SiteContent["market"]>) => void;
  updateQuote: (kind: "buy" | "sell", patch: Partial<PriceQuote>) => void;
  updateExchange: (index: number, patch: Partial<ExchangeSection>) => void;
  addExchange: () => void;
  removeExchange: (index: number) => void;
}) {
  return (
    <div className="grid gap-8">
      <PanelHeader title="시세 영역" description="매입가, 매도가, 안내 문구" />

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="섹션 제목"
          value={content.market.title}
          onChange={(title) => updateMarket({ title })}
        />
        <TextInput
          label="기준 단위"
          value={content.market.baseUnit}
          onChange={(baseUnit) => updateMarket({ baseUnit })}
        />
        <TextInput
          label="업데이트 표시"
          value={content.market.updatedAt}
          onChange={(updatedAt) => updateMarket({ updatedAt })}
        />
        <TextInput
          label="섹션 설명"
          value={content.market.description}
          onChange={(description) => updateMarket({ description })}
        />
        <TextInput
          label="결제 안내"
          value={content.market.paymentNotice}
          onChange={(paymentNotice) => updateMarket({ paymentNotice })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <QuoteEditor
          title="매입 카드"
          quote={content.market.buy}
          onChange={(patch) => updateQuote("buy", patch)}
        />
        <QuoteEditor
          title="매도 카드"
          quote={content.market.sell}
          onChange={(patch) => updateQuote("sell", patch)}
        />
      </div>

      <TextArea
        label="거래 안내"
        value={toLines(content.market.notes)}
        onChange={(value) => updateMarket({ notes: fromLines(value) })}
      />

      <div className="flex items-center justify-between gap-3 border-t border-[#ebe3d4] pt-6">
        <PanelHeader title="거래소 가격표" description="월드/일반 등 가격표" />
        <IconButton label="추가" icon={Plus} onClick={addExchange} />
      </div>

      <div className="grid gap-5">
        {content.exchanges.map((exchange, index) => (
          <div key={exchange.id} className="border-t border-[#ebe3d4] pt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-black">{exchange.title}</h3>
              <IconButton
                label="삭제"
                icon={Trash2}
                variant="danger"
                onClick={() => removeExchange(index)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="제목"
                value={exchange.title}
                onChange={(title) => updateExchange(index, { title })}
              />
              <TextInput
                label="설명"
                value={exchange.description}
                onChange={(description) => updateExchange(index, { description })}
              />
              <TextInput
                label="매입 라벨"
                value={exchange.buyLabel}
                onChange={(buyLabel) => updateExchange(index, { buyLabel })}
              />
              <TextInput
                label="매입가"
                value={exchange.buyPrice}
                onChange={(buyPrice) => updateExchange(index, { buyPrice })}
              />
              <TextInput
                label="매도 라벨"
                value={exchange.sellLabel}
                onChange={(sellLabel) => updateExchange(index, { sellLabel })}
              />
              <TextInput
                label="매도가"
                value={exchange.sellPrice}
                onChange={(sellPrice) => updateExchange(index, { sellPrice })}
              />
              <TextInput
                label="단위"
                value={exchange.unit}
                onChange={(unit) => updateExchange(index, { unit })}
              />
              <TextArea
                label="특징"
                value={toLines(exchange.features)}
                onChange={(value) =>
                  updateExchange(index, { features: fromLines(value) })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SellersPanel({
  sellers,
  updateSeller,
  addSeller,
  removeSeller,
}: {
  sellers: SellerListing[];
  updateSeller: (index: number, patch: Partial<SellerListing>) => void;
  addSeller: () => void;
  removeSeller: (index: number) => void;
}) {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <PanelHeader title="판매 목록" description="서버별 판매자와 수량" />
        <IconButton label="추가" icon={Plus} onClick={addSeller} />
      </div>

      {sellers.map((seller, index) => (
        <div key={seller.id} className="border-t border-[#ebe3d4] pt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-black text-[#4f473b]">
              <input
                type="checkbox"
                checked={seller.featured}
                onChange={(event) =>
                  updateSeller(index, { featured: event.target.checked })
                }
                className="h-4 w-4 accent-[#0f766e]"
              />
              추천 표시
            </label>
            <IconButton
              label="삭제"
              icon={Trash2}
              variant="danger"
              onClick={() => removeSeller(index)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <TextInput
              label="서버"
              value={seller.server}
              onChange={(server) => updateSeller(index, { server })}
            />
            <TextInput
              label="판매자"
              value={seller.seller}
              onChange={(sellerName) =>
                updateSeller(index, { seller: sellerName })
              }
            />
            <TextInput
              label="가격"
              value={seller.price}
              onChange={(price) => updateSeller(index, { price })}
            />
            <TextInput
              label="단위"
              value={seller.unit}
              onChange={(unit) => updateSeller(index, { unit })}
            />
            <TextInput
              label="수량"
              value={seller.amount}
              onChange={(amount) => updateSeller(index, { amount })}
            />
            <TextInput
              label="등록 시간"
              value={seller.timeAgo}
              onChange={(timeAgo) => updateSeller(index, { timeAgo })}
            />
            <TextInput
              label="버튼 문구"
              value={seller.contactLabel}
              onChange={(contactLabel) =>
                updateSeller(index, { contactLabel })
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ServicesPanel({
  services,
  updateService,
  addService,
  removeService,
}: {
  services: ServiceCard[];
  updateService: (index: number, patch: Partial<ServiceCard>) => void;
  addService: () => void;
  removeService: (index: number) => void;
}) {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <PanelHeader title="서비스 카드" description="하단 서비스 메뉴" />
        <IconButton label="추가" icon={Plus} onClick={addService} />
      </div>

      {services.map((service, index) => (
        <div key={service.id} className="border-t border-[#ebe3d4] pt-5">
          <div className="mb-4 flex justify-end">
            <IconButton
              label="삭제"
              icon={Trash2}
              variant="danger"
              onClick={() => removeService(index)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="제목"
              value={service.title}
              onChange={(title) => updateService(index, { title })}
            />
            <TextInput
              label="버튼 문구"
              value={service.actionLabel}
              onChange={(actionLabel) => updateService(index, { actionLabel })}
            />
            <TextInput
              label="링크"
              value={service.href}
              onChange={(href) => updateService(index, { href })}
            />
            <TextArea
              label="설명"
              value={service.description}
              onChange={(description) =>
                updateService(index, { description })
              }
            />
            <TextArea
              label="항목"
              value={toLines(service.bullets)}
              onChange={(value) =>
                updateService(index, { bullets: fromLines(value) })
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FooterPanel({
  content,
  setContent,
}: {
  content: SiteContent;
  setContent: Dispatch<SetStateAction<SiteContent>>;
}) {
  return (
    <div className="grid gap-8">
      <PanelHeader title="상담 영역" description="하단 상담 박스" />
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="제목"
          value={content.support.title}
          onChange={(title) =>
            setContent((current) => ({
              ...current,
              support: { ...current.support, title },
            }))
          }
        />
        <TextInput
          label="버튼 문구"
          value={content.support.kakaoLabel}
          onChange={(kakaoLabel) =>
            setContent((current) => ({
              ...current,
              support: { ...current.support, kakaoLabel },
            }))
          }
        />
        <TextInput
          label="카카오 상담 이미지 주소"
          value={content.support.kakaoImageUrl}
          onChange={(kakaoImageUrl) =>
            setContent((current) => ({
              ...current,
              support: { ...current.support, kakaoImageUrl },
            }))
          }
        />
        <TextInput
          label="거래 시간"
          value={content.support.hours}
          onChange={(hours) =>
            setContent((current) => ({
              ...current,
              support: { ...current.support, hours },
            }))
          }
        />
        <TextInput
          label="응답 안내"
          value={content.support.response}
          onChange={(response) =>
            setContent((current) => ({
              ...current,
              support: { ...current.support, response },
            }))
          }
        />
        <TextArea
          label="설명"
          value={content.support.description}
          onChange={(description) =>
            setContent((current) => ({
              ...current,
              support: { ...current.support, description },
            }))
          }
        />
      </div>

      <PanelHeader title="하단 정보" description="푸터 문구와 링크" />
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="회사명"
          value={content.footer.companyName}
          onChange={(companyName) =>
            setContent((current) => ({
              ...current,
              footer: { ...current.footer, companyName },
            }))
          }
        />
        <TextInput
          label="저작권"
          value={content.footer.copyright}
          onChange={(copyright) =>
            setContent((current) => ({
              ...current,
              footer: { ...current.footer, copyright },
            }))
          }
        />
        <TextArea
          label="설명"
          value={content.footer.description}
          onChange={(description) =>
            setContent((current) => ({
              ...current,
              footer: { ...current.footer, description },
            }))
          }
        />
        <TextArea
          label="링크"
          value={toLines(content.footer.links)}
          onChange={(value) =>
            setContent((current) => ({
              ...current,
              footer: { ...current.footer, links: fromLines(value) },
            }))
          }
        />
      </div>
    </div>
  );
}

function QuoteEditor({
  title,
  quote,
  onChange,
}: {
  title: string;
  quote: PriceQuote;
  onChange: (patch: Partial<PriceQuote>) => void;
}) {
  return (
    <div className="rounded-lg bg-[#f8f4eb] p-4">
      <h3 className="text-sm font-black text-[#4f473b]">{title}</h3>
      <div className="mt-4 grid gap-4">
        <TextInput
          label="라벨"
          value={quote.label}
          onChange={(label) => onChange({ label })}
        />
        <TextInput
          label="가격"
          value={quote.price}
          onChange={(price) => onChange({ price })}
        />
        <TextInput
          label="단위"
          value={quote.unit}
          onChange={(unit) => onChange({ unit })}
        />
        <TextInput
          label="변동"
          value={quote.change}
          onChange={(change) => onChange({ change })}
        />
        <label className="block">
          <span className="text-sm font-black text-[#4f473b]">추세</span>
          <select
            className={inputClass}
            value={quote.trend}
            onChange={(event) =>
              onChange({ trend: event.target.value as QuoteTrend })
            }
          >
            <option value="up">상승</option>
            <option value="down">하락</option>
            <option value="flat">보합</option>
          </select>
        </label>
      </div>
    </div>
  );
}

function ImageField({
  label,
  value,
  alt,
  uploading,
  onUrl,
  onAlt,
  uploadImage,
}: {
  label: string;
  value: string;
  alt: string;
  uploading: boolean;
  onUrl: (value: string) => void;
  onAlt: (value: string) => void;
  uploadImage: (file: File, onUrl: (url: string) => void) => Promise<void>;
}) {
  return (
    <div className="rounded-lg bg-[#f8f4eb] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-[#4f473b]">{label}</p>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#113c3a] px-3 text-xs font-black text-white transition hover:bg-[#0d302e]">
          <Upload size={15} aria-hidden="true" />
          {uploading ? "업로드 중" : "업로드"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadImage(file, onUrl);
              }
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      <div className="mt-3 grid h-36 place-items-center overflow-hidden rounded-lg border border-[#d8cfbd] bg-white">
        {value ? (
          <img src={value} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="text-[#9f927c]" size={32} aria-hidden="true" />
        )}
      </div>
      <TextInput label="이미지 주소" value={value} onChange={onUrl} />
      <TextInput label="대체 텍스트" value={alt} onChange={onAlt} />
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-[#d8cfbd] bg-white px-4 py-3">
      <span>
        <span className="block text-sm font-black text-[#4f473b]">{label}</span>
        <span className="mt-1 block text-sm font-semibold leading-5 text-[#766b58]">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-[#17b7a7]" : "bg-[#cfc6b6]"
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#4f473b]">{label}</span>
      <input
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#4f473b]">{label}</span>
      <input
        className={inputClass}
        type="number"
        min="1"
        step="1"
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          if (Number.isFinite(nextValue) && nextValue > 0) {
            onChange(Math.round(nextValue));
          }
        }}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#4f473b]">{label}</span>
      <textarea
        className={textareaClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PanelHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-black text-[#181512]">{title}</h2>
      <p className="mt-1 text-sm font-semibold text-[#766b58]">{description}</p>
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  variant = "default",
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  const className =
    variant === "danger"
      ? "border-[#efc6bd] bg-[#fff4f2] text-[#b23626] hover:bg-[#ffe8e3]"
      : "border-[#cdbb91] bg-[#fffaf0] text-[#3f3525] hover:bg-[#f4c95d]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-black transition ${className}`}
    >
      <Icon size={15} aria-hidden="true" />
      {label}
    </button>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f8f4eb] p-4">
      <p className="text-xs font-black text-[#7a705e]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#181512]">{value}</p>
    </div>
  );
}

function toLines(items: string[]) {
  return items.join("\n");
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
