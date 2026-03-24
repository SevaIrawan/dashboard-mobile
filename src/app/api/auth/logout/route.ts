import { NextResponse } from "next/server";
import { clearDashboardSession } from "@/lib/auth/dashboard-session";

export async function POST() {
  await clearDashboardSession();
  return NextResponse.json({ ok: true });
}
