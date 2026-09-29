"use client";

import { PendingLink } from "@/components/pending-link";

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
    <PendingLink
      href={href}
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
      {(pending) => (
        <>
          {label}
          {pending && (
            <span
              className={`spinner ${active ? "" : "spinner-dark"}`}
              aria-hidden
              style={{ marginInlineStart: 6 }}
            />
          )}
        </>
      )}
    </PendingLink>
  );
}
