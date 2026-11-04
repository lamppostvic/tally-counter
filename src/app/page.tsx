import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { CreateGameForm } from "@/components/create-game-form";
import { DeleteGameButton } from "@/components/delete-game-button";
import { formatGameDate } from "@/lib/format";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <h1 className="text-lg font-semibold tracking-tight">New game</h1>
        <CreateGameForm />

        <h2 className="mt-10 text-lg font-semibold tracking-tight">Games</h2>
        <Suspense fallback={<p className="mt-4 text-sm text-muted">Loading…</p>}>
          <GameList />
        </Suspense>
      </main>
    </>
  );
}

async function GameList() {
  const supabase = await createClient();
  const { data: games, error } = await supabase
    .from("games")
    .select("id, name, date")
    .order("date", { ascending: false });

  if (error) return <p className="mt-4 text-sm text-danger">{error.message}</p>;
  if (!games?.length) return <p className="mt-4 text-sm text-muted">No games yet.</p>;

  return (
    <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
      {games.map((game) => (
        <li key={game.id} className="flex items-center">
          <Link href={`/games/${game.id}`} className="flex-1 px-4 py-3 hover:bg-background">
            <div className="font-medium">{game.name}</div>
            <div className="text-sm text-muted">{formatGameDate(game.date)}</div>
          </Link>
          <DeleteGameButton id={game.id} name={game.name} />
        </li>
      ))}
    </ul>
  );
}
