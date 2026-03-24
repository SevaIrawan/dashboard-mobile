export function SetupBanner() {
  return (
    <div className="border-b border-amber-300/80 bg-amber-50 px-2 py-2 text-center text-[10px] leading-snug text-amber-950 sm:px-4 sm:text-xs dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
      <span className="inline sm:hidden">
        Set env Supabase di{" "}
        <span className="font-medium">.env.local</span> + jalankan SQL migrasi.
      </span>
      <span className="hidden sm:inline">
        Supabase belum dikonfigurasi. Tambahkan{" "}
        <code className="rounded bg-amber-100/80 px-1 py-0.5 dark:bg-amber-900/60">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        dan{" "}
        <code className="rounded bg-amber-100/80 px-1 py-0.5 dark:bg-amber-900/60">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        di <span className="font-medium">.env.local</span>, lalu jalankan SQL di{" "}
        <code className="rounded bg-amber-100/80 px-1 py-0.5 dark:bg-amber-900/60">
          supabase/migrations
        </code>
        .
      </span>
    </div>
  );
}
