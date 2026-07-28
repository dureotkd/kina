import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSiteContent, writeSiteContent } from "@/lib/content-store";
import type { SiteContent } from "@/lib/site-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const content = (await request.json()) as SiteContent;
    const saved = await writeSiteContent(content);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json(
      { message: "저장 중 문제가 발생했습니다." },
      { status: 400 },
    );
  }
}
