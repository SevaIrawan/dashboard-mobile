import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { setDashboardSession } from "@/lib/auth/dashboard-session";

function pickValue(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;
  const username = body?.username?.trim() ?? "";
  const password = body?.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, message: "Username dan password wajib diisi." },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase belum terkonfigurasi." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase.from("users").select("*");
  if (error || !data) {
    return NextResponse.json(
      { ok: false, message: "Gagal membaca tabel users." },
      { status: 500 },
    );
  }

  const rows = data as Record<string, unknown>[];
  const matched = rows.find((row) => {
    const uname = pickValue(row, ["username", "user_name", "email", "login"]);
    const pass = pickValue(row, ["password", "password_hash", "pass", "pwd"]);
    return uname.toLowerCase() === username.toLowerCase() && pass === password;
  });

  if (!matched) {
    return NextResponse.json(
      { ok: false, message: "Username atau password tidak sesuai." },
      { status: 401 },
    );
  }

  const role =
    pickValue(matched, ["role", "user_role", "usertype", "position", "level"]) ||
    "admin";

  await setDashboardSession({ username, role });

  return NextResponse.json({ ok: true });
}
