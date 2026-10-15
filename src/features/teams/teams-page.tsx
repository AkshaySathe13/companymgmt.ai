"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Plus, Search } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  Avatar,
  AvatarStack,
  EmptyState,
  ErrorState,
  Skeleton,
  Tag,
  TeamAvatar,
} from "@/components/ui";
import { usePreviewRole } from "@/features/auth/preview-role";
import { onDataChanged, peopleApi, teamsApi } from "./api";
import { Drawer } from "./drawer";
import { PersonForm, TeamForm } from "./forms";
import { PersonPanel, TeamPanel } from "./panels";
import { teamKindLabel, workModeLabel, type Person, type Team } from "./types";

export function TeamsPage() {
  const role = usePreviewRole();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get("view") === "people" ? "people" : "teams";
  const openTeamId = params.get("team");
  const openPersonId = params.get("person");
  const creating = params.get("new");

  const [teams, setTeams] = useState<Team[] | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  // The chosen filter remembers which preview person chose it, so switching role resets it.
  const [chosenFilter, setChosenFilter] = useState<{
    owner: string;
    teamId: string;
  } | null>(null);
  const setTeamFilter = (teamId: string) =>
    setChosenFilter({ owner: role.personId, teamId });
  // Same for the selected team: it starts on the signed-in person's team until they click another.
  const [chosenTeam, setChosenTeam] = useState<{
    owner: string;
    teamId: string;
  } | null>(null);
  const selectTeam = (teamId: string) =>
    setChosenTeam({ owner: role.personId, teamId });

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      const search = next.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  const load = useCallback(() => {
    Promise.all([teamsApi.list(), peopleApi.list()])
      .then(([nextTeams, nextPeople]) => {
        setTeams(nextTeams);
        setPeople(nextPeople);
        setError("");
      })
      .catch((caught) =>
        setError(
          caught instanceof ApiError ? caught.message : "Couldn't load teams.",
        ),
      );
  }, []);

  useEffect(() => {
    load();
    return onDataChanged(load);
  }, [load]);

  // People open on the signed-in person's own team; the filter can widen it to everyone.
  const myTeamIds = useMemo(
    () =>
      teams
        ?.filter((t) => t.members.some((m) => m.id === role.personId))
        .map((t) => t.id) ?? [],
    [teams, role.personId],
  );
  const filter =
    (chosenFilter?.owner === role.personId ? chosenFilter.teamId : null) ??
    myTeamIds[0] ??
    "all";
  const q = query.trim().toLowerCase();

  const shownTeams = (teams ?? []).filter((team) =>
    team.name.toLowerCase().includes(q),
  );
  const preview =
    shownTeams.find(
      (t) => chosenTeam?.owner === role.personId && t.id === chosenTeam.teamId,
    ) ??
    shownTeams.find((t) => myTeamIds.includes(t.id)) ??
    shownTeams[0];

  const shownPeople = (people ?? []).filter(
    (person) =>
      (filter === "all" || person.teams.some((t) => t.id === filter)) &&
      `${person.name} ${person.role} ${person.location} ${person.email}`
        .toLowerCase()
        .includes(q),
  );

  const close = () => setParams({ team: null, person: null, new: null });
  const staff = (people ?? []).filter((person) => person.kind === "STAFF");

  return (
    <>
      <header className="cc-ph">
        <div>
          <h1>Teams & members</h1>
          <p>Every team, its members and their connected work.</p>
        </div>
      </header>
      <div className="cc-bar">
        <nav className="cc-tabs" role="tablist" aria-label="Teams and people">
          {(["teams", "people"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={view === tab}
              className={view === tab ? "on" : ""}
              onClick={() => {
                setQuery("");
                setParams({ view: tab === "teams" ? null : "people" });
              }}
            >
              {tab === "teams" ? "Teams" : "People"}
              <span>
                {tab === "teams"
                  ? (teams?.length ?? "")
                  : (people?.length ?? "")}
              </span>
            </button>
          ))}
        </nav>
        <div className="cc-tools">
          <label className="cc-fsearch">
            <Search size={14} />
            <span className="sr-only">Search {view}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={view === "teams" ? "Search teams" : "Search people"}
              autoComplete="off"
            />
          </label>
          {view === "people" && (
            <span className="cc-sel">
              <label className="sr-only" htmlFor="team-filter">
                Team
              </label>
              <select
                id="team-filter"
                value={filter}
                onChange={(event) => setTeamFilter(event.target.value)}
              >
                <option value="all">All teams</option>
                {(teams ?? []).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                    {myTeamIds.includes(team.id) ? " (my team)" : ""}
                  </option>
                ))}
              </select>
            </span>
          )}
          {role.canManage && (
            <button
              className="cc-btn cc-btn-pri cc-btn-sq"
              aria-label={view === "teams" ? "New team" : "Add person"}
              data-tip={view === "teams" ? "New team" : "Add person"}
              onClick={() =>
                setParams({ new: view === "teams" ? "team" : "person" })
              }
            >
              <Plus size={15} />
            </button>
          )}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !teams || !people ? (
        <Skeleton rows={6} />
      ) : view === "teams" ? (
        shownTeams.length ? (
          <div className="cc-split">
            <div className="cc-tw">
              <table className="cc-t">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th className="hide-s">Lead</th>
                    <th>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {shownTeams.map((team) => (
                    <tr
                      key={team.id}
                      className={`cc-click ${team.id === preview?.id ? "pv" : ""}`}
                      tabIndex={0}
                      aria-selected={team.id === preview?.id}
                      onClick={() => selectTeam(team.id)}
                      onDoubleClick={() => setParams({ team: team.id })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setParams({ team: team.id });
                        else if (event.key === " ") {
                          event.preventDefault();
                          selectTeam(team.id);
                        }
                      }}
                    >
                      <td>
                        <span className="cc-who">
                          <TeamAvatar icon={team.icon} />
                          <b>{team.name}</b>
                          {myTeamIds.includes(team.id) && <Tag>My team</Tag>}
                        </span>
                      </td>
                      <td className="hide-s">{team.lead?.name ?? "—"}</td>
                      <td>
                        <AvatarStack names={team.members.map((m) => m.name)} />
                        <span className="cc-dim">{team.memberCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview && (
              <aside
                className="cc-prev"
                aria-live="polite"
                aria-label="Team details"
              >
                <div className="cc-who">
                  <TeamAvatar icon={preview.icon} size="lg" />
                  <div>
                    <h2>{preview.name}</h2>
                    <p className="cc-sub">
                      {teamKindLabel[preview.kind]} · {preview.memberCount}{" "}
                      members
                      {myTeamIds.includes(preview.id) && " · My team"}
                    </p>
                  </div>
                </div>
                <p className="cc-desc">{preview.purpose}</p>
                <h4>Lead</h4>
                {preview.lead ? (
                  <button
                    className="cc-row cc-plain"
                    onClick={() =>
                      setParams({ view: "people", person: preview.lead!.id })
                    }
                  >
                    <Avatar name={preview.lead.name} />
                    <span className="cc-grow">
                      <b>{preview.lead.name}</b>
                      <small>{preview.lead.role}</small>
                    </span>
                  </button>
                ) : (
                  <p className="cc-note">No lead yet.</p>
                )}
                <h4>Members</h4>
                {preview.members
                  .filter((member) => member.id !== preview.leadId)
                  .map((member) => (
                    <button
                      key={member.id}
                      className="cc-row cc-plain"
                      onClick={() =>
                        setParams({ view: "people", person: member.id })
                      }
                    >
                      <Avatar name={member.name} size="xs" />
                      <span className="cc-grow cc-inline-name">
                        <b>{member.name}</b>
                        <small>{member.role}</small>
                      </span>
                    </button>
                  ))}
                <div className="cc-form-acts">
                  <button
                    className="cc-btn"
                    onClick={() => {
                      setTeamFilter(preview.id);
                      setParams({ view: "people" });
                    }}
                  >
                    View people
                  </button>
                  <button
                    className="cc-btn"
                    onClick={() => setParams({ team: preview.id })}
                  >
                    Open team
                    <ArrowRight size={13} />
                  </button>
                </div>
              </aside>
            )}
          </div>
        ) : (
          <EmptyState>No teams match “{query}”.</EmptyState>
        )
      ) : shownPeople.length ? (
        <PeopleTable
          people={shownPeople}
          teams={teams}
          grouped={filter === "all" && !q}
          myPersonId={role.personId}
          onOpen={(id) => setParams({ person: id })}
        />
      ) : (
        <EmptyState>
          No people match. Try another name or choose All teams.
        </EmptyState>
      )}

      {teams && people && (openTeamId || openPersonId || creating) && (
        <Drawer
          label={creating ? `New ${creating}` : openTeamId ? "Team" : "Person"}
          context={
            creating
              ? "Teams & members"
              : openTeamId
                ? "Team · Teams & members"
                : "Person · Teams & members"
          }
          onClose={close}
        >
          {creating === "team" && role.canManage ? (
            <>
              <h2 className="cc-form-title">New team</h2>
              <TeamForm
                people={staff}
                onSaved={(team) => setParams({ new: null, team: team.id })}
                onCancel={close}
              />
            </>
          ) : creating === "person" && role.canManage ? (
            <>
              <h2 className="cc-form-title">Add person</h2>
              <PersonForm
                teams={teams}
                defaultTeamId={filter === "all" ? undefined : filter}
                onSaved={(person) =>
                  setParams({ new: null, person: person.id })
                }
                onCancel={close}
              />
            </>
          ) : openTeamId ? (
            <TeamPanel
              key={openTeamId}
              teamId={openTeamId}
              initial={teams.find((t) => t.id === openTeamId)}
              people={people}
              myPersonId={role.personId}
              canManage={role.canManage}
              onOpenPerson={(id) =>
                setParams({ team: null, view: "people", person: id })
              }
              onDeleted={close}
            />
          ) : openPersonId ? (
            <PersonPanel
              key={openPersonId}
              personId={openPersonId}
              initial={people.find((p) => p.id === openPersonId)}
              teams={teams}
              myPersonId={role.personId}
              canManage={role.canManage}
              onOpenTeam={(id) =>
                setParams({ person: null, view: null, team: id })
              }
              onDeleted={close}
            />
          ) : (
            <p className="cc-note">Your preview role can’t add records.</p>
          )}
        </Drawer>
      )}
    </>
  );
}

function PeopleTable({
  people,
  teams,
  grouped,
  myPersonId,
  onOpen,
}: {
  people: Person[];
  teams: Team[];
  grouped: boolean;
  myPersonId: string;
  onOpen: (id: string) => void;
}) {
  const row = (person: Person, group = "") => (
    <tr
      key={`${group}-${person.id}`}
      className="cc-click"
      tabIndex={0}
      onClick={() => onOpen(person.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(person.id);
      }}
    >
      <td>
        <span className="cc-who">
          <Avatar name={person.name} />
          <b>{person.name}</b>
          {person.id === myPersonId && <Tag>Me</Tag>}
        </span>
      </td>
      <td>{person.role}</td>
      <td className="hide-s">
        <span className="cc-tags">
          {person.teams.map((team) => (
            <Tag key={team.id}>{team.name}</Tag>
          ))}
        </span>
      </td>
      <td className="hide-s cc-dim">
        {person.location} · {person.timezone}
      </td>
      <td className="hide-s">{workModeLabel[person.workMode]}</td>
    </tr>
  );
  return (
    <div className="cc-tw">
      <table className="cc-t">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th className="hide-s">Teams</th>
            <th className="hide-s">Location</th>
            <th className="hide-s">Works</th>
          </tr>
        </thead>
        <tbody>
          {grouped
            ? teams.map((team) => {
                const members = people.filter((p) =>
                  p.teams.some((t) => t.id === team.id),
                );
                return members.length
                  ? [
                      <tr key={`g-${team.id}`} className="cc-g">
                        <td colSpan={5}>
                          {team.name}
                          <span>{members.length}</span>
                        </td>
                      </tr>,
                      ...members.map((person) => row(person, team.id)),
                    ]
                  : null;
              })
            : people.map((person) => row(person))}
        </tbody>
      </table>
    </div>
  );
}
