"use client";

import { useState, useTransition } from "react";
import { deleteGame } from "@/app/actions";

export function DeleteGameButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      await deleteGame(formData);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Delete ${name}`}
        onClick={() => setOpen(true)}
        className="px-4 py-3 text-sm text-muted hover:text-danger"
      >
        Delete
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-game-title-${id}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-4 shadow-lg">
            <h2 id={`delete-game-title-${id}`} className="text-base font-semibold tracking-tight">
              Delete this game?
            </h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-medium text-foreground">{name}</span> will be removed
              permanently. This can’t be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="h-10 rounded-lg px-3 text-sm text-muted hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirm}
                className="h-10 rounded-lg bg-danger px-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
