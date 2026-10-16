import { ArrowRight } from "lucide-react";
import {
  Avatar,
  Button,
  FormActions,
  listRowClasses,
  nameClasses,
  Note,
  sectionHeadingClasses,
  TeamAvatar,
} from "@/components/ui";
import { teamKindLabel, type Team } from "./types";

/** A person in the preview; the whole row opens their profile. */
function PersonButton({
  person,
  size,
  inline = false,
  onOpen,
}: {
  person: { name: string; jobTitle: string };
  size?: "xs";
  inline?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      className={`${listRowClasses.row} ${listRowClasses.action}`}
      onClick={onOpen}
    >
      <Avatar name={person.name} size={size} />
      <span
        className={inline ? listRowClasses.inlineText : listRowClasses.text}
      >
        <b className={listRowClasses.title}>{person.name}</b>
        <small className={listRowClasses.detail}>{person.jobTitle}</small>
      </span>
    </button>
  );
}

const heading = `mt-4 mb-1 ${sectionHeadingClasses}`;

/** Side panel on the Teams tab showing the hovered or selected team. */
export function TeamPreview({
  team,
  isMyTeam,
  onOpenPerson,
  onViewPeople,
  onOpenTeam,
}: {
  team: Team;
  isMyTeam: boolean;
  onOpenPerson: (personId: string) => void;
  onViewPeople: () => void;
  onOpenTeam: () => void;
}) {
  return (
    <aside
      className="sticky top-0 p-4 rounded-[14px] bg-panel border border-line max-laptop:hidden"
      aria-live="polite"
      aria-label="Team details"
    >
      <div className={nameClasses.wrap}>
        <TeamAvatar icon={team.icon} size="lg" />
        <div>
          <h2 className="text-[16px]">{team.name}</h2>
          <p className="mt-[3px] text-[12px] text-dim">
            {teamKindLabel[team.kind]} · {team.memberCount} members
            {isMyTeam && " · My team"}
            {team.isCore && " · Core team"}
          </p>
        </div>
      </div>
      <p className="mt-2.5 text-[13px] leading-[1.6] text-soft">
        {team.purpose}
      </p>
      <h4 className={heading}>Lead</h4>
      {team.lead ? (
        <PersonButton
          person={team.lead}
          onOpen={() => onOpenPerson(team.lead!.id)}
        />
      ) : (
        <Note>No lead yet.</Note>
      )}
      <h4 className={heading}>Members</h4>
      {team.members
        .filter((member) => member.id !== team.leadId)
        .map((member) => (
          <PersonButton
            key={member.id}
            person={member}
            size="xs"
            inline
            onOpen={() => onOpenPerson(member.id)}
          />
        ))}
      <FormActions>
        <Button onClick={onViewPeople}>View people</Button>
        <Button onClick={onOpenTeam}>
          Open team
          <ArrowRight size={13} />
        </Button>
      </FormActions>
    </aside>
  );
}
