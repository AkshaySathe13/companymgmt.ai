"use client";
import { useState, type FormEvent } from "react";
import { errorMessage } from "@/lib/api";
import {
  Button,
  Field,
  Form,
  FormActions,
  fieldLabelClasses,
  FormError,
  inputClasses,
  teamIcons,
} from "@/components/ui";
import { useCreatePerson, useSaveTeam, useUpdatePerson } from "./queries";
import {
  jobTitleSuggestions,
  memberRoleFor,
  teamKindLabel,
  workModeLabel,
  type Person,
  type Team,
  type TeamIcon,
  type TeamKind,
  type WorkMode,
} from "./types";

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Asia/Dubai",
  "Australia/Sydney",
];

function isTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const legendClasses = `mb-1.5 ${fieldLabelClasses}`;

const messageFor = (error: unknown) =>
  errorMessage(error, "Couldn't save. Please try again.");

/** Submit and Cancel for a record form. */
function SaveActions({
  busy,
  label,
  onCancel,
}: {
  busy: boolean;
  label: string;
  onCancel: () => void;
}) {
  return (
    <FormActions>
      <Button variant="primary" type="submit" disabled={busy}>
        {busy ? "Saving…" : label}
      </Button>
      <Button type="button" onClick={onCancel}>
        Cancel
      </Button>
    </FormActions>
  );
}

export function TeamForm({
  team,
  people,
  onSaved,
  onCancel,
}: {
  team?: Team;
  people: Person[];
  onSaved: (team: Team) => void;
  onCancel: () => void;
}) {
  const [icon, setIcon] = useState<TeamIcon>(team?.icon ?? "users");
  const save = useSaveTeam(team?.id);
  // Stays busy after success: the form closes as soon as onSaved runs.
  const busy = save.isPending || save.isSuccess;
  const error = save.error ? messageFor(save.error) : "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = {
      name: String(data.get("name")).trim(),
      purpose: String(data.get("purpose")).trim(),
      kind: String(data.get("kind")) as TeamKind,
      icon,
      leadId: String(data.get("leadId")),
    };
    save.mutate(input, { onSuccess: onSaved });
  }

  return (
    <Form onSubmit={submit}>
      <Field label="Team name">
        <input
          className={inputClasses}
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={team?.name}
        />
      </Field>
      <Field label="Purpose">
        <input
          className={inputClasses}
          name="purpose"
          required
          minLength={2}
          maxLength={240}
          defaultValue={team?.purpose}
        />
      </Field>
      <Field label="Type">
        <select
          className={inputClasses}
          name="kind"
          defaultValue={team?.kind ?? "TECHNICAL"}
        >
          {(Object.keys(teamKindLabel) as TeamKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {teamKindLabel[kind]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Team lead">
        <select
          className={inputClasses}
          name="leadId"
          required
          defaultValue={team?.leadId ?? ""}
        >
          <option value="" disabled>
            Choose a lead
          </option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name} · {person.jobTitle}
            </option>
          ))}
        </select>
      </Field>
      <fieldset className="flex flex-wrap gap-1.5">
        <legend className={legendClasses}>Icon</legend>
        {(Object.keys(teamIcons) as TeamIcon[]).map((key) => {
          const Icon = teamIcons[key];
          return (
            <label
              key={key}
              className={`grid place-items-center size-9 border rounded-[9px] cursor-pointer focus-within:outline-2 focus-within:outline-solid focus-within:outline-accent ${icon === key ? "border-white text-white bg-[#1a1a1a]" : "border-line-strong text-soft"}`}
              title={key}
            >
              <input
                className="absolute opacity-0 size-px"
                type="radio"
                name="icon"
                value={key}
                checked={icon === key}
                onChange={() => setIcon(key)}
              />
              <Icon size={16} />
              <span className="sr-only">{key}</span>
            </label>
          );
        })}
      </fieldset>
      <FormError>{error}</FormError>
      <SaveActions
        busy={busy}
        label={team ? "Save changes" : "Create team"}
        onCancel={onCancel}
      />
    </Form>
  );
}

export function PersonForm({
  person,
  teams,
  defaultTeamId,
  onSaved,
  onCancel,
}: {
  /** Editing this person; omit to create a new user. */
  person?: Person;
  /** Teams a new user can join: the ones the signed-in user manages. */
  teams: Team[];
  defaultTeamId?: string;
  onSaved: (person: Person) => void;
  onCancel: () => void;
}) {
  const create = useCreatePerson();
  const update = useUpdatePerson(person?.id ?? "");
  const save = person ? update : create;
  const [teamId, setTeamId] = useState(
    defaultTeamId && teams.some((t) => t.id === defaultTeamId)
      ? defaultTeamId
      : (teams[0]?.id ?? ""),
  );
  // Checks made here before sending; the API's own errors come from the mutation.
  const [invalid, setInvalid] = useState("");
  const busy = save.isPending || save.isSuccess;
  const error = invalid || (save.error ? messageFor(save.error) : "");
  const team = teams.find((t) => t.id === teamId);
  const memberRole = team ? memberRoleFor[team.kind] : undefined;
  const titles = memberRole ? jobTitleSuggestions[memberRole.role] : [];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = {
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      jobTitle: String(data.get("jobTitle")).trim(),
      location: String(data.get("location")).trim(),
      timezone: String(data.get("timezone")).trim(),
      workMode: String(data.get("workMode")) as WorkMode,
    };
    save.reset();
    if (!isTimeZone(fields.timezone)) {
      setInvalid("Use a time zone such as Asia/Kolkata or America/New_York.");
      return;
    }
    setInvalid("");
    if (person) update.mutate(fields, { onSuccess: onSaved });
    else
      create.mutate(
        {
          ...fields,
          teamId,
          temporaryPassword: String(data.get("temporaryPassword")),
        },
        { onSuccess: onSaved },
      );
  }

  return (
    <Form onSubmit={submit}>
      {!person && (
        <>
          <Field label="Team">
            <select
              className={inputClasses}
              name="teamId"
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              required
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <p className="-mt-1.5 text-[12px] text-dim">
            Role in this team:{" "}
            <b className="font-medium text-fg">{memberRole?.label ?? "—"}</b>.
            The team lead holds the manager role.
          </p>
        </>
      )}
      <Field label="Full name">
        <input
          className={inputClasses}
          name="name"
          required
          minLength={2}
          maxLength={120}
          defaultValue={person?.name}
        />
      </Field>
      <Field label="Work email">
        <input
          className={inputClasses}
          name="email"
          type="email"
          required
          maxLength={254}
          defaultValue={person?.email ?? undefined}
        />
      </Field>
      <Field label="Job title">
        <input
          className={inputClasses}
          name="jobTitle"
          required
          minLength={2}
          maxLength={120}
          list="cc-job-titles"
          placeholder={titles[0] ? `e.g. ${titles[0]}` : undefined}
          defaultValue={person?.jobTitle}
        />
        <datalist id="cc-job-titles">
          {titles.map((title) => (
            <option key={title} value={title} />
          ))}
        </datalist>
      </Field>
      <Field label="Location">
        <input
          className={inputClasses}
          name="location"
          required
          minLength={2}
          maxLength={120}
          placeholder="City, Country"
          defaultValue={person?.location ?? undefined}
        />
      </Field>
      <Field label="Time zone">
        <input
          className={inputClasses}
          name="timezone"
          required
          list="cc-timezones"
          minLength={2}
          maxLength={60}
          defaultValue={person?.timezone ?? "Asia/Kolkata"}
        />
        <datalist id="cc-timezones">
          {TIMEZONES.map((zone) => (
            <option key={zone} value={zone} />
          ))}
        </datalist>
      </Field>
      <Field label="Works">
        <select
          className={inputClasses}
          name="workMode"
          defaultValue={
            person?.workMode ??
            (team?.kind === "EXTERNAL" ? "EXTERNAL" : "OFFICE")
          }
        >
          {(Object.keys(workModeLabel) as WorkMode[]).map((mode) => (
            <option key={mode} value={mode}>
              {workModeLabel[mode]}
            </option>
          ))}
        </select>
      </Field>
      {!person && (
        <Field label="Temporary password">
          <input
            className={inputClasses}
            name="temporaryPassword"
            type="text"
            autoComplete="off"
            required
            minLength={10}
            maxLength={200}
            aria-describedby="temporary-password-help"
          />
          <span id="temporary-password-help" className="text-[11.5px] text-dim">
            At least 10 characters. Share it privately; they must change it at
            first sign-in.
          </span>
        </Field>
      )}
      <FormError>{error}</FormError>
      <SaveActions
        busy={busy}
        label={person ? "Save changes" : "Add user"}
        onCancel={onCancel}
      />
    </Form>
  );
}
