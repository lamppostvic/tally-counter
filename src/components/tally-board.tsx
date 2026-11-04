"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type TallyRow = { categoryId: number; name: string; count: number };
export type TallyGroup = { division: string; rows: TallyRow[] };

const supabase = createClient();

export function TallyBoard({ gameId, groups }: { gameId: string; groups: TallyGroup[] }) {
  const [counts, setCounts] = useState(
    () =>
      Object.fromEntries(
        groups.flatMap((g) => g.rows).map((r) => [r.categoryId, r.count]),
      ) as Record<number, number>,
  );
  const [error, setError] = useState<string | null>(null);

  async function bump(categoryId: number, delta: 1 | -1) {
    if (delta < 0 && counts[categoryId] <= 0) return;
    setError(null);
    // Optimistic: update instantly, roll back if the write fails.
    setCounts((c) => ({ ...c, [categoryId]: Math.max(0, c[categoryId] + delta) }));

    const { error } = await supabase.rpc("increment_tally", {
      p_game_id: gameId,
      p_category_id: categoryId,
      p_delta: delta,
    });

    if (error) {
      setCounts((c) => ({ ...c, [categoryId]: Math.max(0, c[categoryId] - delta) }));
      setError("Couldn't save that tap — check your connection.");
    }
  }

  return (
    <>
      {groups.map((group) => (
        <section key={group.division} className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            {group.division}
          </h2>
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {group.rows.map((row) => (
              <li key={row.categoryId} className="flex items-center gap-3 px-4 py-2">
                <span className="flex-1 font-medium">{row.name}</span>
                <button
                  onClick={() => bump(row.categoryId, -1)}
                  disabled={counts[row.categoryId] <= 0}
                  aria-label={`Remove one ${group.division} ${row.name}`}
                  className="size-11 rounded-lg border border-line text-xl leading-none text-muted transition-colors active:bg-background disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-10 text-center font-mono text-2xl tabular-nums">
                  {counts[row.categoryId]}
                </span>
                <button
                  onClick={() => bump(row.categoryId, 1)}
                  aria-label={`Add one ${group.division} ${row.name}`}
                  className="size-11 rounded-lg bg-accent text-xl leading-none text-accent-fg transition-opacity active:opacity-80"
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </>
  );
}
