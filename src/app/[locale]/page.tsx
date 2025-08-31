import { useTranslations } from "next-intl";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import Logo from "@/components/Logo";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import { use } from "react";
import { setRequestLocale } from "next-intl/server";

export default function HomePage({
  params,
}: {
  // IMPORTANT: Promise here too
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  // Enable static rendering
  setRequestLocale(locale);

  const t = useTranslations("HomePage");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Sticky, translucent header (works in light & dark) */}
      <header className="fixed inset-x-0 top-0 z-50 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
          {/* left: brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">
              Laureas
            </span>
          </div>

          {/* right: actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* <ThemeToggle /> */}
            <LocaleSwitcher />
            <Button variant="default">Sign In</Button>
          </div>
        </div>
      </header>

      {/* spacer so content isn't hidden behind fixed header */}
      <div className="h-16 md:h-[72px]" />

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-6 py-32 text-center md:py-40 min-h-[80vh]">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            {t("hero.titleLine1")}
            <br className="hidden md:block" />
            {t("hero.titleLine2")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Button className="rounded-full">
              {t("actions.joinWaitlist")}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Early-stage friendly content (replaces “features”) */}
      <section className="">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-4xl font-semibold tracking-tight">
            {t("whatExistsToday")}
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-3">
            <Card title={t("cards.crud.title")} body={t("cards.crud.body")} />
            <Card
              title={t("cards.venues.title")}
              body={t("cards.venues.body")}
            />
            <Card
              title={t("cards.roundRobin.title")}
              body={t("cards.roundRobin.body")}
            />
            <Card
              title={t("cards.reschedule.title")}
              body={t("cards.reschedule.body")}
            />
            <Card
              title={t("cards.results.title")}
              body={t("cards.results.body")}
            />
            <Card
              title={t("cards.publicPages.title")}
              body={t("cards.publicPages.body")}
            />
          </div>

          {/* Supported sports */}
          <h2 className="mt-20 text-center text-4xl font-semibold tracking-tight">
            {t("sports.title")}
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="rounded-full border px-3 py-1">
              {t("sports.football")}{" "}
              <span className="opacity-70">
                ({t("sports.badges.supported")})
              </span>
            </span>
            <span className="rounded-full border px-3 py-1 opacity-70">
              {t("sports.volleyball")}{" "}
              <span className="opacity-70">
                ({t("sports.badges.comingSoon")})
              </span>
            </span>
            <span className="rounded-full border px-3 py-1 opacity-70">
              {t("sports.basketball")}{" "}
              <span className="opacity-70">
                ({t("sports.badges.comingSoon")})
              </span>
            </span>
            <span className="rounded-full border px-3 py-1 opacity-70">
              {t("sports.tennis")}{" "}
              <span className="opacity-70">
                ({t("sports.badges.comingSoon")})
              </span>
            </span>
            <span className="rounded-full border px-3 py-1 opacity-70">
              {t("sports.tennis")}{" "}
              <span className="opacity-70">
                ({t("sports.badges.comingSoon")})
              </span>
            </span>
            <span className="rounded-full border px-3 py-1 opacity-70">
              {t("sports.padel")}{" "}
              <span className="opacity-70">
                ({t("sports.badges.comingSoon")})
              </span>
            </span>
          </div>

          <h2 className="mt-20 text-center text-4xl font-semibold tracking-tight">
            {t("roadmap.title")}
          </h2>
          <ul className="mx-auto mt-8 max-w-3xl space-y-4 text-sm">
            <RoadmapItem
              label={t("roadmap.items.rrToPlayoffs")}
              statusLabel={t("roadmap.status.building")}
              statusKind="building"
            />
            <RoadmapItem
              label={t("roadmap.items.autoSeeding")}
              statusLabel={t("roadmap.status.building")}
              statusKind="building"
            />
            <RoadmapItem
              label={t("roadmap.items.enhancedPublic")}
              statusLabel={t("roadmap.status.next")}
              statusKind="next"
            />
            <RoadmapItem
              label={t("roadmap.items.customDomains")}
              statusLabel={t("roadmap.status.next")}
              statusKind="next"
            />
            <RoadmapItem
              label={t("roadmap.items.moreSports")}
              statusLabel={t("roadmap.status.research")}
              statusKind="research"
            />
          </ul>

          <h3 className="mt-16 text-center text-xl font-medium">
            {t("ctaSetupHelp")}
          </h3>
          <div className="mt-6 flex justify-center">
            <Button className="rounded-full">
              {t("actions.bookOnboarding")}
            </Button>
          </div>

          {/* FAQ */}
          <div className="mt-20 grid gap-8 md:grid-cols-2">
            <FAQ q={t("faq.q1.q")} a={t("faq.q1.a")} />
            <FAQ q={t("faq.q2.q")} a={t("faq.q2.a")} />
            <FAQ q={t("faq.q3.q")} a={t("faq.q3.a")} />
            <FAQ q={t("faq.q4.q")} a={t("faq.q4.a")} />
          </div>
        </div>
      </section>

      {/* Clean footer that sticks to bottom on short pages */}
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
            <button className="opacity-80 hover:opacity-100">
              {t("actions.privacy")}
            </button>
            <button className="opacity-80 hover:opacity-100">
              {t("actions.terms")}
            </button>
            <button className="opacity-80 hover:opacity-100">
              {t("actions.contact")}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------ tiny presentational helpers ------ */
function Card({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-muted-foreground">{body}</p>
    </div>
  );
}

// RoadmapItem.tsx (no next-intl here)
export function RoadmapItem({
  label,
  statusLabel,
  statusKind, // "building" | "next" | "research"
}: {
  label: string;
  statusLabel: string;
  statusKind: "building" | "next" | "research";
}) {
  const map = {
    building: "bg-green-500/15 text-green-700 border-green-500/20", // progress / active
    next: "bg-blue-500/15 text-blue-700 border-blue-500/20", // upcoming
    research: "bg-purple-500/15 text-purple-700 border-purple-500/20", // exploration
  } as const;

  return (
    <li className="flex items-center justify-between rounded-md border border-border p-3">
      <span>{label}</span>
      <span
        className={`rounded-full border px-2 py-0.5 text-[11px] ${map[statusKind]}`}
      >
        {statusLabel}
      </span>
    </li>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg border border-border p-5">
      <p className="font-medium">{q}</p>
      <p className="mt-2 text-muted-foreground">{a}</p>
    </div>
  );
}
