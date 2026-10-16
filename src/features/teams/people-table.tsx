import {
  Avatar,
  DataTable,
  nameClasses,
  tableClasses,
  Tag,
  TagList,
} from "@/components/ui";
import { workModeLabel, type Person, type Team } from "./types";

const columns = [
  { label: "Name" },
  { label: "Role" },
  { label: "Teams", className: tableClasses.hideOnPhone },
  { label: "Location", className: tableClasses.hideOnPhone },
  { label: "Works", className: tableClasses.hideOnPhone },
];

/** The People tab's table, optionally grouped under a heading row per team. */
export function PeopleTable({
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
      className={tableClasses.clickableRow}
      tabIndex={0}
      onClick={() => onOpen(person.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(person.id);
      }}
    >
      <td className={tableClasses.cell}>
        <span className={nameClasses.wrap}>
          <Avatar name={person.name} />
          <b className={nameClasses.name}>{person.name}</b>
          {person.id === myPersonId && <Tag>Me</Tag>}
        </span>
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
        {person.restricted
          ? "Visible to their team"
          : `${person.location} · ${person.timezone}`}
      </td>
      <td className={`${tableClasses.cell} ${tableClasses.hideOnPhone}`}>
        {person.workMode ? workModeLabel[person.workMode] : "—"}
      </td>
    </tr>
  );
  return (
    <DataTable columns={columns}>
      {grouped
        ? teams.map((team) => {
            const members = people.filter((p) =>
              p.teams.some((t) => t.id === team.id),
            );
            return members.length
              ? [
                  <tr key={`g-${team.id}`}>
                    <td
                      colSpan={columns.length}
                      className={tableClasses.groupCell}
                    >
                      {team.name}
                      <span className="ml-1.5 text-faint tracking-normal">
                        {members.length}
                      </span>
                    </td>
                  </tr>,
                  ...members.map((person) => row(person, team.id)),
                ]
              : null;
          })
        : people.map((person) => row(person))}
    </DataTable>
  );
}
