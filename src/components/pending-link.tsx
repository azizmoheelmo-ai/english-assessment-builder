"use client";

import { useTransition, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * A link that always shows a visible pending state for at least `minDelayMs`,
 * even when the underlying navigation is instant (e.g. served from the
 * Next.js router cache). Falls back to a normal browser navigation for
 * modified clicks (new tab, etc.) so it stays a real, right-clickable link.
 */
export function PendingLink({
  href,
  className,
  style,
  children,
  minDelayMs = 350,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: (pending: boolean) => ReactNode;
  minDelayMs?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    startTransition(async () => {
      const start = Date.now();
      router.push(href);
      const remaining = minDelayMs - (Date.now() - start);
      if (remaining > 0) await sleep(remaining);
    });
  }

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {children(isPending)}
    </a>
  );
}
