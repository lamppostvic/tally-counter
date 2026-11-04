"use client";

import { useActionState, useSyncExternalStore } from "react";
import { createGame, type CreateGameState } from "@/app/actions";

function todayLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const noopSubscribe = () => () => {};

export function CreateGameForm() {
  const [state, action, pending] = useActionState<CreateGameState, FormData>(createGame, {});
  // "Today" in the user's timezone; empty during server render.
  const today = useSyncExternalStore(noopSubscribe, todayLocal, () => "");

  return (
    <form action={action} className="mt-3 flex flex-col gap-3">
      <input name="name" required placeholder="e.g. vs. Rainmakers" className="field" />
      <div className="flex gap-3">
        <input key={today} name="date" type="date" required defaultValue={today} className="field" />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {pending ? "Creating…" : "Create"}
        </button>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
