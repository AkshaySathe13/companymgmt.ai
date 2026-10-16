"use client";
import { useState, type ReactNode } from "react";
import { KeyRound, Lock, Pencil, UserCheck, UserX } from "lucide-react";
import { errorMessage } from "@/lib/api";
import type { Access } from "@/features/auth/session";
import {
  Avatar,
  Button,
  ConfirmDelete,
  ErrorState,
  Field,
  FormActions,
  InlineError,
  inputClasses,
  Note,
  Section,
  Skeleton,
  Tag,
  TeamAvatar,
} from "@/components/ui";
import { AddPicker } from "./add-picker";
import { PersonForm, TeamForm } from "./forms";
import {
  useAddMember,
  useDeletePerson,
  useDeleteTeam,
  usePerson,
  useRemoveMember,
  useResetPassword,
  useTeam,
  useUpdatePerson,
} from "./queries";
import { RecordRow } from "./record-row";
import { teamKindLabel, workModeLabel, type Person, type Team } from "./types";

/** Manager roles (held by team leads) as opposed to member roles. */
const isManagerRole = (role: string) =>
  role === "LEADERSHIP_LEAD" || role.endsWith("_MANAGER");

/** Drawer header: avatar, name and a one-line summary. */
function DrawerHeader({
  avatar,
  title,
  summary,
}: {
  avatar: ReactNode;
  title: ReactNode;
  summary: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-3.5">
      {avatar}
      <div>
        <h2 className="text-[18px] font-[650]">{title}</h2>
        <p className="mt-[3px] text-[12.5px] text-dim">{summary}</p>
      </div>
    </div>
  );
}

/**
 * Add and remove membership mutations sharing one error line. `add` resolves true on success,
 * so the add picker only clears when the person was added.
 */
function useMembership() {
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const [error, setError] = useState("");
  const run = async (action: () => Promise<unknown>) => {
    setError("");
    try {
      await action();
      return true;
    } catch (caught) {
      setError(errorMessage(caught));
      return false;
    }
  };
  return {
    error,
    add: (teamId: string, personId: string) =>
      run(() => addMember.mutateAsync({ teamId, personId })),
    remove: (teamId: string, personId: string) =>
      run(() => removeMember.mutateAsync({ teamId, personId })),
  };
}

/** Label/value pairs in a drawer. */
const detailListClasses =
  "grid grid-cols-[auto_1fr] gap-x-4.5 gap-y-2 text-[13px] [&_dt]:text-dim [&_dd]:min-w-0 [&_dd]:[overflow-wrap:anywhere]";

const loadError = (error: unknown) => (error ? errorMessage(error) : "");

export function TeamPanel({
  teamId,
  people,
  access,
  onOpenPerson,
  onDeleted,
}: {
  teamId: string;
  people: Person[];
  access: Access;
  onOpenPerson: (id: string) => void;
  onDeleted: () => void;
}) {
  const { data: team, error, refetch } = useTeam(teamId);
  const deleteTeam = useDeleteTeam();
  const membership = useMembership();
  const [editing, setEditing] = useState(false);

  if (!team && error)
    return <ErrorState message={loadError(error)} onRetry={refetch} />;
  if (!team) return <Skeleton rows={6} />;

  // Only the Leadership Lead edits teams; a team's manager manages who is in it.
  const canEdit = access.administer;
  const canManageMembers = access.managesTeam(team.id);
  const outside = people.filter(
    (person) => !team.members.some((m) => m.id === person.id),
  );
  const teamCountOf = (personId: string) =>
    people.find((p) => p.id === personId)?.teams.length ?? 0;

  return (
    <>
      <DrawerHeader
        avatar={<TeamAvatar icon={team.icon} size="lg" />}
        title={team.name}
        summary={
          <>
            {teamKindLabel[team.kind]} · {team.memberCount}{" "}
            {team.memberCount === 1 ? "member" : "members"}
            {access.inTeam(team.id) && " · My team"}
            {team.isCore && " · Core team"}
          </>
        }
      />
      {editing && canEdit ? (
        <TeamForm
          team={team}
          people={people.filter((p) => p.kind === "STAFF")}
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <dl className={detailListClasses}>
            <dt>Purpose</dt>
            <dd>{team.purpose}</dd>
            <dt>Lead</dt>
            <dd>
              {team.lead ? `${team.lead.name} · ${team.lead.jobTitle}` : "—"}
            </dd>
            <dt>Created</dt>
            <dd>
              {new Date(team.createdAt).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </dd>
          </dl>
          {canManageMembers && !canEdit && (
            <Note>
              <Lock size={13} aria-hidden="true" /> You manage this team’s
              members. Only the Leadership Lead can edit or delete teams.
            </Note>
          )}
          {canEdit && (
            <FormActions>
              <Button onClick={() => setEditing(true)}>
                <Pencil size={14} />
                Edit team
              </Button>
            </FormActions>
          )}
        </>
      )}

      <Section title="Members" count={team.memberCount}>
        {team.members.map((member) => (
          <RecordRow
            key={member.id}
            avatar={<Avatar name={member.name} />}
            title={member.name}
            detail={
              <>
                {member.roleLabel} · {member.jobTitle}
                {member.workMode && ` · ${workModeLabel[member.workMode]}`}
              </>
            }
            onOpen={() => onOpenPerson(member.id)}
            // Leads stay in their team, and nobody loses their last team.
            remove={
              canManageMembers &&
              member.id !== team.leadId &&
              teamCountOf(member.id) > 1
                ? {
                    label: `Remove ${member.name} from ${team.name}`,
                    onRemove: () => membership.remove(team.id, member.id),
                  }
                : undefined
            }
          />
        ))}
        {canManageMembers && outside.length > 0 && (
          <AddPicker
            id="add-member"
            label={`Add a person to ${team.name}`}
            placeholder="Add a person…"
            options={outside.map((person) => ({
              value: person.id,
              label: `${person.name} · ${person.jobTitle}`,
            }))}
            onAdd={(personId) => membership.add(team.id, personId)}
          />
        )}
        <InlineError message={membership.error} />
      </Section>

      {canEdit && (
        <Section>
          <ConfirmDelete
            what="team"
            onConfirm={async () => {
              await deleteTeam.mutateAsync(team.id);
              onDeleted();
            }}
          />
        </Section>
      )}
    </>
  );
}

/** Sets a temporary password that the person must replace at their next sign-in. */
function ResetPassword({ person }: { person: Person }) {
  const reset = useResetPassword(person.id);
  const [open, setOpen] = useState(false);
  if (reset.isSuccess)
    return (
      <Note>
        Temporary password set. Share it with {person.name.split(" ")[0]}{" "}
        privately; they’ll choose a new one at sign-in.
      </Note>
    );
  if (!open)
    return (
      <Button onClick={() => setOpen(true)}>
        <KeyRound size={14} />
        Reset password
      </Button>
    );
  return (
    <form
      className="grid gap-2 w-full"
      onSubmit={(event) => {
        event.preventDefault();
        reset.mutate(
          String(new FormData(event.currentTarget).get("temporaryPassword")),
        );
      }}
    >
      <Field label="Temporary password">
        <input
          className={inputClasses}
          name="temporaryPassword"
          type="text"
          autoComplete="off"
          required
          minLength={10}
          maxLength={200}
        />
      </Field>
      <InlineError
        message={reset.error ? errorMessage(reset.error) : undefined}
      />
      <FormActions>
        <Button variant="primary" type="submit" disabled={reset.isPending}>
          {reset.isPending ? "Saving…" : "Set temporary password"}
        </Button>
        <Button type="button" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </FormActions>
    </form>
  );
}

/** Suspends (signs out everywhere, blocks sign-in) or reactivates a user. Leadership Lead only. */
function SuspendToggle({ person }: { person: Person }) {
  const update = useUpdatePerson(person.id);
  const suspended = person.status === "SUSPENDED";
  return (
    <>
      <Button
        variant={suspended ? "default" : "danger"}
        disabled={update.isPending}
        onClick={() =>
          update.mutate({ status: suspended ? "ACTIVE" : "SUSPENDED" })
        }
      >
        {suspended ? <UserCheck size={14} /> : <UserX size={14} />}
        {suspended ? "Reactivate" : "Suspend"}
      </Button>
      <InlineError
        message={update.error ? errorMessage(update.error) : undefined}
      />
    </>
  );
}

export function PersonPanel({
  personId,
  teams,
  access,
  onOpenTeam,
  onDeleted,
}: {
  personId: string;
  teams: Team[];
  access: Access;
  onOpenTeam: (id: string) => void;
  onDeleted: () => void;
}) {
  const { data: person, error, refetch } = usePerson(personId);
  const deletePerson = useDeletePerson();
  const membership = useMembership();
  const [editing, setEditing] = useState(false);

  if (!person && error)
    return <ErrorState message={loadError(error)} onRetry={refetch} />;
  if (!person) return <Skeleton rows={6} />;

  const isMe = person.id === access.me.id;
  // The Leadership Lead manages everyone; a manager manages the members of their team.
  const canManage =
    access.administer ||
    (!isMe &&
      person.teams.some(
        (t) => !isManagerRole(t.role) && access.managesTeam(t.id),
      ));
  const addable = teams.filter(
    (team) =>
      access.managesTeam(team.id) &&
      !person.teams.some((t) => t.id === team.id),
  );

  return (
    <>
      <DrawerHeader
        avatar={<Avatar name={person.name} size="lg" />}
        title={
          <>
            {person.name}
            {isMe && <Tag>Me</Tag>}
            {person.status === "SUSPENDED" && <Tag>Suspended</Tag>}
          </>
        }
        summary={person.jobTitle}
      />
      {editing && canManage ? (
        <PersonForm
          person={person}
          teams={teams}
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : person.restricted ? (
        <Note>
          <Lock size={13} aria-hidden="true" /> Contact details and location are
          visible to {person.name.split(" ")[0]}’s teammates and to leadership.
        </Note>
      ) : (
        <>
          <dl className={detailListClasses}>
            <dt>Email</dt>
            <dd>{person.email}</dd>
            <dt>Location</dt>
            <dd>{person.location}</dd>
            <dt>Time zone</dt>
            <dd>{person.timezone}</dd>
            <dt>Works</dt>
            <dd>
              {person.workMode && workModeLabel[person.workMode]}
              {person.kind === "EXTERNAL" && " · external contact"}
            </dd>
          </dl>
          {canManage && (
            <FormActions>
              <Button onClick={() => setEditing(true)}>
                <Pencil size={14} />
                Edit profile
              </Button>
              {!isMe && <ResetPassword person={person} />}
            </FormActions>
          )}
        </>
      )}

      <Section title="Teams" count={person.teams.length}>
        {person.teams.map((team) => {
          const leads = person.leadsTeamIds.includes(team.id);
          return (
            <RecordRow
              key={team.id}
              avatar={<TeamAvatar icon={team.icon} />}
              title={team.name}
              detail={team.roleLabel}
              onOpen={() => onOpenTeam(team.id)}
              remove={
                access.managesTeam(team.id) && !leads && person.teams.length > 1
                  ? {
                      label: `Remove ${person.name} from ${team.name}`,
                      onRemove: () => membership.remove(team.id, person.id),
                    }
                  : undefined
              }
            />
          );
        })}
        {addable.length > 0 && (
          <AddPicker
            id="add-team"
            label={`Add ${person.name} to a team`}
            placeholder="Add to a team…"
            options={addable.map((team) => ({
              value: team.id,
              label: team.name,
            }))}
            onAdd={(teamId) => membership.add(teamId, person.id)}
          />
        )}
        <InlineError message={membership.error} />
        <Note>
          Each team gives its lead the manager role and everyone else the member
          role. Everyone keeps at least one team.
        </Note>
      </Section>

      {access.administer && !isMe && (
        <Section title="Account">
          <FormActions>
            <SuspendToggle person={person} />
          </FormActions>
          <div className="mt-3">
            <ConfirmDelete
              what="user"
              onConfirm={async () => {
                await deletePerson.mutateAsync(person.id);
                onDeleted();
              }}
            />
          </div>
        </Section>
      )}
    </>
  );
}
