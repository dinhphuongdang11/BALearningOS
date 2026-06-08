import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const envPassword = process.env.ADMIN_PASSWORD || "admin";

    if (!password) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập mật khẩu" }, { status: 400 });
    }

    if (password === envPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Mật khẩu quản trị viên không chính xác" }, { status: 401 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
