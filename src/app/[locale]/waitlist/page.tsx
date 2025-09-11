// app/waitlist/page.tsx
import Link from "next/link";
import Logo from "@/components/Logo";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/auth"; // ← from your NextAuth v5 setup
import { LogOut } from "lucide-react";

// Server action
async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" }); // send them home after sign-out
}

export default async function WaitlistPage() {
  const session = await auth();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Sticky header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex items-center justify-between px-12 py-8">
          <div className="flex items-center gap-2">
            <Logo width={45} />
            <span className="text-3xl font-semibold tracking-tight">
              Laureas
            </span>
          </div>
        </div>
      </header>

      <div className="h-16 md:h-[72px]" />

      <main className="flex flex-1 items-center justify-center px-6 py-28 md:py-36">
        <div className="mx-auto w-full max-w-2xl text-center">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            We're still building this
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Thanks for signing up! Access is limited while we keep developing.
            We'll send you an email as soon as it's available.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <form action={signOutAction}>
              <Button className="rounded-full" type="submit">
                <LogOut />
                LogOut
              </Button>
            </form>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-border bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo width={20} />
            <span className="text-sm font-semibold">Laureas</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Laureas, Inc.
          </p>
          <div className="flex gap-4 text-sm">
            <button className="opacity-80 hover:opacity-100">Privacy</button>
            <button className="opacity-80 hover:opacity-100">Terms</button>
            <a
              className="opacity-80 hover:opacity-100"
              href="mailto:hello@laureas.app"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
