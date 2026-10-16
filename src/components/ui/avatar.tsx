import {
  BriefcaseBusiness,
  Code,
  Megaphone,
  Server,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { TeamIcon } from "@/features/teams/types";

export const teamIcons: Record<TeamIcon, LucideIcon> = {
  users: UsersRound,
  briefcase: BriefcaseBusiness,
  code: Code,
  sparkles: Sparkles,
  megaphone: Megaphone,
  trending: TrendingUp,
  server: Server,
  shield: ShieldCheck,
};

const sizes = {
  xs: "size-[22px] text-[9.5px]",
  md: "size-[26px] text-[11px]",
  lg: "size-11 text-[17px]",
};
const base =
  "inline-grid place-items-center shrink-0 text-[#f0f0f0] font-semibold";

/** A person's initial in a circle. */
export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "xs" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={`${base} ${sizes[size]} rounded-full bg-[#262626]${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** A team's icon in a rounded square. */
export function TeamAvatar({
  icon,
  size = "md",
}: {
  icon: TeamIcon;
  size?: "md" | "lg";
}) {
  const Icon = teamIcons[icon] ?? UsersRound;
  return (
    <span
      className={`${base} ${sizes[size]} ${size === "lg" ? "rounded-xl" : "rounded-lg"} bg-[#1b1b1b] shadow-[inset_0_0_0_1px_#2a2a2a]`}
      aria-hidden="true"
    >
      <Icon size={size === "lg" ? 20 : 14} strokeWidth={1.8} />
    </span>
  );
}

/** Up to five overlapping member avatars. */
export function AvatarStack({ names }: { names: string[] }) {
  return (
    <span
      className="inline-flex align-middle mr-1.5 [&>*]:-ml-1 [&>*]:shadow-[0_0_0_2px_#000] [&>*:first-child]:ml-0"
      aria-hidden="true"
    >
      {names.slice(0, 5).map((name, index) => (
        <Avatar key={`${name}-${index}`} name={name} size="xs" />
      ))}
    </span>
  );
}
