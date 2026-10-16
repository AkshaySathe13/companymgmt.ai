import type { FormHTMLAttributes, ReactNode } from "react";

/** Text inputs and selects in drawer forms. */
export const inputClasses =
  "h-9 px-2.5 rounded-[9px] bg-raised border border-line-strong text-[13px] text-fg [&_option]:bg-[#1b1b1b]";

/** Compact selects in toolbars and inline pickers. */
export const compactSelectClasses =
  "h-7.5 px-2.5 rounded-[9px] bg-raised border border-line-strong text-[13px] text-[#d6d6d6] [&_option]:bg-[#1b1b1b]";

/** Stacked form layout used in drawers. */
export function Form({
  className,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      className={`grid gap-3 mt-1.5${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

/** Label text above a control. */
export const fieldLabelClasses = "text-[12px] text-subtle";

/** A labelled control: the label wraps the input, select or textarea it names. */
export function Field({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className={`grid gap-[5px] ${fieldLabelClasses}`}>
      {label}
      {children}
    </label>
  );
}

/** Form-level error. Always rendered so screen readers announce changes. */
export function FormError({ children }: { children?: ReactNode }) {
  return (
    <p className="min-h-[1em] text-[12px] text-bad" role="alert">
      {children}
    </p>
  );
}

/** Inline error that only appears when there is a message. */
export function InlineError({ message }: { message?: string }) {
  return message ? <FormError>{message}</FormError> : null;
}

/** Row of form or panel actions, primary action first. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 mt-3">{children}</div>;
}
