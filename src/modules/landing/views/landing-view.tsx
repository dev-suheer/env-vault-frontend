"use client";

import { homePath } from "@/lib/permissions";
import { useVault } from "@/lib/store";
import { LandingCta } from "@/modules/landing/components/landing-cta";
import { LandingFaq } from "@/modules/landing/components/landing-faq";
import { LandingFooter } from "@/modules/landing/components/landing-footer";
import { LandingForDevelopers } from "@/modules/landing/components/landing-for-developers";
import { LandingForManagers } from "@/modules/landing/components/landing-for-managers";
import { LandingHero } from "@/modules/landing/components/landing-hero";
import { LandingHighlights } from "@/modules/landing/components/landing-highlights";
import { LandingNav } from "@/modules/landing/components/landing-nav";
import { LandingProduct } from "@/modules/landing/components/landing-product";
// import { LandingRoles } from "@/modules/landing/components/landing-roles";
import { LandingSecurity } from "@/modules/landing/components/landing-security";
import { LandingStats } from "@/modules/landing/components/landing-stats";

export function LandingView() {
  const { me } = useVault();
  const start = {
    href: me ? homePath(me.role) : "/signup",
    label: me ? "Open app" : "Get started",
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-fg dark:bg-ink-950 dark:text-ink-100">
      <LandingNav />
      <LandingHero start={start} />
      <LandingHighlights />
      <LandingProduct />
      {/* <LandingRoles /> */}
      <LandingForManagers start={start} />
      <LandingForDevelopers />
      <LandingSecurity />
      <LandingStats />
      <LandingFaq />
      <LandingCta start={start} signedIn={Boolean(me)} />
      <LandingFooter />
    </div>
  );
}
