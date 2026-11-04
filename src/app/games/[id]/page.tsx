import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { TallyBoard, type TallyGroup } from "@/components/tally-board";
import { formatGameDate } from "@/lib/format";

export default function GamePage({ params }: PageProps<"/games/[id]">) {
  return (
    <>
      <Header back />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <Game params={params} />
        </Suspense>
      </main>
    </>
  );
}

type Category = { id: number; name: string; [key: string]: unknown };

const DIVISIONS = ["MM", "WM"] as const;
const CATEGORY_ORDER = ["touches", "dead disc pickups", "assists", "goals"];

function categoryRank(label: string) {
  const i = CATEGORY_ORDER.indexOf(label.toLowerCase());
  return i === -1 ? CATEGORY_ORDER.length : i;
}

// Category names carry the division, e.g. "MM Goals" / "Goals (WM)".
function splitDivision(name: string) {
  const match = name.match(/\b(MM|WM)\b/i);
  if (!match) return { division: "Other", label: name };
  const label = name.replace(match[0], "").replace(/[\s\-–—:()[\]]+/g, " ").trim();
  return { division: match[1].toUpperCase(), label: label || name };
}

async function Game({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [gameRes, categoriesRes, talliesRes] = await Promise.all([
    supabase.from("games").select("id, name, date").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("id"),
    supabase.from("categories_tally").select("category_id, count").eq("game_id", id),
  ]);

  if (gameRes.error) return <ErrorText>{gameRes.error.message}</ErrorText>;
  if (!gameRes.data) notFound();
  const game = gameRes.data;

  const counts = new Map((talliesRes.data ?? []).map((t) => [t.category_id, t.count]));
  const categories = (categoriesRes.data ?? []) as Category[];

  const order = [...DIVISIONS, "Other"];
  const groups: TallyGroup[] = order
    .map((division) => ({
      division,
      rows: categories
        .map((c) => ({ c, ...splitDivision(c.name) }))
        .filter((x) => x.division === division)
        .map(({ c, label }) => ({ categoryId: c.id, name: label, count: counts.get(c.id) ?? 0 }))
        .sort((a, b) => categoryRank(a.name) - categoryRank(b.name) || a.name.localeCompare(b.name)),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">{game.name}</h1>
      <p className="text-sm text-muted">{formatGameDate(game.date)}</p>

      {categoriesRes.error || talliesRes.error ? (
        <ErrorText>{(categoriesRes.error ?? talliesRes.error)!.message}</ErrorText>
      ) : groups.length === 0 ? (
        <ErrorText>
          No categories came back. Check that the categories table has rows and that RLS
          allows signed-in users to read it.
        </ErrorText>
      ) : (
        <TallyBoard gameId={game.id} groups={groups} />
      )}
    </>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 text-sm text-danger">{children}</p>;
}
