import type { ReactNode } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "./button";

/** Small pill label, e.g. "My team" or "Core". `spaced` adds a gap before it in running text. */
export function Tag({
  children,
  spaced = true,
}: {
  children: ReactNode;
  spaced?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center h-5 px-[7px] border border-line-strong rounded-full text-[11px] font-medium text-soft whitespace-nowrap align-middle${spaced ? " ml-1.5" : ""}`}
    >
      {children}
    </span>
  );
}

/** A wrapping row of tags. */
export function TagList({ children }: { children: ReactNode }) {
  return <span className="inline-flex flex-wrap gap-1">{children}</span>;
}

/** Keyboard shortcut hint, e.g. ⌘K. */
export const kbdClasses =
  "inline-grid place-items-center min-w-5 h-5 ml-auto px-[5px] py-0 border border-line-strong rounded-md bg-[#0b0b0b] font-sans text-[11px] font-medium leading-[normal] text-dim";

/** Helper-text spacing and size; add a colour (Note uses text-dim). */
export const noteClasses = "mt-2.5 text-[12.5px] leading-[1.6]";

/** Muted helper text. */
export function Note({ children }: { children: ReactNode }) {
  return <p className={`${noteClasses} text-dim`}>{children}</p>;
}

/** A failed load, with an optional retry. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="grid justify-items-center gap-2 py-10 px-5 text-center text-dim text-[13px]"
      role="alert"
    >
      <CircleAlert size={20} strokeWidth={1.7} />
      <b className="text-fg text-[14px]">Something went wrong</b>
      <span>{message}</span>
      {onRetry && (
        <Button onClick={onRetry}>
          <RotateCw size={14} />
          Try again
        </Button>
      )}
    </div>
  );
}

/** Nothing to show, such as a search with no matches. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="py-9 text-center text-dim text-[13px]">{children}</div>
  );
}

/** Loading placeholder lines. */
export function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="py-1" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <span
          key={index}
          className="block h-3 my-2.5 rounded-md bg-[linear-gradient(90deg,#141414,#1e1e1e,#141414)] bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none"
          style={{ width: `${90 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
