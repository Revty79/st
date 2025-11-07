import { db } from "@/server/db";
import { hashPassword } from "@/server/auth";
import { makeToken, setSessionCookie } from "@/server/session";

type DBUser = {
  id: string;
  username: string;
  email: string;
  role: "free" | "admin" | "worldbuilder" | "developer" | "privileged";
  created_at: string;
};

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    if (!username || !email || !password) {
      return Response.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
    }

    const uname = String(username).trim();
    const mail = String(email).trim().toLowerCase();

    const existsUser = db.prepare("SELECT 1 FROM users WHERE username = ?").get(uname);
    if (existsUser) return Response.json({ ok: false, error: "USERNAME_TAKEN" }, { status: 409 });

    const existsEmail = db.prepare("SELECT 1 FROM users WHERE email = ?").get(mail);
    if (existsEmail) return Response.json({ ok: false, error: "EMAIL_TAKEN" }, { status: 409 });

    const pass_hash = await hashPassword(String(password));
    const info = db
      .prepare(
        `INSERT INTO users (username, email, pass_hash, role)
         VALUES (?, ?, ?, 'free')`
      )
      .run(uname, mail, pass_hash);

    const user = db
      .prepare(
        `SELECT id, username, email, role, created_at
         FROM users WHERE rowid = ?`
      )
      .get(info.lastInsertRowid as number) as DBUser | undefined;

    if (!user) {
      return Response.json({ ok: false, error: "CREATE_FAILED" }, { status: 500 });
    }

    const token = makeToken(user.id);
    await setSessionCookie(token);

    return Response.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    console.error("register error:", err);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
