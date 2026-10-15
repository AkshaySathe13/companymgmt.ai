import { api } from "@/lib/api";
import type {
  AiAnswer,
  AiStatus,
  Person,
  PersonInput,
  Team,
  TeamInput,
} from "./types";

const DATA_CHANGED = "companymgmt:data-changed";

/** Lets every open view reload after a create, update or delete. */
export function onDataChanged(listener: () => void) {
  window.addEventListener(DATA_CHANGED, listener);
  return () => window.removeEventListener(DATA_CHANGED, listener);
}

async function mutate<T>(promise: Promise<T>) {
  const result = await promise;
  window.dispatchEvent(new Event(DATA_CHANGED));
  return result;
}

const json = (body: unknown) => JSON.stringify(body);
type Data<T> = { data: T };

export const teamsApi = {
  list: (signal?: AbortSignal) =>
    api<Data<Team[]>>("/teams", { signal }).then((r) => r.data),
  get: (id: string, signal?: AbortSignal) =>
    api<Data<Team>>(`/teams/${id}`, { signal }).then((r) => r.data),
  create: (input: TeamInput) =>
    mutate(
      api<Data<Team>>("/teams", { method: "POST", body: json(input) }),
    ).then((r) => r.data),
  update: (id: string, input: Partial<TeamInput>) =>
    mutate(
      api<Data<Team>>(`/teams/${id}`, { method: "PATCH", body: json(input) }),
    ).then((r) => r.data),
  remove: (id: string) =>
    mutate(api<void>(`/teams/${id}`, { method: "DELETE" })),
  addMember: (id: string, personId: string) =>
    mutate(
      api<Data<Team>>(`/teams/${id}/members`, {
        method: "POST",
        body: json({ personId }),
      }),
    ).then((r) => r.data),
  removeMember: (id: string, personId: string) =>
    mutate(
      api<Data<Team>>(`/teams/${id}/members/${personId}`, {
        method: "DELETE",
      }),
    ).then((r) => r.data),
};

export const peopleApi = {
  list: (
    params: { search?: string; teamId?: string; ids?: string[] } = {},
    signal?: AbortSignal,
  ) => {
    const query = new URLSearchParams({ limit: "200" });
    if (params.search) query.set("search", params.search);
    if (params.teamId) query.set("teamId", params.teamId);
    if (params.ids?.length) query.set("ids", params.ids.join(","));
    return api<Data<Person[]>>(`/people?${query}`, { signal }).then(
      (r) => r.data,
    );
  },
  get: (id: string, signal?: AbortSignal) =>
    api<Data<Person>>(`/people/${id}`, { signal }).then((r) => r.data),
  create: (input: PersonInput) =>
    mutate(
      api<Data<Person>>("/people", { method: "POST", body: json(input) }),
    ).then((r) => r.data),
  update: (id: string, input: Partial<Omit<PersonInput, "teamIds">>) =>
    mutate(
      api<Data<Person>>(`/people/${id}`, {
        method: "PATCH",
        body: json(input),
      }),
    ).then((r) => r.data),
  remove: (id: string) =>
    mutate(api<void>(`/people/${id}`, { method: "DELETE" })),
};

export const aiApi = {
  status: (signal?: AbortSignal) =>
    api<Data<AiStatus>>("/ai/status", { signal }).then((r) => r.data),
  // Claude may call several tools before answering, so allow more time than a normal request.
  ask: (
    question: string,
    history: { role: "user" | "assistant"; content: string }[],
    signal?: AbortSignal,
  ) =>
    api<Data<AiAnswer>>("/ai/ask", {
      method: "POST",
      body: json({ question, history }),
      signal,
      timeoutMs: 120_000,
    }).then((r) => r.data),
};
