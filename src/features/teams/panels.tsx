"use client";
import { useEffect, useState } from "react";
import { Lock, Pencil, Plus, Trash2, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { Avatar, ErrorState, Skeleton, Tag, TeamAvatar } from "@/components/ui";
import { peopleApi, teamsApi } from "./api";
import { PersonForm, TeamForm } from "./forms";
import { teamKindLabel, workModeLabel, type Person, type Team } from "./types";

const messageFor = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : "That didn't work. Please try again.";

// Shows the list copy straight away (no loading flash), then refreshes it from the API.
function useRecord<T>(
  load: (signal: AbortSignal) => Promise<T>,
  key: string,
  initial?: T,
) {
  const [record, setRecord] = useState<T | null>(initial ?? null);
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((next) => {
        setRecord(next);
        setError("");
      })
      .catch((caught) => {
        if (caught instanceof DOMException && caught.name === "AbortError")
          return;
        setError(messageFor(caught));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when the record key changes
  }, [key, nonce]);
  return {
    record,
    setRecord,
    error,
    reload: () => {
      setError("");
      setNonce((n) => n + 1);
    },
  };
}

function ConfirmDelete({
  what,
  onConfirm,
}: {
  what: string;
  onConfirm: () => Promise<void>;
}) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!asking)
    return (
      <button className="cc-btn cc-btn-danger" onClick={() => setAsking(true)}>
        <Trash2 size={14} />
        Delete {what}
      </button>
    );
  return (
    <div
      className="cc-confirm"
      role="alertdialog"
      aria-label={`Delete ${what}`}
    >
      <span>Delete this {what}? This can’t be undone.</span>
      <button
        className="cc-btn cc-btn-danger"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await onConfirm();
          } catch (caught) {
            setError(messageFor(caught));
            setBusy(false);
          }
        }}
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      <button
        className="cc-btn"
        onClick={() => setAsking(false)}
        disabled={busy}
      >
        Keep
      </button>
      {error && (
        <p className="cc-ferr" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TeamPanel({
  teamId,
  initial,
  people,
  myPersonId,
  canManage,
  canEditCoreTeams,
  onOpenPerson,
  onDeleted,
}: {
  teamId: string;
  initial?: Team;
  people: Person[];
  myPersonId: string;
  canManage: boolean;
  canEditCoreTeams: boolean;
  onOpenPerson: (id: string) => void;
  onDeleted: () => void;
}) {
  const {
    record: team,
    setRecord,
    error,
    reload,
  } = useRecord<Team>(
    (signal) => teamsApi.get(teamId, signal),
    teamId,
    initial,
  );
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [adding, setAdding] = useState("");

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!team) return <Skeleton rows={6} />;

  const outside = people.filter(
    (person) => !team.members.some((m) => m.id === person.id),
  );
  const canChange = canManage && (!team.isCore || canEditCoreTeams);
  const act = async (run: () => Promise<Team>) => {
    setActionError("");
    try {
      setRecord(await run());
    } catch (caught) {
      setActionError(messageFor(caught));
    }
  };

  return (
    <>
      <div className="cc-dr-h">
        <TeamAvatar icon={team.icon} size="lg" />
        <div>
          <h2>{team.name}</h2>
          <p>
            {teamKindLabel[team.kind]} · {team.memberCount}{" "}
            {team.memberCount === 1 ? "member" : "members"}
            {team.members.some((m) => m.id === myPersonId) && " · My team"}
            {team.isCore && " · Core team"}
          </p>
        </div>
      </div>
      {editing && canChange ? (
        <TeamForm
          team={team}
          people={people.filter((p) => p.kind === "STAFF")}
          onSaved={(saved) => {
            setRecord(saved);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <dl className="cc-kv">
            <dt>Purpose</dt>
            <dd>{team.purpose}</dd>
            <dt>Lead</dt>
            <dd>{team.lead ? `${team.lead.name} · ${team.lead.role}` : "—"}</dd>
            <dt>Created</dt>
            <dd>
              {new Date(team.createdAt).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </dd>
          </dl>
          {canManage && !canChange && (
            <p className="cc-note">
              <Lock size={13} aria-hidden="true" /> Core company team. Only an
              executive can edit or delete it.
            </p>
          )}
          {canChange && (
            <div className="cc-form-acts">
              <button className="cc-btn" onClick={() => setEditing(true)}>
                <Pencil size={14} />
                Edit team
              </button>
            </div>
          )}
        </>
      )}

      <section className="cc-sec">
        <h3>
          Members <span>{team.memberCount}</span>
        </h3>
        {team.members.map((member) => (
          <div key={member.id} className="cc-row">
            <Avatar name={member.name} />
            <button
              className="cc-grow cc-plain"
              onClick={() => onOpenPerson(member.id)}
            >
              <b>{member.name}</b>
              <small>
                {member.id === team.leadId ? "Team lead · " : ""}
                {member.role} · {workModeLabel[member.workMode]}
              </small>
            </button>
            {canManage && member.id !== team.leadId && (
              <button
                className="cc-ib"
                aria-label={`Remove ${member.name} from ${team.name}`}
                data-tip="Remove from team"
                onClick={() =>
                  act(() => teamsApi.removeMember(team.id, member.id))
                }
              >
                <X size={15} />
              </button>
            )}
          </div>
        ))}
        {canManage && outside.length > 0 && (
          <form
            className="cc-inline"
            onSubmit={(event) => {
              event.preventDefault();
              if (adding)
                act(() => teamsApi.addMember(team.id, adding)).then(() =>
                  setAdding(""),
                );
            }}
          >
            <label className="sr-only" htmlFor="add-member">
              Add a person to {team.name}
            </label>
            <select
              id="add-member"
              value={adding}
              onChange={(event) => setAdding(event.target.value)}
            >
              <option value="">Add a person…</option>
              {outside.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} · {person.role}
                </option>
              ))}
            </select>
            <button className="cc-btn" type="submit" disabled={!adding}>
              <Plus size={14} />
              Add
            </button>
          </form>
        )}
        {actionError && (
          <p className="cc-ferr" role="alert">
            {actionError}
          </p>
        )}
      </section>

      {canChange && (
        <section className="cc-sec">
          <ConfirmDelete
            what="team"
            onConfirm={async () => {
              await teamsApi.remove(team.id);
              onDeleted();
            }}
          />
        </section>
      )}
    </>
  );
}

export function PersonPanel({
  personId,
  initial,
  teams,
  myPersonId,
  canManage,
  onOpenTeam,
  onDeleted,
}: {
  personId: string;
  initial?: Person;
  teams: Team[];
  myPersonId: string;
  canManage: boolean;
  onOpenTeam: (id: string) => void;
  onDeleted: () => void;
}) {
  const {
    record: person,
    setRecord,
    error,
    reload,
  } = useRecord<Person>(
    (signal) => peopleApi.get(personId, signal),
    personId,
    initial,
  );
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [adding, setAdding] = useState("");

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!person) return <Skeleton rows={6} />;

  const otherTeams = teams.filter(
    (team) => !person.teams.some((t) => t.id === team.id),
  );
  const membership = async (run: () => Promise<Team>) => {
    setActionError("");
    try {
      await run();
      setRecord(await peopleApi.get(person.id));
    } catch (caught) {
      setActionError(messageFor(caught));
    }
  };

  return (
    <>
      <div className="cc-dr-h">
        <Avatar name={person.name} size="lg" />
        <div>
          <h2>
            {person.name}
            {person.id === myPersonId && <Tag>Me</Tag>}
          </h2>
          <p>{person.role}</p>
        </div>
      </div>
      {editing ? (
        <PersonForm
          person={person}
          teams={teams}
          onSaved={(saved) => {
            setRecord(saved);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <dl className="cc-kv">
            <dt>Email</dt>
            <dd>{person.email}</dd>
            <dt>Location</dt>
            <dd>{person.location}</dd>
            <dt>Time zone</dt>
            <dd>{person.timezone}</dd>
            <dt>Works</dt>
            <dd>
              {workModeLabel[person.workMode]}
              {person.kind === "EXTERNAL" && " · external contact"}
            </dd>
          </dl>
          {canManage && (
            <div className="cc-form-acts">
              <button className="cc-btn" onClick={() => setEditing(true)}>
                <Pencil size={14} />
                Edit profile
              </button>
            </div>
          )}
        </>
      )}

      <section className="cc-sec">
        <h3>
          Teams <span>{person.teams.length}</span>
        </h3>
        {person.teams.map((team) => {
          const leads = person.leadsTeamIds.includes(team.id);
          return (
            <div key={team.id} className="cc-row">
              <TeamAvatar icon={team.icon} />
              <button
                className="cc-grow cc-plain"
                onClick={() => onOpenTeam(team.id)}
              >
                <b>{team.name}</b>
                <small>{leads ? "Team lead" : "Member"}</small>
              </button>
              {canManage && !leads && person.teams.length > 1 && (
                <button
                  className="cc-ib"
                  aria-label={`Remove ${person.name} from ${team.name}`}
                  data-tip="Remove from team"
                  onClick={() =>
                    membership(() => teamsApi.removeMember(team.id, person.id))
                  }
                >
                  <X size={15} />
                </button>
              )}
            </div>
          );
        })}
        {canManage && otherTeams.length > 0 && (
          <form
            className="cc-inline"
            onSubmit={(event) => {
              event.preventDefault();
              if (adding)
                membership(() => teamsApi.addMember(adding, person.id)).then(
                  () => setAdding(""),
                );
            }}
          >
            <label className="sr-only" htmlFor="add-team">
              Add {person.name} to a team
            </label>
            <select
              id="add-team"
              value={adding}
              onChange={(event) => setAdding(event.target.value)}
            >
              <option value="">Add to a team…</option>
              {otherTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <button className="cc-btn" type="submit" disabled={!adding}>
              <Plus size={14} />
              Add
            </button>
          </form>
        )}
        {actionError && (
          <p className="cc-ferr" role="alert">
            {actionError}
          </p>
        )}
        <p className="cc-note">
          Everyone keeps at least one team, and team leads stay in the team they
          lead.
        </p>
      </section>

      {canManage && person.id !== myPersonId && (
        <section className="cc-sec">
          <ConfirmDelete
            what="person"
            onConfirm={async () => {
              await peopleApi.remove(person.id);
              onDeleted();
            }}
          />
        </section>
      )}
    </>
  );
}
