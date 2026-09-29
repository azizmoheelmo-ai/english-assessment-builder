"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";

export function LinkPendingHint({ dark = false }: { dark?: boolean }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className={`spinner ${dark ? "spinner-dark" : ""}`}
      aria-hidden
      style={{ marginInlineStart: 6 }}
    />
  );
}

export function ModelTab({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="tab"
      style={{
        padding: "9px 18px",
        borderRadius: 9,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "'IBM Plex Sans'",
        background: active ? "var(--brand)" : "#fff",
        color: active ? "#fff" : "var(--muted)",
        border: active ? "none" : "1px solid var(--border)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {label}
      <LinkPendingHint dark={!active} />
    </Link>
  );
}
