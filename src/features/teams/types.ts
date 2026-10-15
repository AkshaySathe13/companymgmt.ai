// Mirrors docs/openapi.json in api.companymgmt.ai.
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

export type PersonSummary = {
  id: string;
  name: string;
  role: string;
  workMode: WorkMode;
};

export type TeamSummary = {
  id: string;
  name: string;
  icon: TeamIcon;
  kind: TeamKind;
};

export type Team = {
  id: string;
  name: string;
  purpose: string;
  kind: TeamKind;
  icon: TeamIcon;
  leadId: string | null;
  lead: PersonSummary | null;
  /** Core company team: only an executive can edit or delete it. */
  isCore: boolean;
  memberCount: number;
  members: PersonSummary[];
  createdAt: string;
  updatedAt: string;
};

export type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  timezone: string;
  workMode: WorkMode;
  kind: "STAFF" | "EXTERNAL";
  teams: TeamSummary[];
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

export type PersonInput = {
  name: string;
  email: string;
  role: string;
  location: string;
  timezone: string;
  workMode: WorkMode;
  teamIds: string[];
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
