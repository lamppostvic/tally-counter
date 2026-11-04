"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

export function LoginForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "in" ? signIn : signUp,
    {},
  );

  return (
    <form action={action} className="mt-8 flex flex-col gap-3">
      <input name="email" type="email" required autoComplete="email" placeholder="Email" className="field" />
      <input
        name="password"
        type="password"
        required
        minLength={6}
        autoComplete={mode === "in" ? "current-password" : "new-password"}
        placeholder="Password"
        className="field"
      />
      <button type="submit" disabled={pending} className="btn-primary mt-1">
        {pending ? "…" : mode === "in" ? "Sign in" : "Create account"}
      </button>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.message && <p className="text-sm text-muted">{state.message}</p>}

      <button
        type="button"
        onClick={() => setMode(mode === "in" ? "up" : "in")}
        className="mt-2 text-sm text-muted underline-offset-4 hover:underline"
      >
        {mode === "in" ? "No account? Create one" : "Have an account? Sign in"}
      </button>
    </form>
  );
}
