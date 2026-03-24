import { cookies } from "next/headers";

const SESSION_COOKIE = "dashboard_session";

export type DashboardSession = {
  username: string;
  role: string;
};

function encodeSession(value: DashboardSession): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeSession(raw: string): DashboardSession | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as Partial<DashboardSession>;
    if (!parsed || typeof parsed.username !== "string") return null;
    return {
      username: parsed.username,
      role:
        typeof parsed.role === "string" && parsed.role.trim().length > 0
          ? parsed.role
          : "admin",
    };
  } catch {
    return null;
  }
}

export async function getDashboardSession(): Promise<DashboardSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export async function setDashboardSession(value: DashboardSession): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeSession(value), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearDashboardSession(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
