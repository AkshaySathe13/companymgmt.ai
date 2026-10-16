"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { errorMessage } from "@/lib/api";
import {
  Avatar,
  DataTable,
  listRowClasses,
  nameClasses,
  Note,
  Skeleton,
  tableClasses,
  TeamAvatar,
  Tag,
  TagList,
} from "@/components/ui";
import { usePeople, useTeam, useTeams } from "@/features/teams/queries";
import {
  workModeLabel,
  type AiView,
  type Person,
  type Team,
} from "@/features/teams/types";

/**
 * Renders a view Claude asked for, loading current records by ID so the view is never stale or
 * invented. Views share the query cache with the rest of the app.
 */
export function AiViewCard({ view }: { view: AiView }) {
  return (
    <section
      className={`min-w-0 p-3.5 rounded-xl bg-panel border border-line ${view.kind === "team" ? "" : "col-span-full max-tablet:col-auto"}`}
    >
      <h4 className="mb-2 text-[12px] font-semibold tracking-[0.04em] uppercase text-subtle">
        {view.title}
      </h4>
      {view.kind === "team" && view.teamId ? (
        <TeamLoader id={view.teamId} />
      ) : view.kind === "people" ? (
        <PeopleLoader ids={view.personIds ?? []} />
      ) : (
        <TeamsLoader />
      )}
    </section>
  );
}

/** Loading, error or the loaded view. */
function Loaded<T>({
  query,
  children,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}) {
  if (query.data !== undefined) return children(query.data);
  if (query.error)
    return <Note>{errorMessage(query.error, "This view couldn't load.")}</Note>;
  return <Skeleton rows={3} />;
}

function TeamLoader({ id }: { id: string }) {
  const query = useTeam(id);
  return <Loaded query={query}>{(team) => <TeamView team={team} />}</Loaded>;
}

function PeopleLoader({ ids }: { ids: string[] }) {
  const query = usePeople({ ids });
  return (
    <Loaded query={query}>{(people) => <PeopleView people={people} />}</Loaded>
  );
}

function TeamsLoader() {
  const query = useTeams();
  return (
    <Loaded query={query}>{(teams) => <TeamsView teams={teams} />}</Loaded>
  );
}

function TeamsView({ teams }: { teams: Team[] }) {
  return (
    <DataTable
      columns={[
        { label: "Team" },
        { label: "Lead" },
        { label: "Members", className: tableClasses.numeric },
      ]}
    >
      {teams.map((team) => (
        <tr key={team.id} className={tableClasses.row}>
          <td className={tableClasses.cell}>
            <Link className={nameClasses.link} href={`/teams?team=${team.id}`}>
              <TeamAvatar icon={team.icon} />
              <b className={nameClasses.name}>{team.name}</b>
            </Link>
          </td>
          <td className={tableClasses.cell}>{team.lead?.name ?? "—"}</td>
          <td className={`${tableClasses.cell} ${tableClasses.numeric}`}>
            {team.memberCount}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function TeamView({ team }: { team: Team }) {
  return (
    <>
      <Link className={nameClasses.link} href={`/teams?team=${team.id}`}>
        <TeamAvatar icon={team.icon} />
        <b className={nameClasses.name}>{team.name}</b>
      </Link>
      <Note>{team.purpose}</Note>
      {team.members.map((member) => (
        <Link
          key={member.id}
          className={`${listRowClasses.row} group`}
          href={`/teams?view=people&person=${member.id}`}
        >
          <Avatar name={member.name} />
          <span className={listRowClasses.text}>
            <b className={listRowClasses.title}>{member.name}</b>
            <small className={listRowClasses.detail}>
              {member.roleLabel} · {member.jobTitle}
            </small>
          </span>
        </Link>
      ))}
    </>
  );
}

function PeopleView({ people }: { people: Person[] }) {
  return (
    <DataTable
      columns={[
        { label: "Name" },
        { label: "Role" },
        { label: "Teams", className: tableClasses.hideOnPhone },
        { label: "Location", className: tableClasses.hideOnPhone },
      ]}
    >
      {people.map((person) => (
        <tr key={person.id} className={tableClasses.row}>
          <td className={tableClasses.cell}>
            <Link
              className={nameClasses.link}
              href={`/teams?view=people&person=${person.id}`}
            >
              <Avatar name={person.name} />
              <b className={nameClasses.name}>{person.name}</b>
            </Link>
          </td>
          <td className={tableClasses.cell}>{person.jobTitle}</td>
          <td className={`${tableClasses.cell} ${tableClasses.hideOnPhone}`}>
            <TagList>
              {person.teams.map((team) => (
                <Tag key={team.id} spaced={false}>
                  {team.name}
                </Tag>
              ))}
            </TagList>
          </td>
          <td
            className={`${tableClasses.cell} ${tableClasses.hideOnPhone} text-dim`}
          >
            {person.restricted || !person.workMode
              ? "Visible to their team"
              : `${person.location} · ${workModeLabel[person.workMode]}`}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
