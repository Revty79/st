import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/server/db";

const NAME = "st_session";
const SECRET = process.env.TIDE_SECRET || "dev-secret-please-change";

function sign(payload: string) {
  const h = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${h}`;
}
function verify(token: string) {
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expect = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect)) ? payload : null;
}

export function makeToken(userId: string) {
  // payload: `${userId}:${timestamp}`
  return sign(`${userId}:${Date.now()}`);
}

export async function getSessionUser() {
  const jar = await cookies();
  const raw = jar.get(NAME)?.value;
  if (!raw) return null;
  const payload = verify(raw);
  if (!payload) return null;
  const [userId] = payload.split(":");
  const row = db.prepare(`SELECT id, username, email, role FROM users WHERE id = ?`).get(userId);
  return row ?? null;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set({
    name: NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    // 7 days
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set({ name: NAME, value: "", path: "/", maxAge: 0 });
}
