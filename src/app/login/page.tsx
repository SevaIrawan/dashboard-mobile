import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SITE_COMPANY_NAME, SITE_LOGO_PUBLIC_PATH } from "@/lib/branding/site";
import { getDashboardSession } from "@/lib/auth/dashboard-session";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function LoginPage() {
  const dashboardSession = await getDashboardSession();
  if (dashboardSession) redirect("/myr");

  const supabase = await createServerSupabase();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/myr");
  }

  return (
    <div className="app-backdrop flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden bg-[#355f9b] px-4 py-8">
      <main className="w-full max-w-[430px]">
        <section className="rounded-3xl border border-white/15 bg-[#172741] p-6 shadow-[0_12px_40px_rgba(6,13,30,0.45)]">
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/60 bg-[#0c1528] shadow-[0_0_24px_rgba(250,204,21,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SITE_LOGO_PUBLIC_PATH}
                alt={`${SITE_COMPANY_NAME} logo`}
                className="h-16 w-16 rounded-full object-contain"
              />
            </div>
            <h1 className="mt-5 text-center text-[1.35rem] font-bold text-white">
              {SITE_COMPANY_NAME}
            </h1>
            <p className="mt-1 text-center text-sm font-semibold text-slate-200">
              Sign in to your account
            </p>
          </div>

          <LoginForm />
        </section>
      </main>
    </div>
  );
}
