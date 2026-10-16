import type { ReactNode } from "react";

/** Dashboard card with a heading; `action` sits at the end of the heading row. */
export function Card({
  title,
  action,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 p-4 rounded-[14px] bg-panel border border-line">
      <h3 className="flex items-center gap-2 mb-2.5 text-[13px] font-semibold">
        {title}
        {action}
      </h3>
      {children}
    </section>
  );
}

/** Small uppercase heading used for sections in drawers and panels. */
export const sectionHeadingClasses =
  "text-[11px] font-semibold tracking-[0.05em] uppercase text-dim";

/** Titled section inside a drawer or panel, with an optional count badge. */
export function Section({
  title,
  count,
  children,
}: {
  title?: ReactNode;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="mt-5.5">
      {title !== undefined && (
        <h3
          className={`flex items-center gap-1.5 mb-1 ${sectionHeadingClasses}`}
        >
          {title}
          {count !== undefined && (
            <>
              {" "}
              <span className="text-faint tracking-normal">{count}</span>
            </>
          )}
        </h3>
      )}
      {children}
    </section>
  );
}
