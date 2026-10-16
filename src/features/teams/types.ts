import type { TeamRole } from "@/features/auth/session";

// Mirrors docs/openapi.json in api.command.carrieros.ai.
export type WorkMode = "OFFICE" | "REMOTE" | "EXTERNAL";
export type TeamKind = "LEADERSHIP" | "TECHNICAL" | "BUSINESS" | "EXTERNAL";
export type TeamIcon =
  | "users"
  | "briefcase"
  | "code"
  | "sparkles"
  | "megaphone"
  | "trending"
  | "server"
  | "shield";

/** A team's lead. */
export type LeadSummary = { id: string; name: string; jobTitle: string };

/** A team member with their role in that team; work mode is null when hidden from the viewer. */
export type TeamMember = {
  id: string;
  name: string;
  jobTitle: string;
  role: TeamRole;
  roleLabel: string;
  workMode: WorkMode | null;
};

/** One of a person's teams, with their role in it. */
export type PersonTeam = {
  id: string;
  name: string;
  icon: TeamIcon;
  kind: TeamKind;
  role: TeamRole;
  roleLabel: string;
};

export type Team = {
  id: string;
  name: string;
  purpose: string;
  kind: TeamKind;
  icon: TeamIcon;
  leadId: string | null;
  lead: LeadSummary | null;
  /** One of the company's five core teams. */
  isCore: boolean;
  memberCount: number;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
};

/**
 * A person as the signed-in user may see them. Outside the viewer's teams (unless they are an
 * executive) `restricted` is true and contact details, location and status are null.
 */
export type Person = {
  id: string;
  name: string;
  jobTitle: string;
  kind: "STAFF" | "EXTERNAL";
  restricted: boolean;
  email: string | null;
  location: string | null;
  timezone: string | null;
  workMode: WorkMode | null;
  status: "ACTIVE" | "SUSPENDED" | null;
  teams: PersonTeam[];
  leadsTeamIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type TeamInput = {
  name: string;
  purpose: string;
  kind: TeamKind;
  icon: TeamIcon;
  leadId: string;
};

/** Profile fields an admin or team manager can edit. */
export type PersonFields = {
  name: string;
  email: string;
  jobTitle: string;
  location: string;
  timezone: string;
  workMode: WorkMode;
};

/** A new user: profile, one team (they get its member role) and a temporary password. */
export type PersonInput = PersonFields & {
  teamId: string;
  temporaryPassword: string;
};

export type AiView = {
  kind: "teams_overview" | "team" | "people";
  title: string;
  teamId?: string;
  personIds?: string[];
};

export type AiAnswer = {
  answer: string;
  views: AiView[];
  model: string;
  stopReason: string | null;
};

export type AiStatus = { configured: boolean; model: string };

export const workModeLabel: Record<WorkMode, string> = {
  OFFICE: "Office",
  REMOTE: "Remote",
  EXTERNAL: "External",
};

export const teamKindLabel: Record<TeamKind, string> = {
  LEADERSHIP: "Leadership",
  TECHNICAL: "Technical",
  BUSINESS: "Business",
  EXTERNAL: "External",
};

/** Suggested job titles for each team role, from the company's role table. */
export const jobTitleSuggestions: Record<TeamRole, string[]> = {
  LEADERSHIP_LEAD: ["CEO"],
  EXECUTIVE_MEMBER: ["CFO", "CTO"],
  TEAM_MANAGER: ["Engineering Manager", "AI Engineering Manager"],
  TEAM_MEMBER: ["Software Engineer", "AI Engineer"],
  SALES_MANAGER: ["Head of Sales"],
  SALES_MEMBER: ["Sales Executive"],
  INVESTOR_RELATIONS_MANAGER: ["Investor Relations Manager"],
  INVESTOR: ["Investor"],
};

/** The member role each kind of team gives new people (the lead holds the manager role). */
export const memberRoleFor: Record<
  TeamKind,
  { role: TeamRole; label: string }
> = {
  LEADERSHIP: { role: "EXECUTIVE_MEMBER", label: "Executive Member" },
  TECHNICAL: { role: "TEAM_MEMBER", label: "Team Member" },
  BUSINESS: { role: "SALES_MEMBER", label: "Sales Member" },
  EXTERNAL: { role: "INVESTOR", label: "Investor" },
};
