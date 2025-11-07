import { clearSessionCookie } from "@/server/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await clearSessionCookie();
  // 303 ensures the browser does a GET to the redirect target after POST
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
