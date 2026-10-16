"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { errorMessage } from "@/lib/api";
import { Button } from "./button";
import { InlineError } from "./form";

/** Delete button that asks for confirmation inline and shows the API's reason if it fails. */
export function ConfirmDelete({
  what,
  onConfirm,
}: {
  /** The record type, used in labels: "Delete team", "Delete this team?". */
  what: string;
  onConfirm: () => Promise<void>;
}) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!asking)
    return (
      <Button variant="danger" onClick={() => setAsking(true)}>
        <Trash2 size={14} />
        Delete {what}
      </Button>
    );
  return (
    <div
      className="flex flex-wrap items-center gap-2 text-[13px]"
      role="alertdialog"
      aria-label={`Delete ${what}`}
    >
      <span>Delete this {what}? This can’t be undone.</span>
      <Button
        variant="danger"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await onConfirm();
          } catch (caught) {
            setError(errorMessage(caught));
            setBusy(false);
          }
        }}
      >
        {busy ? "Deleting…" : "Delete"}
      </Button>
      <Button onClick={() => setAsking(false)} disabled={busy}>
        Keep
      </Button>
      <InlineError message={error} />
    </div>
  );
}
