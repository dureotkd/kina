import "server-only";

import { createHash } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "admin123";
const ADMIN_COOKIE_NAME = "aion2_kina_admin";
const ADMIN_COOKIE_VALUE = createHash("sha256")
  .update(`aion2-kina-admin:${ADMIN_PASSWORD}`)
  .digest("hex");

export function isValidAdminPassword(password: unknown) {
  return typeof password === "string" && password === ADMIN_PASSWORD;
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_COOKIE_VALUE;
}

export function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === ADMIN_COOKIE_VALUE;
}

export function setAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
