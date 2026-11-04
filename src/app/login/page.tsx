import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in · Tally" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Tally</h1>
      <p className="mt-1 text-sm text-muted">Ultimate scorekeeping</p>
      <LoginForm />
    </main>
  );
}
