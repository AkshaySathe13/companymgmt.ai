"use client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  aiApi,
  peopleApi,
  teamsApi,
  type PeopleFilter,
  type PersonUpdate,
} from "./api";
import type { Person, PersonInput, Team, TeamInput } from "./types";

/**
 * Query keys. Teams and people reference each other (members, team tags), so every change
 * invalidates both roots; detail keys sit under their root so they refresh too.
 */
export const queryKeys = {
  teams: ["teams"] as const,
  teamList: () => [...queryKeys.teams, "list"] as const,
  team: (id: string) => [...queryKeys.teams, "detail", id] as const,
  people: ["people"] as const,
  peopleList: (filter: PeopleFilter = {}) =>
    [...queryKeys.people, "list", filter] as const,
  person: (id: string) => [...queryKeys.people, "detail", id] as const,
  aiStatus: ["ai", "status"] as const,
};

// ---- Queries ----

export function useTeams(enabled = true) {
  return useQuery({
    queryKey: queryKeys.teamList(),
    queryFn: ({ signal }) => teamsApi.list(signal),
    enabled,
  });
}

export function usePeople(filter: PeopleFilter = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.peopleList(filter),
    queryFn: ({ signal }) => peopleApi.list(filter, signal),
    enabled,
  });
}

/** Seeds a detail query from a cached list, so drawers open instantly and then refresh. */
function fromList<T extends { id: string }>(
  client: QueryClient,
  listKey: readonly unknown[],
  id: string,
) {
  const list = client.getQueryData<T[]>(listKey);
  const state = client.getQueryState(listKey);
  return {
    initialData: () => list?.find((item) => item.id === id),
    initialDataUpdatedAt: () => state?.dataUpdatedAt,
  };
}

export function useTeam(id: string) {
  const client = useQueryClient();
  return useQuery({
    queryKey: queryKeys.team(id),
    queryFn: ({ signal }) => teamsApi.get(id, signal),
    ...fromList<Team>(client, queryKeys.teamList(), id),
  });
}

export function usePerson(id: string) {
  const client = useQueryClient();
  return useQuery({
    queryKey: queryKeys.person(id),
    queryFn: ({ signal }) => peopleApi.get(id, signal),
    ...fromList<Person>(client, queryKeys.peopleList(), id),
  });
}

export function useAiStatus() {
  return useQuery({
    queryKey: queryKeys.aiStatus,
    queryFn: ({ signal }) => aiApi.status(signal),
  });
}

// ---- Mutations ----

/**
 * Refreshes every team and people query after a change. A deleted record's own query is skipped,
 * so its closing drawer doesn't refetch it and flash "not found".
 */
function useRefresh() {
  const client = useQueryClient();
  return (deleted?: readonly unknown[]) => {
    const skip = deleted && JSON.stringify(deleted);
    const predicate = (query: { queryKey: readonly unknown[] }) =>
      JSON.stringify(query.queryKey) !== skip;
    return Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.teams, predicate }),
      client.invalidateQueries({ queryKey: queryKeys.people, predicate }),
    ]);
  };
}

/** Creates a team, or updates `teamId` when given. */
export function useSaveTeam(teamId?: string) {
  const client = useQueryClient();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: TeamInput) =>
      teamId ? teamsApi.update(teamId, input) : teamsApi.create(input),
    onSuccess: (team) => {
      client.setQueryData(queryKeys.team(team.id), team);
      return refresh();
    },
  });
}

export function useDeleteTeam() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => teamsApi.remove(id),
    onSuccess: (_result, id) => refresh(queryKeys.team(id)),
  });
}

type Membership = { teamId: string; personId: string };

export function useAddMember() {
  const client = useQueryClient();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ teamId, personId }: Membership) =>
      teamsApi.addMember(teamId, personId),
    onSuccess: (team) => {
      client.setQueryData(queryKeys.team(team.id), team);
      return refresh();
    },
  });
}

export function useRemoveMember() {
  const client = useQueryClient();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ teamId, personId }: Membership) =>
      teamsApi.removeMember(teamId, personId),
    onSuccess: (team) => {
      client.setQueryData(queryKeys.team(team.id), team);
      return refresh();
    },
  });
}

/** Creates a user (one team, temporary password) in their team's member role. */
export function useCreatePerson() {
  const client = useQueryClient();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: PersonInput) => peopleApi.create(input),
    onSuccess: (person) => {
      client.setQueryData(queryKeys.person(person.id), person);
      return refresh();
    },
  });
}

/** Edits a profile, or suspends/reactivates (Leadership Lead only). */
export function useUpdatePerson(personId: string) {
  const client = useQueryClient();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: PersonUpdate) => peopleApi.update(personId, input),
    onSuccess: (person) => {
      client.setQueryData(queryKeys.person(person.id), person);
      return refresh();
    },
  });
}

export function useResetPassword(personId: string) {
  return useMutation({
    mutationFn: (temporaryPassword: string) =>
      peopleApi.resetPassword(personId, temporaryPassword),
  });
}

export function useDeletePerson() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => peopleApi.remove(id),
    onSuccess: (_result, id) => refresh(queryKeys.person(id)),
  });
}

/** Asks the AI. Each call passes its own AbortSignal so a pending answer can be cancelled. */
export function useAskAi() {
  return useMutation({
    mutationFn: ({
      question,
      history,
      signal,
    }: {
      question: string;
      history: Parameters<typeof aiApi.ask>[1];
      signal: AbortSignal;
    }) => aiApi.ask(question, history, signal),
  });
}
