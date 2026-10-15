"use client";
import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { teamIcons } from "@/components/ui";
import { peopleApi, teamsApi } from "./api";
import {
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

function messageFor(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Couldn't save. Please try again.";
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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = {
      name: String(data.get("name")).trim(),
      purpose: String(data.get("purpose")).trim(),
      kind: String(data.get("kind")) as TeamKind,
      icon,
      leadId: String(data.get("leadId")),
    };
    setBusy(true);
    setError("");
    try {
      onSaved(
        team
          ? await teamsApi.update(team.id, input)
          : await teamsApi.create(input),
      );
    } catch (caught) {
      setError(messageFor(caught));
      setBusy(false);
    }
  }

  return (
    <form className="cc-form" onSubmit={submit}>
      <label>
        Team name
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={team?.name}
        />
      </label>
      <label>
        Purpose
        <input
          name="purpose"
          required
          minLength={2}
          maxLength={240}
          defaultValue={team?.purpose}
        />
      </label>
      <label>
        Type
        <select name="kind" defaultValue={team?.kind ?? "TECHNICAL"}>
          {(Object.keys(teamKindLabel) as TeamKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {teamKindLabel[kind]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Team lead
        <select name="leadId" required defaultValue={team?.leadId ?? ""}>
          <option value="" disabled>
            Choose a lead
          </option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name} · {person.role}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="cc-icons">
        <legend>Icon</legend>
        {(Object.keys(teamIcons) as TeamIcon[]).map((key) => {
          const Icon = teamIcons[key];
          return (
            <label key={key} className={icon === key ? "on" : ""} title={key}>
              <input
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
      <p className="cc-ferr" role="alert">
        {error}
      </p>
      <div className="cc-form-acts">
        <button className="cc-btn cc-btn-pri" type="submit" disabled={busy}>
          {busy ? "Saving…" : team ? "Save changes" : "Create team"}
        </button>
        <button className="cc-btn" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function PersonForm({
  person,
  teams,
  defaultTeamId,
  onSaved,
  onCancel,
}: {
  person?: Person;
  teams: Team[];
  defaultTeamId?: string;
  onSaved: (person: Person) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = {
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      role: String(data.get("role")).trim(),
      location: String(data.get("location")).trim(),
      timezone: String(data.get("timezone")).trim(),
      workMode: String(data.get("workMode")) as WorkMode,
    };
    const teamIds = data.getAll("teamIds").map(String);
    if (!person && !teamIds.length) {
      setError("Choose at least one team.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onSaved(
        person
          ? await peopleApi.update(person.id, fields)
          : await peopleApi.create({ ...fields, teamIds }),
      );
    } catch (caught) {
      setError(messageFor(caught));
      setBusy(false);
    }
  }

  return (
    <form className="cc-form" onSubmit={submit}>
      <label>
        Full name
        <input
          name="name"
          required
          minLength={2}
          maxLength={120}
          defaultValue={person?.name}
        />
      </label>
      <label>
        Work email
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          defaultValue={person?.email}
        />
      </label>
      <label>
        Company role
        <input
          name="role"
          required
          minLength={2}
          maxLength={120}
          placeholder="e.g. Backend developer"
          defaultValue={person?.role}
        />
      </label>
      <label>
        Location
        <input
          name="location"
          required
          minLength={2}
          maxLength={120}
          placeholder="City, Country"
          defaultValue={person?.location}
        />
      </label>
      <label>
        Time zone
        <input
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
      </label>
      <label>
        Works
        <select name="workMode" defaultValue={person?.workMode ?? "OFFICE"}>
          {(Object.keys(workModeLabel) as WorkMode[]).map((mode) => (
            <option key={mode} value={mode}>
              {workModeLabel[mode]}
            </option>
          ))}
        </select>
      </label>
      {!person && (
        <fieldset className="cc-checks">
          <legend>Teams (one or more)</legend>
          {teams.map((team) => (
            <label key={team.id}>
              <input
                type="checkbox"
                name="teamIds"
                value={team.id}
                defaultChecked={team.id === defaultTeamId}
              />
              {team.name}
            </label>
          ))}
        </fieldset>
      )}
      <p className="cc-ferr" role="alert">
        {error}
      </p>
      <div className="cc-form-acts">
        <button className="cc-btn cc-btn-pri" type="submit" disabled={busy}>
          {busy ? "Saving…" : person ? "Save changes" : "Add person"}
        </button>
        <button className="cc-btn" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
