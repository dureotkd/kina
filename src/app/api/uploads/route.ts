import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { saveUploadedImage } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "이미지 파일이 없습니다." },
        { status: 400 },
      );
    }

    const url = await saveUploadedImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "이미지 업로드 중 문제가 발생했습니다.",
      },
      { status: 400 },
    );
  }
}
