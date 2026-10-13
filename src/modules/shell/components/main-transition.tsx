"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { drillDirection } from "@/modules/shell/lib/drill-nav";

export function MainTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const from = previous.current;
  if (from !== pathname) previous.current = pathname;
  const direction = drillDirection(from, pathname);
  const motion = direction === "none" ? "" : `drill-in-${direction}`;

  return (
    <div key={pathname} className={motion}>
      {children}
    </div>
  );
}
