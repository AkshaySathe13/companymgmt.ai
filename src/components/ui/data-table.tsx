import type { HTMLAttributes, ReactNode } from "react";

export type Column = {
  label: ReactNode;
  /** Extra classes for the header cell, such as `tableClasses.hideOnPhone`. */
  className?: string;
};

/** Classes for the cells and rows that features write inside a DataTable. */
export const tableClasses = {
  cell: "h-[42px] pr-3 border-t border-line align-middle",
  /** Row background on hover, for rows that aren't selected. */
  row: "hover:[&>td]:bg-[#0b0b0b]",
  /** Keyboard-focusable row that opens a record; focus shows as the hover background. */
  clickableRow:
    "cursor-pointer focus-visible:outline-none hover:[&>td]:bg-[#0b0b0b] focus-visible:[&>td]:bg-[#0b0b0b]",
  /** Group heading row, e.g. a team name above its members. */
  groupCell:
    "pt-3.5 pb-1.5 text-[11px] font-semibold tracking-[0.05em] uppercase text-soft",
  numeric: "text-right tabular-nums",
  hideOnPhone: "max-phone:hidden",
};

/** Scrollable data table. Rows are passed as children so each feature keeps its own row markup. */
export function DataTable({
  columns,
  children,
  bodyProps,
}: {
  columns: Column[];
  children: ReactNode;
  bodyProps?: HTMLAttributes<HTMLTableSectionElement>;
}) {
  return (
    <div className="overflow-x-auto min-w-0">
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`py-2 pr-3 text-left text-[12px] font-medium text-dim whitespace-nowrap${column.className ? ` ${column.className}` : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody {...bodyProps}>{children}</tbody>
      </table>
    </div>
  );
}
