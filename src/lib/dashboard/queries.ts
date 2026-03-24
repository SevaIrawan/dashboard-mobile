import { createServerSupabase } from "@/lib/supabase/server";
import { buildMenuTree } from "@/lib/dashboard/menu-tree";
import type {
  CompanyBranding,
  DashboardKpi,
  NavMenuRow,
  NavMenuTree,
} from "@/lib/dashboard/types";

export async function getCompanyBranding(): Promise<CompanyBranding | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("company_branding")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return null;
  return data as CompanyBranding;
}

export async function getNavMenuTree(): Promise<NavMenuTree[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("nav_menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return buildMenuTree(data as NavMenuRow[]);
}

export async function getMenuByPath(
  path: string,
): Promise<NavMenuRow | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;

  const { data, error } = await supabase
    .from("nav_menu_items")
    .select("*")
    .eq("path", normalized)
    .maybeSingle();

  if (error || !data) return null;
  return data as NavMenuRow;
}

export async function getKpisForMenu(
  menuId: string,
): Promise<DashboardKpi[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("dashboard_kpis")
    .select("*")
    .eq("menu_id", menuId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as DashboardKpi[];
}
