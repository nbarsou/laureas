"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

// shadcn/ui
import { Button } from "@/components/ui/button";

// lucide
import { ArrowRight } from "lucide-react";

// own components
import Logo from "@/components/Logo";

// Locale switcher you already have (the select version)
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function HomePage() {
  const t = useTranslations("HomePage"); // optional if you have messages

  const placeholder = useCallback((label: string) => {
    alert(`${label} (coming soon)`);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      {/* Header */}
      <header className="w-full border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-5">
          <div className="flex items-center gap-3">
            <Logo width={28} />
            <span className="text-lg font-semibold tracking-tight">
              Laureas
            </span>
          </div>

          {/* simple nav placeholders */}
          <nav className="ml-8 hidden gap-6 text-sm md:flex">
            <button
              className="hover:opacity-70"
              onClick={() => placeholder("Product")}
            >
              Product
            </button>
            <button
              className="hover:opacity-70"
              onClick={() => placeholder("Pricing")}
            >
              Pricing
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <LocaleSwitcher />
            <Button
              variant="ghost"
              className="hidden md:inline-flex"
              onClick={() => placeholder("Sign in")}
            >
              Sign in
            </Button>
            <Button
              className="rounded-full"
              onClick={() => placeholder("Talk to us")}
            >
              Talk to us <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-sm text-neutral-600">
            New! Manage tournaments easily with Laureas
          </p>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Modern tournament management
            <br className="hidden md:block" /> for every sport
          </h1>
          <p className="mt-5 text-lg text-neutral-700">
            The fully integrated platform to host, manage and elevate your
            competitions. Simple setup, powerful results.
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              className="rounded-full"
              onClick={() => placeholder("Talk to us")}
            >
              Talk to us <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
