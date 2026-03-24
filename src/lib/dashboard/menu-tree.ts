import type { NavMenuRow, NavMenuTree } from "@/lib/dashboard/types";

export function buildMenuTree(rows: NavMenuRow[]): NavMenuTree[] {
  const visible = rows.filter((r) => r.is_visible);
  const byParent = new Map<string | null, NavMenuRow[]>();

  for (const r of visible) {
    const key = r.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(r);
  }

  for (const list of byParent.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order);
  }

  function walk(parentId: string | null): NavMenuTree[] {
    return (byParent.get(parentId) ?? []).map((row) => ({
      ...row,
      children: walk(row.id),
    }));
  }

  return walk(null);
}
