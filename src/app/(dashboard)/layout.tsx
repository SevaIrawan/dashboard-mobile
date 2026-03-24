import { BottomNavMock } from "@/components/mobile/BottomNavMock";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getDashboardSession } from "@/lib/auth/dashboard-session";
import { DashboardViewportFit } from "@/components/mobile/DashboardViewportFit";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  function renderFrame() {
    return (
      <DashboardViewportFit>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        <BottomNavMock />
      </DashboardViewportFit>
    );
  }

  const session = await getDashboardSession();
  if (session) {
    return renderFrame();
  }

  const supabase = await createServerSupabase();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  }

  return renderFrame();
}
