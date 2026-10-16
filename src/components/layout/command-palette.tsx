"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserRound, UsersRound } from "lucide-react";
import { navigation } from "@/config/navigation";
import { kbdClasses, noteClasses } from "@/components/ui";
import { usePeople, useTeams } from "@/features/teams/queries";

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
  canOpen,
}: {
  open: boolean;
  onClose: () => void;
  /** Whether the signed-in user's roles include a section. */
  canOpen: (slug: string) => boolean;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Loaded when the palette first opens, then shared with the rest of the app's cache.
  const records = {
    teams: useTeams(open && canOpen("teams")).data ?? [],
    people: usePeople({}, open && canOpen("teams")).data ?? [],
  };

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      setQuery("");
      setActive(0);
      return;
    }
    if (!open && element.open) element.close();
  }, [open]);

  const q = query.trim().toLowerCase();
  const results: Result[] = [
    ...navigation
      .filter((nav) => canOpen(nav.slug) && nav.title.toLowerCase().includes(q))
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
              `${person.name} ${person.jobTitle}`.toLowerCase().includes(q),
            )
            .map((person) => ({
              key: person.id,
              title: person.name,
              kind: person.jobTitle,
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
      className="w-[min(560px,calc(100%-32px))] mt-[12vh] mx-auto mb-auto p-0 border border-line-strong rounded-[14px] bg-[#111] text-fg shadow-[0_30px_80px_#000c] backdrop:bg-[#000a]"
      aria-label="Search"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex items-center gap-2.5 py-3 px-3.5 border-b border-line-strong text-dim">
        <Search size={17} />
        <input
          className="flex-1 bg-transparent text-[15px] text-fg outline-none focus-visible:outline-none"
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
        <kbd className={kbdClasses}>Esc</kbd>
      </div>
      <div
        className="max-h-[min(420px,55vh)] overflow-y-auto p-1.5"
        id="cc-pal-list"
        role="listbox"
      >
        {results.length ? (
          results.map((result, index) => (
            <button
              key={result.key}
              role="option"
              aria-selected={index === active}
              className={`flex items-center gap-2.5 w-full py-[9px] px-2.5 rounded-[9px] text-fg text-left cursor-pointer${index === active ? " bg-[#1d1d1d]" : ""}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(result)}
            >
              <result.icon size={15} />
              <b className="font-medium text-[13.5px]">{result.title}</b>
              <small className="ml-auto text-[11.5px] text-faint">
                {result.kind}
              </small>
            </button>
          ))
        ) : (
          <p className={`${noteClasses} text-dim p-2.5`}>
            No results. Try another name.
          </p>
        )}
      </div>
      <div className="flex gap-3 py-2 px-3.5 border-t border-line-strong text-[11.5px] text-faint">
        <span>↑↓ to move</span>
        <span>Enter to open</span>
        <span>Esc to close</span>
      </div>
    </dialog>
  );
}
