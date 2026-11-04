"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateGameState = { error?: string };

export async function createGame(_: CreateGameState, formData: FormData): Promise<CreateGameState> {
  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  if (!name) return { error: "Give the game a name." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .insert(date ? { name, date } : { name })
    .select("id")
    .single();

  if (error) return { error: error.message };
  redirect(`/games/${data.id}`);
}

export async function deleteGame(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("games").delete().eq("id", id);
  refresh();
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
