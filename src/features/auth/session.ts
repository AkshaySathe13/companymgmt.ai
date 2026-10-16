"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

export type TeamRole =
  | "LEADERSHIP_LEAD"
  | "EXECUTIVE_MEMBER"
  | "TEAM_MANAGER"
  | "TEAM_MEMBER"
  | "SALES_MANAGER"
  | "SALES_MEMBER"
  | "INVESTOR_RELATIONS_MANAGER"
  | "INVESTOR";

/** The signed-in user, their team roles and what the API lets them do. */
export type Me = {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  mustChangePassword: boolean;
  memberships: {
    teamId: string;
    teamName: string;
    teamKind: string;
    role: TeamRole;
    roleLabel: string;
  }[];
  /** Navigation slugs this user may open. */
  sections: string[];
  permissions: { administer: boolean; managedTeamIds: string[] };
};

type Data<T> = { data: T };
const json = (body: unknown) => JSON.stringify(body);

export const meKey = ["auth", "me"] as const;

/**
 * The signed-in user, or null when nobody is signed in. Other errors (API down) are thrown so
 * the shell can show them instead of sending the user to the login page.
 */
export function useMe() {
  return useQuery({
    queryKey: meKey,
    queryFn: async ({ signal }) => {
      try {
        return (await api<Data<Me>>("/auth/me", { signal })).data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
  });
}

/** Signs in; a new user then lands on the change-password screen. */
export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api<Data<Me>>("/auth/login", { method: "POST", body: json(input) }),
    onSuccess: ({ data }) => {
      // Nothing cached for a previous user may leak into this session.
      client.clear();
      client.setQueryData(meKey, data);
    },
  });
}

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>("/auth/logout", { method: "POST" }),
    onSettled: () => {
      client.clear();
      client.setQueryData(meKey, null);
    },
  });
}

export function useChangePassword() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      api<Data<Me>>("/auth/password", { method: "POST", body: json(input) }),
    onSuccess: ({ data }) => client.setQueryData(meKey, data),
  });
}

/** What the UI should offer this user. The API enforces the same rules on every request. */
export function accessFor(me: Me) {
  const managed = new Set(me.permissions.managedTeamIds);
  const myTeams = new Set(me.memberships.map((m) => m.teamId));
  return {
    me,
    /** Leadership Lead: manages every team, user and role. */
    administer: me.permissions.administer,
    canOpen: (section: string) => me.sections.includes(section),
    managesTeam: (teamId: string) =>
      me.permissions.administer || managed.has(teamId),
    /** Teams this user can add people to. */
    managesAnyTeam: me.permissions.administer || managed.size > 0,
    inTeam: (teamId: string) => myTeams.has(teamId),
    /** The role shown next to the user's name: their first team role. */
    primaryRole: me.memberships[0]?.roleLabel ?? "No team yet",
  };
}

export type Access = ReturnType<typeof accessFor>;

/** The signed-in user and their access; only used inside the workspace, where a user exists. */
export function useAccess() {
  const { data: me } = useMe();
  if (!me)
    throw new Error("useAccess must be used inside the signed-in workspace");
  return accessFor(me);
}
