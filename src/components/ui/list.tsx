import type { ReactNode } from "react";

/**
 * A row in a list of people or teams: avatar, then a title over a detail line. Put `group` on
 * the clickable element so the title underlines on hover.
 */
export const listRowClasses = {
  row: "flex items-center gap-2.5 w-full py-[9px] border-t border-line first-of-type:border-t-0 min-w-0",
  /** For rows that are buttons or links themselves. */
  action: "group text-left cursor-pointer",
  /** Text column next to the avatar. */
  text: "flex-1 min-w-0",
  /** Text column with title and detail on one line. */
  inlineText: "flex-1 min-w-0 flex items-baseline gap-2",
  title:
    "block truncate text-[13px] font-medium decoration-[#555] underline-offset-3 group-hover:underline",
  detail: "block truncate text-[12px] text-dim",
};

/** Avatar plus name, used in table cells and headers. Links underline the name on hover. */
export const nameClasses = {
  wrap: "inline-flex items-center gap-[9px] min-w-0",
  link: "group inline-flex items-center gap-[9px] min-w-0",
  name: "font-medium truncate decoration-[#555] underline-offset-3 group-hover:underline",
};

/** Page title row; `children` sit at the far end (e.g. a status tag). */
export function PageHeader({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-4 flex-wrap mb-3">
      <div>
        <h1 className="text-[22px] font-[650] tracking-[-0.02em]">{title}</h1>
      </div>
      {children}
    </header>
  );
}
