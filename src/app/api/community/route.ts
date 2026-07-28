import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  addCommunityComment,
  createCommunityEntry,
  deleteCommunityEntry,
  getCommunityData,
  incrementEntryViews,
} from "@/lib/community-store";
import type { CommunityBoardKey } from "@/lib/community-types";

export const dynamic = "force-dynamic";

const boardKeys = new Set<CommunityBoardKey>([
  "sales",
  "buses",
  "community",
  "announcements",
  "scammers",
]);

export async function GET() {
  return NextResponse.json(await getCommunityData(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action?: string;
      type?: CommunityBoardKey;
      id?: string;
      payload?: unknown;
    };

    if (body.action === "comment") {
      if (!body.id) {
        throw new Error("게시글을 선택해주세요.");
      }

      return NextResponse.json(
        await addCommunityComment(body.id, body.payload),
        { status: 201 },
      );
    }

    if (body.action === "view") {
      if (!body.id || !isBoardKey(body.type)) {
        throw new Error("게시글을 선택해주세요.");
      }

      return NextResponse.json({
        views: await incrementEntryViews(body.type, body.id),
      });
    }

    if (!isBoardKey(body.type)) {
      throw new Error("게시판을 확인해주세요.");
    }

    if (body.type === "announcements" && !isAdminRequest(request)) {
      return NextResponse.json(
        { message: "관리자만 공지사항을 등록할 수 있습니다." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      await createCommunityEntry(body.type, body.payload),
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "등록하지 못했습니다.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(
      { message: "권한이 없습니다." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      type?: CommunityBoardKey;
      id?: string;
    };

    if (!body.id || !isBoardKey(body.type)) {
      throw new Error("삭제할 게시글을 선택해주세요.");
    }

    return NextResponse.json(
      await deleteCommunityEntry(body.type, body.id),
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "삭제하지 못했습니다.",
      },
      { status: 400 },
    );
  }
}

function isBoardKey(value: unknown): value is CommunityBoardKey {
  return typeof value === "string" && boardKeys.has(value as CommunityBoardKey);
}
