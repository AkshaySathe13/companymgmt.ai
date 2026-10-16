import { api } from "@/lib/api";
import type {
  AiAnswer,
  AiStatus,
  Person,
  PersonFields,
  PersonInput,
  Team,
  TeamInput,
} from "./types";

// Plain request functions. Components use them through the TanStack Query hooks in ./queries,
// which handle caching, loading state and refreshing after changes.

const json = (body: unknown) => JSON.stringify(body);
type Data<T> = { data: T };
const unwrap = <T>(response: Data<T>) => response.data;

export type PeopleFilter = { search?: string; teamId?: string; ids?: string[] };
export type PersonUpdate = Partial<PersonFields> & {
  status?: "ACTIVE" | "SUSPENDED";
};
export type ChatTurn = { role: "user" | "assistant"; content: string };

export const teamsApi = {
  list: (signal?: AbortSignal) =>
    api<Data<Team[]>>("/teams", { signal }).then(unwrap),
  get: (id: string, signal?: AbortSignal) =>
    api<Data<Team>>(`/teams/${id}`, { signal }).then(unwrap),
  create: (input: TeamInput) =>
    api<Data<Team>>("/teams", { method: "POST", body: json(input) }).then(
      unwrap,
    ),
  update: (id: string, input: Partial<TeamInput>) =>
    api<Data<Team>>(`/teams/${id}`, {
      method: "PATCH",
      body: json(input),
    }).then(unwrap),
  remove: (id: string) => api<void>(`/teams/${id}`, { method: "DELETE" }),
  addMember: (id: string, personId: string) =>
    api<Data<Team>>(`/teams/${id}/members`, {
      method: "POST",
      body: json({ personId }),
    }).then(unwrap),
  removeMember: (id: string, personId: string) =>
    api<Data<Team>>(`/teams/${id}/members/${personId}`, {
      method: "DELETE",
    }).then(unwrap),
};

export const peopleApi = {
  list: (params: PeopleFilter = {}, signal?: AbortSignal) => {
    const query = new URLSearchParams({ limit: "200" });
    if (params.search) query.set("search", params.search);
    if (params.teamId) query.set("teamId", params.teamId);
    if (params.ids?.length) query.set("ids", params.ids.join(","));
    return api<Data<Person[]>>(`/people?${query}`, { signal }).then(unwrap);
  },
  get: (id: string, signal?: AbortSignal) =>
    api<Data<Person>>(`/people/${id}`, { signal }).then(unwrap),
  create: (input: PersonInput) =>
    api<Data<Person>>("/people", { method: "POST", body: json(input) }).then(
      unwrap,
    ),
  update: (id: string, input: PersonUpdate) =>
    api<Data<Person>>(`/people/${id}`, {
      method: "PATCH",
      body: json(input),
    }).then(unwrap),
  /** Sets a temporary password; the person must replace it at next sign-in. */
  resetPassword: (id: string, temporaryPassword: string) =>
    api<void>(`/people/${id}/password`, {
      method: "POST",
      body: json({ temporaryPassword }),
    }),
  remove: (id: string) => api<void>(`/people/${id}`, { method: "DELETE" }),
};

export const aiApi = {
  status: (signal?: AbortSignal) =>
    api<Data<AiStatus>>("/ai/status", { signal }).then(unwrap),
  // Claude may call several tools before answering, so allow more time than a normal request.
  ask: (question: string, history: ChatTurn[], signal?: AbortSignal) =>
    api<Data<AiAnswer>>("/ai/ask", {
      method: "POST",
      body: json({ question, history }),
      signal,
      timeoutMs: 120_000,
    }).then(unwrap),
};
