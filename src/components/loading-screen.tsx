import type { ReactNode } from "react";

/** Full-screen centred message shown while a session or page loads. */
export function LoadingScreen({
  children,
  status = false,
}: {
  children: ReactNode;
  /** Announce the message to screen readers. */
  status?: boolean;
}) {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-[25px] text-[#999]"
      role={status ? "status" : undefined}
    >
      {children}
    </div>
  );
}
