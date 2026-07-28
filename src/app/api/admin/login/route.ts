import { NextResponse } from "next/server";
import { isValidAdminPassword, setAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    password?: unknown;
  };

  if (!isValidAdminPassword(body.password)) {
    return NextResponse.json(
      { message: "비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  setAdminSession(response);
  return response;
}
