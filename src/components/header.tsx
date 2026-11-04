import Link from "next/link";
import { signOut } from "@/app/actions";

export function Header({ back }: { back?: boolean }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-line px-4">
      {back ? (
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Games
        </Link>
      ) : (
        <span className="text-sm font-semibold tracking-tight">Tally</span>
      )}
      <form action={signOut}>
        <button className="text-sm text-muted hover:text-foreground">Sign out</button>
      </form>
    </header>
  );
}
