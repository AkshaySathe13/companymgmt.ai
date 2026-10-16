import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "primary" | "danger";

// Buttons inherit the surrounding font and text colour; only the primary button sets its own.
const shape =
  "inline-flex items-center gap-1.5 h-7.5 border rounded-[9px] whitespace-nowrap cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  default: "border-line-strong hover:bg-hover hover:border-line-hover",
  primary:
    "border-white bg-white text-black hover:bg-[#e3e3e3] hover:border-line-hover",
  danger: "border-[#4a2020] hover:bg-[#1f0e0e] hover:border-[#6a2a2a]",
};

/** Classes for a button-styled element, for links that should look like buttons. */
export function buttonClasses({
  variant = "default",
  square = false,
}: { variant?: Variant; square?: boolean } = {}) {
  return `${shape} ${variants[variant]} ${square ? "w-7.5 justify-center" : "px-3"}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** Square, icon-only shape (pair it with an aria-label). */
  square?: boolean;
};

/** Text button. Leaves `type` to the caller, like a native button. */
export function Button({
  variant = "default",
  square = false,
  className,
  ...props
}: ButtonProps) {
  const classes = buttonClasses({ variant, square });
  return (
    <button
      className={className ? `${classes} ${className}` : classes}
      {...props}
    />
  );
}

/** Bright call-to-action outside the workspace: sign in, and the way back from a missing page. */
export const ctaClasses =
  "flex items-center justify-center gap-3 rounded-full bg-accent text-[#080808] text-[13px] font-[750] hover:bg-[#8cff60]";

/** Icon-button look without a display value, so callers can show or hide it per breakpoint. */
export const iconButtonClasses =
  "relative place-items-center size-8.5 rounded-[9px] hover:bg-hover hover:text-white";

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> & {
  /** Accessible name; icon buttons have no visible text. */
  label: string;
  /** Optional hover tooltip. */
  tip?: string;
};

/** Small borderless icon button, such as a drawer's close or a row's remove action. */
export function IconButton({
  label,
  tip,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`grid ${iconButtonClasses}${className ? ` ${className}` : ""}`}
      aria-label={label}
      data-tip={tip}
      {...props}
    />
  );
}
