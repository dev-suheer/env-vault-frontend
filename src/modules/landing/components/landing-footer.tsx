import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-white py-8 dark:border-ink-700 dark:bg-ink-950 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <Link href="/">
          <BrandLogo markClassName="h-7 w-7" wordmarkClassName="h-[18px]" />
        </Link>
        <p className="text-sm text-mute dark:text-ink-400">Your repo can be recloned. Your .env can&apos;t.</p>
      </div>
    </footer>
  );
}
