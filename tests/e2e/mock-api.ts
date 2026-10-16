import type { Page, Route } from "@playwright/test";

// An in-memory stand-in for api.command.carrieros.ai, so browser tests don't depend on the sibling
// repo. It mirrors the API's sign-in and role rules closely enough to test what each role sees.

export const DEMO_PASSWORD = "Pass@123";

type Kind = "LEADERSHIP" | "TECHNICAL" | "BUSINESS" | "EXTERNAL";
type Role =
  | "LEADERSHIP_LEAD"
  | "EXECUTIVE_MEMBER"
  | "TEAM_MANAGER"
  | "TEAM_MEMBER"
  | "SALES_MANAGER"
  | "SALES_MEMBER"
  | "INVESTOR_RELATIONS_MANAGER"
  | "INVESTOR";
type P = {
  id: string;
  name: string;
  jobTitle: string;
  workMode: string;
  location: string;
  timezone: string;
  status: "ACTIVE" | "SUSPENDED";
  password: string;
  mustChangePassword: boolean;
  memberships: { teamId: string; role: Role }[];
};
type T = {
  id: string;
  name: string;
  purpose: string;
  kind: Kind;
  icon: string;
  leadId: string;
  isCore: boolean;
};

const pid = (n: number) =>
  `aaaaaaaa-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const tid = (n: number) =>
  `bbbbbbbb-0000-4000-8000-${String(n).padStart(12, "0")}`;
// Demo sign-in emails, as in the API seed.
const demoEmails: Record<string, string> = {
  "Aarav Shah": "ceo@gmail.com",
  "Meera Iyer": "cfo@gmail.com",
  "Daniel Brooks": "cto@gmail.com",
  "Rahul Verma": "indiamanager@gmail.com",
  "Sneha Kulkarni": "indiadeveloper@gmail.com",
  "Olivia Chen": "usaimanager@gmail.com",
  "Marcus Lee": "usaiengineer@gmail.com",
  "Priya Nair": "salesmanager@gmail.com",
  "Ethan Walker": "salesexecutive@gmail.com",
  "Sofia Martins": "irmanager@gmail.com",
  "Robert Hayes": "investor@gmail.com",
};
export const emailOf = (name: string) =>
  demoEmails[name] ??
  `${name.toLowerCase().replace(/ /g, ".")}@carrieros.example`;

const roles: Record<Kind, { manager: Role; member: Role }> = {
  LEADERSHIP: { manager: "LEADERSHIP_LEAD", member: "EXECUTIVE_MEMBER" },
  TECHNICAL: { manager: "TEAM_MANAGER", member: "TEAM_MEMBER" },
  BUSINESS: { manager: "SALES_MANAGER", member: "SALES_MEMBER" },
  EXTERNAL: { manager: "INVESTOR_RELATIONS_MANAGER", member: "INVESTOR" },
};
const labels: Record<Role, string> = {
  LEADERSHIP_LEAD: "Leadership Lead",
  EXECUTIVE_MEMBER: "Executive Member",
  TEAM_MANAGER: "Team Manager",
  TEAM_MEMBER: "Team Member",
  SALES_MANAGER: "Sales Manager",
  SALES_MEMBER: "Sales Member",
  INVESTOR_RELATIONS_MANAGER: "Investor Relations Manager",
  INVESTOR: "Investor",
};
const all = [
  "overview",
  "approvals",
  "activity",
  "teams",
  "projects",
  "tasks",
  "engineering",
  "qa",
  "infrastructure",
  "ai-tools",
  "communication",
  "sales",
  "finance",
  "documents",
];
const staff = [
  "overview",
  "communication",
  "approvals",
  "activity",
  "teams",
  "tasks",
  "ai-tools",
  "documents",
];
const sections: Record<Role, string[]> = {
  LEADERSHIP_LEAD: [...all, "administration"],
  EXECUTIVE_MEMBER: all,
  TEAM_MANAGER: [
    ...staff,
    "projects",
    "engineering",
    "qa",
    "infrastructure",
    "finance",
  ],
  TEAM_MEMBER: [...staff, "projects", "engineering", "qa", "infrastructure"],
  SALES_MANAGER: [...staff, "projects", "infrastructure", "sales"],
  SALES_MEMBER: [...staff, "infrastructure", "sales"],
  INVESTOR_RELATIONS_MANAGER: [...staff, "finance"],
  INVESTOR: ["overview", "communication", "finance", "documents"],
};
const isManager = (role: Role) =>
  role === "LEADERSHIP_LEAD" || role.endsWith("_MANAGER");

export function createMockApi({ aiConfigured = false } = {}) {
  const person = (
    n: number,
    name: string,
    jobTitle: string,
    memberships: P["memberships"],
    workMode = "OFFICE",
  ): P => ({
    id: pid(n),
    name,
    jobTitle,
    workMode,
    location: "Pune, India",
    timezone: "Asia/Kolkata",
    status: "ACTIVE",
    password: DEMO_PASSWORD,
    mustChangePassword: false,
    memberships,
  });
  const people: P[] = [
    person(1, "Aarav Shah", "CEO", [
      { teamId: tid(1), role: "LEADERSHIP_LEAD" },
    ]),
    person(2, "Meera Iyer", "CFO", [
      { teamId: tid(1), role: "EXECUTIVE_MEMBER" },
    ]),
    person(4, "Rahul Verma", "Engineering Manager", [
      { teamId: tid(2), role: "TEAM_MANAGER" },
    ]),
    person(5, "Sneha Kulkarni", "Software Engineer", [
      { teamId: tid(2), role: "TEAM_MEMBER" },
    ]),
    person(6, "Olivia Chen", "AI Engineering Manager", [
      { teamId: tid(3), role: "TEAM_MANAGER" },
    ]),
    person(
      7,
      "Marcus Lee",
      "AI Engineer",
      [{ teamId: tid(3), role: "TEAM_MEMBER" }],
      "REMOTE",
    ),
    person(10, "Sofia Martins", "Investor Relations Manager", [
      { teamId: tid(5), role: "INVESTOR_RELATIONS_MANAGER" },
    ]),
    person(
      11,
      "Robert Hayes",
      "Investor",
      [{ teamId: tid(5), role: "INVESTOR" }],
      "EXTERNAL",
    ),
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
      leadId: pid(6),
      isCore: true,
    },
    {
      id: tid(5),
      name: "Investors",
      purpose: "Approved information only.",
      kind: "EXTERNAL",
      icon: "trending",
      leadId: pid(10),
      isCore: true,
    },
  ];
  let next = 100;
  let me: P | null = null;

  const teamIdsOf = (p: P) => p.memberships.map((m) => m.teamId);
  const isExecutive = (v: P) =>
    v.memberships.some(
      (m) => m.role === "LEADERSHIP_LEAD" || m.role === "EXECUTIVE_MEMBER",
    );
  const isAdmin = (v: P) =>
    v.memberships.some((m) => m.role === "LEADERSHIP_LEAD");
  const investorOnly = (v: P) =>
    v.memberships.every((m) => m.role === "INVESTOR");
  const manages = (v: P, teamId: string) =>
    isAdmin(v) ||
    v.memberships.some((m) => m.teamId === teamId && isManager(m.role));
  const full = (v: P, p: P) =>
    p.id === v.id ||
    isExecutive(v) ||
    teamIdsOf(p).some((id) => teamIdsOf(v).includes(id));
  const visibleTeams = (v: P) =>
    investorOnly(v) ? teams.filter((t) => teamIdsOf(v).includes(t.id)) : teams;
  const visiblePeople = (v: P) =>
    investorOnly(v)
      ? people.filter((p) =>
          teamIdsOf(p).some((id) => teamIdsOf(v).includes(id)),
        )
      : people;

  const describe = (p: P) => ({
    id: p.id,
    name: p.name,
    email: emailOf(p.name),
    jobTitle: p.jobTitle,
    mustChangePassword: p.mustChangePassword,
    memberships: p.memberships.map((m) => {
      const t = teams.find((x) => x.id === m.teamId)!;
      return {
        teamId: t.id,
        teamName: t.name,
        teamKind: t.kind,
        role: m.role,
        roleLabel: labels[m.role],
      };
    }),
    sections: [...new Set(p.memberships.flatMap((m) => sections[m.role]))],
    permissions: {
      administer: isAdmin(p),
      managedTeamIds: p.memberships
        .filter((m) => isManager(m.role))
        .map((m) => m.teamId),
    },
  });
  const team = (t: T, v: P) => {
    const members = people
      .filter((p) => teamIdsOf(p).includes(t.id))
      .map((p) => {
        const role = p.memberships.find((m) => m.teamId === t.id)!.role;
        return {
          id: p.id,
          name: p.name,
          jobTitle: p.jobTitle,
          role,
          roleLabel: labels[role],
          workMode: full(v, p) ? p.workMode : null,
        };
      });
    const lead = people.find((p) => p.id === t.leadId);
    return {
      ...t,
      lead: lead
        ? { id: lead.id, name: lead.name, jobTitle: lead.jobTitle }
        : null,
      members,
      memberCount: members.length,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
    };
  };
  const view = (p: P, v: P) => {
    const shown = full(v, p);
    return {
      id: p.id,
      name: p.name,
      jobTitle: p.jobTitle,
      kind: p.workMode === "EXTERNAL" ? "EXTERNAL" : "STAFF",
      restricted: !shown,
      email: shown ? emailOf(p.name) : null,
      location: shown ? p.location : null,
      timezone: shown ? p.timezone : null,
      workMode: shown ? p.workMode : null,
      status: shown ? p.status : null,
      teams: p.memberships
        .filter((m) => visibleTeams(v).some((t) => t.id === m.teamId))
        .map((m) => {
          const t = teams.find((x) => x.id === m.teamId)!;
          return {
            id: t.id,
            name: t.name,
            icon: t.icon,
            kind: t.kind,
            role: m.role,
            roleLabel: labels[m.role],
          };
        }),
      leadsTeamIds: teams.filter((t) => t.leadId === p.id).map((t) => t.id),
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
    };
  };
  const fail = (route: Route, status: number, code: string, message: string) =>
    route.fulfill({ status, json: { error: { code, message } } });
  const forbidden = (route: Route, message: string) =>
    fail(route, 403, "FORBIDDEN", message);
  const syncRoles = (t: T) => {
    for (const p of people)
      for (const m of p.memberships)
        if (m.teamId === t.id)
          m.role =
            p.id === t.leadId ? roles[t.kind].manager : roles[t.kind].member;
  };

  return async function install(page: Page) {
    await page.route("**/api/v1/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace("/api/v1", "");
      const method = request.method();
      const body = request.postDataJSON?.() ?? null;
      const parts = path.split("/").filter(Boolean);

      if (path === "/auth/login") {
        const user = people.find(
          (p) => emailOf(p.name) === String(body.email).trim().toLowerCase(),
        );
        if (!user || user.password !== body.password)
          return fail(
            route,
            401,
            "INVALID_CREDENTIALS",
            "Email or password is incorrect.",
          );
        if (user.status !== "ACTIVE")
          return fail(
            route,
            403,
            "ACCOUNT_SUSPENDED",
            "This account is suspended. Contact your Leadership Lead.",
          );
        me = user;
        return route.fulfill({ json: { data: describe(user) } });
      }
      if (path === "/auth/logout") {
        me = null;
        return route.fulfill({ status: 204, body: "" });
      }
      if (!me)
        return fail(
          route,
          401,
          "UNAUTHENTICATED",
          "Please sign in to continue.",
        );
      const viewer: P = me;
      if (path === "/auth/me")
        return route.fulfill({ json: { data: describe(viewer) } });
      if (path === "/auth/password") {
        if (body.currentPassword !== viewer.password)
          return fail(
            route,
            400,
            "WRONG_PASSWORD",
            "Your current password is incorrect.",
          );
        viewer.password = body.newPassword;
        viewer.mustChangePassword = false;
        return route.fulfill({ json: { data: describe(viewer) } });
      }
      if (viewer.mustChangePassword)
        return fail(
          route,
          403,
          "PASSWORD_CHANGE_REQUIRED",
          "Set a new password before continuing.",
        );

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
              answer: "Rahul Verma leads India developers.",
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
        const t = parts[1]
          ? visibleTeams(viewer).find((x) => x.id === parts[1])
          : undefined;
        if (method === "GET" && !parts[1])
          return route.fulfill({
            json: { data: visibleTeams(viewer).map((x) => team(x, viewer)) },
          });
        if (method === "POST" && !parts[1]) {
          if (!isAdmin(viewer))
            return forbidden(
              route,
              "Only the Leadership Lead can create teams.",
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
          people
            .find((p) => p.id === body.leadId)!
            .memberships.push({
              teamId: created.id,
              role: roles[created.kind].manager,
            });
          return route.fulfill({
            status: 201,
            json: { data: team(created, viewer) },
          });
        }
        if (!t) return fail(route, 404, "NOT_FOUND", "Team not found");
        if (method === "GET" && parts.length === 2)
          return route.fulfill({ json: { data: team(t, viewer) } });
        if (
          (method === "PATCH" || method === "DELETE") &&
          parts.length === 2 &&
          !isAdmin(viewer)
        )
          return forbidden(route, "Only the Leadership Lead can edit teams.");
        if (method === "PATCH" && parts.length === 2) {
          Object.assign(t, body);
          const lead = people.find((p) => p.id === t.leadId)!;
          if (!teamIdsOf(lead).includes(t.id))
            lead.memberships.push({ teamId: t.id, role: roles[t.kind].member });
          syncRoles(t);
          return route.fulfill({ json: { data: team(t, viewer) } });
        }
        if (method === "DELETE" && parts.length === 2) {
          const stranded = people.filter(
            (p) =>
              p.memberships.length === 1 && p.memberships[0]!.teamId === t.id,
          ).length;
          if (stranded)
            return fail(
              route,
              409,
              "TEAM_HAS_ONLY_MEMBERS",
              `${stranded} ${stranded === 1 ? "person has" : "people have"} no other team. Add them to another team before deleting ${t.name}.`,
            );
          teams.splice(teams.indexOf(t), 1);
          return route.fulfill({ status: 204, body: "" });
        }
        if (parts[2] === "members" && !manages(viewer, t.id))
          return forbidden(
            route,
            "Only this team's manager or the Leadership Lead can do this.",
          );
        if (parts[2] === "members" && method === "POST") {
          const p = people.find((x) => x.id === body.personId)!;
          if (!teamIdsOf(p).includes(t.id))
            p.memberships.push({ teamId: t.id, role: roles[t.kind].member });
          return route.fulfill({
            status: 201,
            json: { data: team(t, viewer) },
          });
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
          if (p.memberships.length <= 1)
            return fail(
              route,
              409,
              "LAST_TEAM",
              "Everyone needs at least one team. Add this person to another team first.",
            );
          p.memberships = p.memberships.filter((m) => m.teamId !== t.id);
          return route.fulfill({ json: { data: team(t, viewer) } });
        }
      }

      if (parts[0] === "people") {
        if (method === "GET" && !parts[1]) {
          const ids = url.searchParams.get("ids")?.split(",");
          return route.fulfill({
            json: {
              data: visiblePeople(viewer)
                .filter((p) => !ids || ids.includes(p.id))
                .map((p) => view(p, viewer)),
            },
          });
        }
        if (method === "POST" && !parts[1]) {
          if (!manages(viewer, body.teamId))
            return forbidden(
              route,
              "Only this team's manager or the Leadership Lead can do this.",
            );
          if (people.some((x) => emailOf(x.name) === body.email.toLowerCase()))
            return fail(
              route,
              409,
              "EMAIL_TAKEN",
              "Someone already uses this email.",
            );
          const kind = teams.find((t) => t.id === body.teamId)!.kind;
          const created: P = {
            id: pid(next++),
            name: body.name,
            jobTitle: body.jobTitle,
            workMode: body.workMode,
            location: body.location,
            timezone: body.timezone,
            status: "ACTIVE",
            password: body.temporaryPassword,
            mustChangePassword: true,
            memberships: [{ teamId: body.teamId, role: roles[kind].member }],
          };
          people.push(created);
          return route.fulfill({
            status: 201,
            json: { data: view(created, viewer) },
          });
        }
        const p = visiblePeople(viewer).find((x) => x.id === parts[1]);
        if (!p) return fail(route, 404, "NOT_FOUND", "Person not found");
        if (method === "GET")
          return route.fulfill({ json: { data: view(p, viewer) } });
        const managed =
          isAdmin(viewer) ||
          (p.id !== viewer.id &&
            p.memberships.some(
              (m) => !isManager(m.role) && manages(viewer, m.teamId),
            ));
        if (
          !managed ||
          ((method === "DELETE" || body?.status) && !isAdmin(viewer))
        )
          return forbidden(
            route,
            "Only this person's team manager or the Leadership Lead can do this.",
          );
        if (method === "PATCH") {
          Object.assign(p, body);
          return route.fulfill({ json: { data: view(p, viewer) } });
        }
        if (method === "POST" && parts[2] === "password") {
          p.password = body.temporaryPassword;
          p.mustChangePassword = true;
          return route.fulfill({ status: 204, body: "" });
        }
        if (method === "DELETE") {
          if (teams.some((t) => t.leadId === p.id))
            return fail(
              route,
              409,
              "PERSON_LEADS_TEAM",
              `${p.name} leads a team. Choose a new team lead first.`,
            );
          people.splice(people.indexOf(p), 1);
          return route.fulfill({ status: 204, body: "" });
        }
      }
      return fail(route, 404, "NOT_FOUND", "Route not found");
    });
  };
}
