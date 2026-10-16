"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { errorMessage } from "@/lib/api";
import {
  AvatarStack,
  Button,
  compactSelectClasses,
  DataTable,
  EmptyState,
  ErrorState,
  nameClasses,
  Note,
  PageHeader,
  Skeleton,
  tableClasses,
  Tag,
  TeamAvatar,
} from "@/components/ui";
import { useAccess } from "@/features/auth/session";
import { Drawer } from "./drawer";
import { PersonForm, TeamForm } from "./forms";
import { PersonPanel, TeamPanel } from "./panels";
import { PeopleTable } from "./people-table";
import { TeamPreview } from "./team-preview";
import { usePeople, useTeams } from "./queries";

const teamColumns = [
  { label: "Team", className: "pl-3" },
  { label: "Lead", className: tableClasses.hideOnPhone },
  { label: "Members" },
];

export function TeamsPage() {
  const access = useAccess();
  const { me } = access;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get("view") === "people" ? "people" : "teams";
  const openTeamId = params.get("team");
  const openPersonId = params.get("person");
  const creating = params.get("new");

  const teamsQuery = useTeams();
  const peopleQuery = usePeople();
  const teams = teamsQuery.data;
  const people = peopleQuery.data;
  // A failed background refresh keeps showing the cached data; only a failed first load errors.
  const loadError =
    (!teams && teamsQuery.error) || (!people && peopleQuery.error);
  const error = loadError
    ? errorMessage(loadError, "Couldn't load teams.")
    : "";
  const retry = () => {
    void teamsQuery.refetch();
    void peopleQuery.refetch();
  };
  const [query, setQuery] = useState("");
  // The chosen filter and team remember who chose them, so another user starts on their own team.
  const [chosenFilter, setChosenFilter] = useState<{
    owner: string;
    teamId: string;
  } | null>(null);
  const setTeamFilter = (teamId: string) =>
    setChosenFilter({ owner: me.id, teamId });
  // Same for the selected team: it starts on the signed-in person's team until they click another.
  const [chosenTeam, setChosenTeam] = useState<{
    owner: string;
    teamId: string;
  } | null>(null);
  const selectTeam = (teamId: string) =>
    setChosenTeam({ owner: me.id, teamId });
  // Hovering a row previews its details without changing the selection; leaving the table
  // shows the selected team again. The short delay stops a quick sweep from flashing every team.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cancelHover = () => clearTimeout(hoverTimer.current);
  const hoverTeam = (teamId: string) => {
    cancelHover();
    hoverTimer.current = setTimeout(() => setHoveredId(teamId), 120);
  };
  const endHover = () => {
    cancelHover();
    setHoveredId(null);
  };
  useEffect(() => cancelHover, []);

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

  // People open on the signed-in person's own team; the filter can widen it to everyone.
  const myTeamIds = useMemo(
    () =>
      teams
        ?.filter((t) => t.members.some((m) => m.id === me.id))
        .map((t) => t.id) ?? [],
    [teams, me.id],
  );
  const filter =
    (chosenFilter?.owner === me.id ? chosenFilter.teamId : null) ??
    myTeamIds[0] ??
    "all";
  const q = query.trim().toLowerCase();

  const shownTeams = (teams ?? []).filter((team) =>
    team.name.toLowerCase().includes(q),
  );
  const selected =
    shownTeams.find(
      (t) => chosenTeam?.owner === me.id && t.id === chosenTeam.teamId,
    ) ??
    shownTeams.find((t) => myTeamIds.includes(t.id)) ??
    shownTeams[0];
  const preview = shownTeams.find((t) => t.id === hoveredId) ?? selected;

  const shownPeople = (people ?? []).filter(
    (person) =>
      (filter === "all" || person.teams.some((t) => t.id === filter)) &&
      `${person.name} ${person.jobTitle} ${person.location} ${person.email}`
        .toLowerCase()
        .includes(q),
  );

  const close = () => setParams({ team: null, person: null, new: null });
  const staff = (people ?? []).filter((person) => person.kind === "STAFF");

  return (
    <>
      <PageHeader title="Teams & members" />
      <div className="flex items-end justify-between gap-3 flex-wrap border-b border-line mb-3.5">
        <nav
          className="flex gap-0.5"
          role="tablist"
          aria-label="Teams and people"
        >
          {(["teams", "people"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={view === tab}
              className={`relative inline-flex items-center gap-1.5 h-9.5 px-2.5 text-[13.5px] font-medium hover:text-white ${view === tab ? "text-white after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-t-[2px] after:bg-white after:content-['']" : "text-dim"}`}
              onClick={() => {
                setQuery("");
                setParams({ view: tab === "teams" ? null : "people" });
              }}
            >
              {tab === "teams" ? "Teams" : "People"}
              <span className="text-[11px] text-faint">
                {tab === "teams"
                  ? (teams?.length ?? "")
                  : (people?.length ?? "")}
              </span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 pb-1.5 max-phone:w-full">
          <label className="flex items-center gap-[7px] h-7.5 w-50 px-2.5 rounded-[9px] bg-raised border border-line text-dim focus-within:border-line-hover max-phone:flex-1 max-phone:w-auto">
            <Search size={14} />
            <span className="sr-only">Search {view}</span>
            <input
              className="flex-1 min-w-0 bg-transparent text-[13px] outline-none focus-visible:outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={view === "teams" ? "Search teams" : "Search people"}
              autoComplete="off"
            />
          </label>
          {view === "people" && (
            <span>
              <label className="sr-only" htmlFor="team-filter">
                Team
              </label>
              <select
                className={compactSelectClasses}
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
          {(view === "teams" ? access.administer : access.managesAnyTeam) && (
            <Button
              variant="primary"
              square
              aria-label={view === "teams" ? "New team" : "Add user"}
              data-tip={view === "teams" ? "New team" : "Add user"}
              onClick={() =>
                setParams({ new: view === "teams" ? "team" : "person" })
              }
            >
              <Plus size={15} />
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : !teams || !people ? (
        <Skeleton rows={6} />
      ) : view === "teams" ? (
        shownTeams.length ? (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(290px,0.8fr)] gap-5 items-start max-laptop:grid-cols-1">
            <DataTable
              columns={teamColumns}
              bodyProps={{ onMouseLeave: endHover }}
            >
              {shownTeams.map((team) => (
                <tr
                  key={team.id}
                  className={
                    team.id === selected?.id
                      ? "cursor-pointer focus-visible:outline-none [&>td]:bg-[#101010] [&>td:first-child]:shadow-[inset_2px_0_0_#fff]"
                      : tableClasses.clickableRow
                  }
                  tabIndex={0}
                  aria-selected={team.id === selected?.id}
                  onMouseEnter={() => hoverTeam(team.id)}
                  onMouseLeave={cancelHover}
                  onClick={() => {
                    endHover();
                    selectTeam(team.id);
                  }}
                  onDoubleClick={() => setParams({ team: team.id })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setParams({ team: team.id });
                    else if (event.key === " ") {
                      event.preventDefault();
                      selectTeam(team.id);
                    }
                  }}
                >
                  <td className={`${tableClasses.cell} pl-3`}>
                    <span className={nameClasses.wrap}>
                      <TeamAvatar icon={team.icon} />
                      <b className={nameClasses.name}>{team.name}</b>
                      {myTeamIds.includes(team.id) && <Tag>My team</Tag>}
                      {team.isCore && <Tag>Core</Tag>}
                    </span>
                  </td>
                  <td
                    className={`${tableClasses.cell} ${tableClasses.hideOnPhone}`}
                  >
                    {team.lead?.name ?? "—"}
                  </td>
                  <td className={tableClasses.cell}>
                    <AvatarStack names={team.members.map((m) => m.name)} />
                    <span className="text-dim">{team.memberCount}</span>
                  </td>
                </tr>
              ))}
            </DataTable>
            {preview && (
              <TeamPreview
                team={preview}
                isMyTeam={myTeamIds.includes(preview.id)}
                onOpenPerson={(personId) =>
                  setParams({ view: "people", person: personId })
                }
                onViewPeople={() => {
                  setTeamFilter(preview.id);
                  setParams({ view: "people" });
                }}
                onOpenTeam={() => setParams({ team: preview.id })}
              />
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
          myPersonId={me.id}
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
          {creating === "team" && access.administer ? (
            <>
              <h2 className="mb-3 text-[18px]">New team</h2>
              <TeamForm
                people={staff}
                onSaved={(team) => setParams({ new: null, team: team.id })}
                onCancel={close}
              />
            </>
          ) : creating === "person" && access.managesAnyTeam ? (
            <>
              <h2 className="mb-3 text-[18px]">Add user</h2>
              <PersonForm
                teams={teams.filter((t) => access.managesTeam(t.id))}
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
              people={people}
              access={access}
              onOpenPerson={(id) =>
                setParams({ team: null, view: "people", person: id })
              }
              onDeleted={close}
            />
          ) : openPersonId ? (
            <PersonPanel
              key={openPersonId}
              personId={openPersonId}
              teams={teams}
              access={access}
              onOpenTeam={(id) =>
                setParams({ person: null, view: null, team: id })
              }
              onDeleted={close}
            />
          ) : (
            <Note>Your role can’t add teams or users.</Note>
          )}
        </Drawer>
      )}
    </>
  );
}
