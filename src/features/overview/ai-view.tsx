"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Avatar, Skeleton, TeamAvatar, Tag } from "@/components/ui";
import { peopleApi, teamsApi } from "@/features/teams/api";
import {
  workModeLabel,
  type AiView,
  type Person,
  type Team,
} from "@/features/teams/types";

type Loaded =
  | { kind: "teams_overview"; teams: Team[] }
  | { kind: "team"; team: Team }
  | { kind: "people"; people: Person[] };

/** Renders a view Claude asked for, loading current records by ID so the view is never stale or invented. */
export function AiViewCard({ view }: { view: AiView }) {
  const [state, setState] = useState<Loaded | { error: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async (): Promise<Loaded> => {
      if (view.kind === "team" && view.teamId)
        return {
          kind: "team",
          team: await teamsApi.get(view.teamId, controller.signal),
        };
      if (view.kind === "people")
        return {
          kind: "people",
          people: await peopleApi.list(
            { ids: view.personIds },
            controller.signal,
          ),
        };
      return {
        kind: "teams_overview",
        teams: await teamsApi.list(controller.signal),
      };
    };
    load()
      .then(setState)
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setState({
          error:
            error instanceof ApiError
              ? error.message
              : "This view couldn't load.",
        });
      });
    return () => controller.abort();
  }, [view]);

  return (
    <section className={`cc-w ${view.kind === "team" ? "" : "wide"}`}>
      <h4>{view.title}</h4>
      {!state ? (
        <Skeleton rows={3} />
      ) : "error" in state ? (
        <p className="cc-note">{state.error}</p>
      ) : state.kind === "team" ? (
        <TeamView team={state.team} />
      ) : state.kind === "people" ? (
        <PeopleView people={state.people} />
      ) : (
        <TeamsView teams={state.teams} />
      )}
    </section>
  );
}

function TeamsView({ teams }: { teams: Team[] }) {
  return (
    <div className="cc-tw">
      <table className="cc-t">
        <thead>
          <tr>
            <th>Team</th>
            <th>Lead</th>
            <th className="num">Members</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>
                <Link className="cc-who" href={`/teams?team=${team.id}`}>
                  <TeamAvatar icon={team.icon} />
                  <b>{team.name}</b>
                </Link>
              </td>
              <td>{team.lead?.name ?? "—"}</td>
              <td className="num">{team.memberCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeamView({ team }: { team: Team }) {
  return (
    <>
      <Link className="cc-who" href={`/teams?team=${team.id}`}>
        <TeamAvatar icon={team.icon} />
        <b>{team.name}</b>
      </Link>
      <p className="cc-note">{team.purpose}</p>
      {team.members.map((member) => (
        <Link
          key={member.id}
          className="cc-row"
          href={`/teams?view=people&person=${member.id}`}
        >
          <Avatar name={member.name} />
          <span className="cc-grow">
            <b>{member.name}</b>
            <small>
              {member.id === team.leadId ? "Team lead · " : ""}
              {member.role}
            </small>
          </span>
        </Link>
      ))}
    </>
  );
}

function PeopleView({ people }: { people: Person[] }) {
  return (
    <div className="cc-tw">
      <table className="cc-t">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th className="hide-s">Teams</th>
            <th className="hide-s">Location</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.id}>
              <td>
                <Link
                  className="cc-who"
                  href={`/teams?view=people&person=${person.id}`}
                >
                  <Avatar name={person.name} />
                  <b>{person.name}</b>
                </Link>
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
                {person.location} · {workModeLabel[person.workMode]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
