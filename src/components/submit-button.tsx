"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending}
      style={{ justifyContent: "center", marginTop: 6 }}
    >
      {pending && <span className="spinner" aria-hidden />}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
