import type { Page, Route } from "@playwright/test";

// A small in-memory stand-in for api.companymgmt.ai, so browser tests don't depend on the sibling repo.
type P = {
  id: string;
  name: string;
  role: string;
  workMode: string;
  teamIds: string[];
};
type T = {
  id: string;
  name: string;
  purpose: string;
  kind: string;
  icon: string;
  leadId: string;
  isCore: boolean;
};

const pid = (n: number) =>
  `aaaaaaaa-0000-4000-8000-${String(n).padStart(12, "0")}`;
const tid = (n: number) =>
  `bbbbbbbb-0000-4000-8000-${String(n).padStart(12, "0")}`;

export function createMockApi({ aiConfigured = false } = {}) {
  const people: P[] = [
    {
      id: pid(1),
      name: "Evan Ross",
      role: "Chief executive officer",
      workMode: "REMOTE",
      teamIds: [tid(1)],
    },
    {
      id: pid(4),
      name: "Mira Sen",
      role: "Engineering manager",
      workMode: "OFFICE",
      teamIds: [tid(2)],
    },
    {
      id: pid(5),
      name: "Nina Patel",
      role: "Frontend developer",
      workMode: "OFFICE",
      teamIds: [tid(2)],
    },
    {
      id: pid(9),
      name: "Noah Reed",
      role: "Lead AI engineer",
      workMode: "OFFICE",
      teamIds: [tid(3)],
    },
  ];
  const teams: T[] = [
    {
      id: tid(1),
      name: "C-suite",
      purpose: "Company leadership.",
      kind: "LEADERSHIP",
      icon: "briefcase",
      leadId: pid(1),
      isCore: true,
    },
    {
      id: tid(2),
      name: "India developers",
      purpose: "Product engineering.",
      kind: "TECHNICAL",
      icon: "code",
      leadId: pid(4),
      isCore: true,
    },
    {
      id: tid(3),
      name: "US AI engineers",
      purpose: "AI dispatch agent.",
      kind: "TECHNICAL",
      icon: "sparkles",
      leadId: pid(9),
      isCore: true,
    },
  ];
  let next = 100;
  const summary = (p: P) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    workMode: p.workMode,
  });
  const team = (t: T) => {
    const members = people.filter((p) => p.teamIds.includes(t.id)).map(summary);
    const lead = people.find((p) => p.id === t.leadId);
    return {
      ...t,
      lead: lead ? summary(lead) : null,
      members,
      memberCount: members.length,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
    };
  };
  const person = (p: P) => ({
    ...summary(p),
    email: `${p.name.toLowerCase().replace(/ /g, ".")}@carrieros.example`,
    location: "Pune, India",
    timezone: "Asia/Kolkata",
    kind: p.workMode === "EXTERNAL" ? "EXTERNAL" : "STAFF",
    teams: teams
      .filter((t) => p.teamIds.includes(t.id))
      .map(({ id, name, icon, kind }) => ({ id, name, icon, kind })),
    leadsTeamIds: teams.filter((t) => t.leadId === p.id).map((t) => t.id),
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  });
  const fail = (route: Route, status: number, code: string, message: string) =>
    route.fulfill({ status, json: { error: { code, message } } });

  return async function install(page: Page) {
    await page.route("**/api/v1/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace("/api/v1", "");
      const method = request.method();
      const body = request.postDataJSON?.() ?? null;
      const parts = path.split("/").filter(Boolean);
      // Mirrors the API's demo permissions from the X-Preview-Role header.
      const role = request.headers()["x-preview-role"] ?? "developer";

      if (path === "/ai/status")
        return route.fulfill({
          json: {
            data: { configured: aiConfigured, model: "claude-opus-5-5" },
          },
        });
      if (path === "/ai/ask") {
        if (!aiConfigured)
          return fail(
            route,
            503,
            "AI_NOT_CONFIGURED",
            "AI answers are off. Add ANTHROPIC_API_KEY to the API's .env file and restart the API.",
          );
        return route.fulfill({
          json: {
            data: {
              answer: "Mira Sen leads India developers.",
              views: [
                { kind: "team", title: "India developers", teamId: tid(2) },
              ],
              model: "claude-opus-5-5",
              stopReason: "end_turn",
            },
          },
        });
      }
      if (parts[0] === "teams") {
        const t = parts[1] ? teams.find((x) => x.id === parts[1]) : undefined;
        if (method === "GET" && !parts[1])
          return route.fulfill({ json: { data: teams.map(team) } });
        if (method !== "GET" && role === "developer")
          return fail(
            route,
            403,
            "FORBIDDEN",
            "Your role can view teams but can't change them.",
          );
        if (method === "POST" && !parts[1]) {
          if (
            teams.some((x) => x.name.toLowerCase() === body.name.toLowerCase())
          )
            return fail(
              route,
              409,
              "TEAM_NAME_TAKEN",
              "A team with this name exists",
            );
          const created: T = {
            id: tid(next++),
            name: body.name,
            purpose: body.purpose,
            kind: body.kind,
            icon: body.icon,
            leadId: body.leadId,
            isCore: false,
          };
          teams.push(created);
          people.find((p) => p.id === body.leadId)!.teamIds.push(created.id);
          return route.fulfill({ status: 201, json: { data: team(created) } });
        }
        if (!t) return fail(route, 404, "NOT_FOUND", "Team not found");
        if (method === "GET" && parts.length === 2)
          return route.fulfill({ json: { data: team(t) } });
        if (
          (method === "PATCH" || method === "DELETE") &&
          parts.length === 2 &&
          t.isCore &&
          role !== "executive"
        )
          return fail(
            route,
            403,
            "CORE_TEAM_LOCKED",
            `${t.name} is a core company team. Only an executive can edit or delete it.`,
          );
        if (method === "PATCH" && parts.length === 2) {
          Object.assign(t, body);
          const lead = people.find((p) => p.id === t.leadId)!;
          if (!lead.teamIds.includes(t.id)) lead.teamIds.push(t.id);
          return route.fulfill({ json: { data: team(t) } });
        }
        if (method === "DELETE" && parts.length === 2) {
          teams.splice(teams.indexOf(t), 1);
          people.forEach(
            (p) => (p.teamIds = p.teamIds.filter((x) => x !== t.id)),
          );
          return route.fulfill({ status: 204, body: "" });
        }
        if (parts[2] === "members" && method === "POST") {
          const p = people.find((x) => x.id === body.personId)!;
          if (!p.teamIds.includes(t.id)) p.teamIds.push(t.id);
          return route.fulfill({ status: 201, json: { data: team(t) } });
        }
        if (parts[2] === "members" && method === "DELETE") {
          const p = people.find((x) => x.id === parts[3])!;
          if (t.leadId === p.id)
            return fail(
              route,
              409,
              "LEAD_CANNOT_LEAVE",
              "The team lead can't be removed. Choose a new lead first.",
            );
          if (p.teamIds.length <= 1)
            return fail(
              route,
              409,
              "LAST_TEAM",
              "Everyone needs at least one team. Add this person to another team first.",
            );
          p.teamIds = p.teamIds.filter((x) => x !== t.id);
          return route.fulfill({ json: { data: team(t) } });
        }
      }
      if (parts[0] === "people") {
        if (method === "GET" && !parts[1]) {
          const ids = url.searchParams.get("ids")?.split(",");
          return route.fulfill({
            json: {
              data: people
                .filter((p) => !ids || ids.includes(p.id))
                .map(person),
            },
          });
        }
        const p = people.find((x) => x.id === parts[1]);
        if (!p) return fail(route, 404, "NOT_FOUND", "Person not found");
        if (method === "GET")
          return route.fulfill({ json: { data: person(p) } });
      }
      return fail(route, 404, "NOT_FOUND", "Route not found");
    });
  };
}
