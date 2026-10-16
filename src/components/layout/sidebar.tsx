"use client";
import Link from "next/link";
import { Layers3, X } from "lucide-react";
import { navGroups, findNav } from "@/config/navigation";
import { IconButton } from "@/components/ui";

export function Sidebar({
  pathname,
  canOpen,
  mobile = false,
  onClose,
}: {
  pathname: string;
  /** Whether the signed-in user's roles include a section. */
  canOpen: (slug: string) => boolean;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const active = findNav(pathname);
  // Only sections the user's roles allow; groups with none are left out.
  const groups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((nav) => canOpen(nav.slug)),
    }))
    .filter((group) => group.items.length);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pt-4.5 pr-4 pb-3 pl-4.5">
        <Link
          href="/overview"
          className="flex items-center gap-2.5"
          onClick={onClose}
        >
          <span className="grid place-items-center size-8 rounded-[9px] bg-white text-black">
            <Layers3 size={18} strokeWidth={1.9} />
          </span>
          <span>
            <b className="block text-[14px] font-bold tracking-[-0.01em]">
              CarrierOS
            </b>
            <small className="block text-[11.5px] text-dim">
              Command Center
            </small>
          </span>
        </Link>
        {mobile && (
          <IconButton label="Close navigation" onClick={onClose}>
            <X size={18} />
          </IconButton>
        )}
      </div>
      <nav
        className="flex-1 overflow-y-auto pt-1 px-2.5 pb-3"
        aria-label={mobile ? "Mobile navigation" : "Main navigation"}
      >
        {groups.map((group, index) => (
          <div key={group.label}>
            <p
              className={`${index ? "mt-4" : "mt-1"} mx-2.5 mb-1.5 text-[11px] font-semibold tracking-[0.04em] uppercase text-faint`}
            >
              {group.label}
            </p>
            {group.items.map((nav) => {
              const current = active?.href === nav.href;
              return (
                <Link
                  key={nav.href}
                  href={nav.href}
                  className={`flex items-center gap-2.5 h-8.5 px-2.5 rounded-lg text-[13.5px] ${current ? "bg-[#1c1c1c] text-white [&>svg]:text-white" : "text-subtle [&>svg]:text-[#8a8a8a] hover:bg-hover hover:text-white"}`}
                  aria-current={current ? "page" : undefined}
                  onClick={onClose}
                >
                  <nav.icon size={16} strokeWidth={1.8} />
                  <span>{nav.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-2 py-3 px-4 border-t border-line text-[11.5px] text-dim">
        <span className="size-[7px] rounded-full bg-ok" />
        Demo session · fictional data
      </div>
    </div>
  );
}
