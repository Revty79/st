import { db } from "@/server/db";
import { verifyPassword } from "@/server/auth";
import { makeToken, setSessionCookie } from "@/server/session";

type DBUserRow = {
  id: string;
  username: string;
  email: string;
  pass_hash: string;
  role: "free" | "admin" | "worldbuilder" | "developer" | "privileged";
};

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return Response.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
    }

    const needle = String(username).trim();
    const row = db.prepare(
      `SELECT id, username, email, pass_hash, role
       FROM users
       WHERE username = ? OR lower(email) = lower(?)`
    ).get(needle, needle) as DBUserRow | undefined;

    if (!row) return Response.json({ ok: false, error: "INVALID_CREDENTIALS" }, { status: 401 });

    const ok = await verifyPassword(String(password), row.pass_hash);
    if (!ok) return Response.json({ ok: false, error: "INVALID_CREDENTIALS" }, { status: 401 });

    const { pass_hash, ...user } = row;

    const token = makeToken(user.id);
    await setSessionCookie(token);

    return Response.json({ ok: true, user }, { status: 200 });
  } catch (err) {
    console.error("login error:", err);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
