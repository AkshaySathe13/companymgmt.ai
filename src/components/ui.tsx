import {
  BriefcaseBusiness,
  CircleAlert,
  Code,
  Megaphone,
  RotateCw,
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

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "xs" | "md" | "lg";
}) {
  return (
    <span className={`cc-av cc-av-${size}`} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function TeamAvatar({
  icon,
  size = "md",
}: {
  icon: TeamIcon;
  size?: "md" | "lg";
}) {
  const Icon = teamIcons[icon] ?? UsersRound;
  return (
    <span className={`cc-av cc-av-sq cc-av-${size}`} aria-hidden="true">
      <Icon size={size === "lg" ? 20 : 14} strokeWidth={1.8} />
    </span>
  );
}

export function AvatarStack({ names }: { names: string[] }) {
  return (
    <span className="cc-stack" aria-hidden="true">
      {names.slice(0, 5).map((name, index) => (
        <Avatar key={`${name}-${index}`} name={name} size="xs" />
      ))}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="cc-tag">{children}</span>;
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="cc-state" role="alert">
      <CircleAlert size={20} strokeWidth={1.7} />
      <b>Something went wrong</b>
      <span>{message}</span>
      {onRetry && (
        <button className="cc-btn" onClick={onRetry}>
          <RotateCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="cc-empty">{children}</div>;
}

export function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="cc-skeleton" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} style={{ width: `${90 - index * 12}%` }} />
      ))}
    </div>
  );
}
