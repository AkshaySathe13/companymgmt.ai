"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserRound, UsersRound } from "lucide-react";
import { navigation } from "@/config/navigation";
import { peopleApi, teamsApi } from "@/features/teams/api";
import type { Person, Team } from "@/features/teams/types";

type Result = {
  key: string;
  title: string;
  kind: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [records, setRecords] = useState<{ teams: Team[]; people: Person[] }>({
    teams: [],
    people: [],
  });

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      setQuery("");
      setActive(0);
      const controller = new AbortController();
      Promise.all([
        teamsApi.list(controller.signal),
        peopleApi.list({}, controller.signal),
      ])
        .then(([teams, people]) => setRecords({ teams, people }))
        .catch(() => setRecords({ teams: [], people: [] }));
      return () => controller.abort();
    }
    if (!open && element.open) element.close();
  }, [open]);

  const q = query.trim().toLowerCase();
  const results: Result[] = [
    ...navigation
      .filter((nav) => nav.title.toLowerCase().includes(q))
      .map((nav) => ({
        key: nav.href,
        title: nav.title,
        kind: nav.status === "live" ? "Page" : "Coming soon",
        href: nav.href,
        icon: nav.icon,
      })),
    ...(q
      ? [
          ...records.teams
            .filter((team) => team.name.toLowerCase().includes(q))
            .map((team) => ({
              key: team.id,
              title: team.name,
              kind: "Team",
              href: `/teams?team=${team.id}`,
              icon: UsersRound,
            })),
          ...records.people
            .filter((person) =>
              `${person.name} ${person.role}`.toLowerCase().includes(q),
            )
            .map((person) => ({
              key: person.id,
              title: person.name,
              kind: person.role,
              href: `/teams?view=people&person=${person.id}`,
              icon: UserRound,
            })),
        ]
      : []),
  ].slice(0, 14);

  function go(result: Result | undefined) {
    if (!result) return;
    onClose();
    router.push(result.href);
  }

  return (
    <dialog
      ref={dialog}
      className="cc-pal"
      aria-label="Search"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="cc-pal-in">
        <Search size={17} />
        <input
          autoFocus
          value={query}
          placeholder="Search pages, teams and people…"
          aria-label="Search pages, teams and people"
          aria-controls="cc-pal-list"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => Math.min(index + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              go(results[active]);
            }
          }}
        />
        <kbd>Esc</kbd>
      </div>
      <div className="cc-pal-list" id="cc-pal-list" role="listbox">
        {results.length ? (
          results.map((result, index) => (
            <button
              key={result.key}
              role="option"
              aria-selected={index === active}
              className={index === active ? "on" : ""}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(result)}
            >
              <result.icon size={15} />
              <b>{result.title}</b>
              <small>{result.kind}</small>
            </button>
          ))
        ) : (
          <p className="cc-note">No results. Try another name.</p>
        )}
      </div>
      <div className="cc-pal-foot">
        <span>↑↓ to move</span>
        <span>Enter to open</span>
        <span>Esc to close</span>
      </div>
    </dialog>
  );
}
