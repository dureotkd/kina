import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { hasAdminSession } from "@/lib/admin-auth";
import { getCommunityData } from "@/lib/community-store";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "사이트 관리자",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const isAuthenticated = await hasAdminSession();
  const [content, communityData] = isAuthenticated
    ? await Promise.all([getSiteContent(), getCommunityData()])
    : [null, null];

  return (
    <AdminShell
      isAuthenticated={isAuthenticated}
      initialContent={content}
      initialCommunityData={communityData}
    />
  );
}
