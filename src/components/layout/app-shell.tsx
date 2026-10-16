"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  KeyRound,
  LogOut,
  Menu,
  Search,
  ShieldOff,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { LoadingScreen } from "@/components/loading-screen";
import {
  Avatar,
  buttonClasses,
  ErrorState,
  IconButton,
  iconButtonClasses,
  kbdClasses,
  noteClasses,
} from "@/components/ui";
import { findNav, home } from "@/config/navigation";
import { errorMessage } from "@/lib/api";
import { accessFor, useLogout, useMe, type Me } from "@/features/auth/session";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";

export const FOCUS_ASK_EVENT = "companymgmt:focus-ask";

// Popover menus in the top bar.
const popClasses =
  "absolute top-11 right-0 z-50 min-w-62.5 p-1.5 rounded-xl bg-raised border border-line-strong shadow-[0_18px_50px_#000c]";
const popHeadingClasses =
  "pt-2 px-2.5 pb-1.5 text-[11px] font-semibold tracking-[0.05em] uppercase text-faint";
const popNoteClasses = `${noteClasses} text-dim pt-1 px-2.5 pb-2`;
const popButtonClasses =
  "flex items-center gap-2.5 w-full py-2 px-2.5 rounded-lg text-left text-[13px] cursor-pointer hover:bg-[#222]";

/**
 * Signed-in workspace. Sends people who aren't signed in to the login page and people with a
 * temporary password to the change-password page; the API enforces the same on every request.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me, error, refetch } = useMe();

  useEffect(() => {
    if (me === null)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (me?.mustChangePassword)
      router.replace(`/change-password?next=${encodeURIComponent(pathname)}`);
  }, [me, pathname, router]);

  if (error && !me)
    return (
      <LoadingScreen>
        <Brand />
        <ErrorState
          message={errorMessage(error, "Can't reach the server.")}
          onRetry={() => void refetch()}
        />
      </LoadingScreen>
    );
  if (!me || me.mustChangePassword)
    return (
      <LoadingScreen status>
        <Brand />
        <span>Opening Command Center…</span>
      </LoadingScreen>
    );
  return <Workspace me={me}>{children}</Workspace>;
}

function Workspace({ me, children }: { me: Me; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const access = accessFor(me);
  const logout = useLogout();
  const navDialog = useRef<HTMLDialogElement>(null);
  const popovers = useRef<HTMLDivElement>(null);
  const [pop, setPop] = useState<"notes" | "me" | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const current = findNav(pathname) ?? home;

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (event.key === "Escape") setPop(null);
    }
    function pointerdown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !popovers.current?.contains(event.target)
      )
        setPop(null);
    }
    document.addEventListener("keydown", keydown);
    document.addEventListener("pointerdown", pointerdown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("pointerdown", pointerdown);
    };
  }, []);

  function askAi() {
    if (pathname === "/overview")
      window.dispatchEvent(new Event(FOCUS_ASK_EVENT));
    else router.push("/overview?ask=1");
  }

  function signOut() {
    setPop(null);
    logout.mutate(undefined, { onSettled: () => router.replace("/login") });
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-fg [&_:focus-visible]:outline-offset-2">
      <a
        className="fixed z-100 -top-[100px] left-5 bg-accent text-[#080808] px-4.5 py-3 rounded-[7px] focus:top-3"
        href="#main-content"
      >
        Skip to content
      </a>
      <aside
        className="w-62 flex-[0_0_248px] bg-sidebar border-r border-line max-tablet:hidden"
        aria-label="Sidebar"
      >
        <Sidebar pathname={pathname} canOpen={access.canOpen} />
      </aside>
      <dialog
        ref={navDialog}
        className="w-70 max-w-[calc(100%-40px)] h-dvh max-h-dvh m-0 p-0 border-0 border-r border-line-strong rounded-[14px] bg-sidebar text-fg shadow-[0_22px_80px_#0008] backdrop:bg-[#000a]"
        aria-label="Navigation"
        onClick={(event) => {
          if (event.target === event.currentTarget) navDialog.current?.close();
        }}
      >
        <Sidebar
          mobile
          pathname={pathname}
          canOpen={access.canOpen}
          onClose={() => navDialog.current?.close()}
        />
      </dialog>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center gap-2.5 h-14 px-5 border-b border-line shrink-0 max-tablet:px-3">
          <button
            className={`hidden max-tablet:grid ${iconButtonClasses}`}
            aria-label="Open navigation"
            onClick={() => navDialog.current?.showModal()}
          >
            <Menu size={19} />
          </button>
          <div className="flex items-center gap-2 min-w-0 text-[13px] text-dim">
            <span className="max-phone:hidden">Command Center</span>
            <ChevronRight size={14} className="max-phone:hidden" />
            <b className="text-fg font-semibold truncate">{current.title}</b>
          </div>
          <span className="flex-1 min-w-0" />
          <button
            className="flex items-center gap-2 h-8.5 w-55 px-2.5 border border-line-strong rounded-[9px] bg-panel cursor-pointer hover:border-line-hover hover:text-soft max-laptop:w-auto"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
          >
            <Search size={15} />
            <span className="max-laptop:hidden">Search</span>
            <kbd className={`${kbdClasses} max-laptop:hidden`}>⌘K</kbd>
          </button>
          <button
            className="flex items-center gap-[7px] h-8.5 px-3 rounded-[9px] bg-white text-black cursor-pointer hover:bg-[#e3e3e3]"
            onClick={askAi}
          >
            <Sparkles size={15} />
            <span className="max-phone:hidden">Ask AI</span>
          </button>
          <div className="flex items-center gap-1" ref={popovers}>
            <div className="relative">
              <IconButton
                label="Notifications"
                aria-expanded={pop === "notes"}
                onClick={() => setPop(pop === "notes" ? null : "notes")}
              >
                <Bell size={18} />
              </IconButton>
              {pop === "notes" && (
                <div
                  className={popClasses}
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className={popHeadingClasses}>Notifications</div>
                  <p className={popNoteClasses}>
                    You’re all caught up. Approvals and task reminders appear
                    here once those areas are connected.
                  </p>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className="flex items-center gap-2 h-9.5 pr-2 pl-1 rounded-full cursor-pointer hover:bg-hover"
                aria-label="Account"
                aria-expanded={pop === "me"}
                onClick={() => setPop(pop === "me" ? null : "me")}
              >
                <Avatar
                  name={me.name}
                  className="leading-[1.2] max-tablet:hidden"
                />
                <span className="text-left leading-[1.2] max-tablet:hidden">
                  <b className="block text-[12.5px] font-semibold">{me.name}</b>
                  <small className="block text-[11px] text-dim">
                    {access.primaryRole}
                  </small>
                </span>
                <ChevronDown size={14} />
              </button>
              {pop === "me" && (
                <div className={popClasses} role="menu" aria-label="Account">
                  <div className="flex items-center gap-2.5 py-2 px-2.5">
                    <Avatar name={me.name} />
                    <span className="min-w-0">
                      <b className="block text-[13px] font-semibold truncate">
                        {me.name}
                      </b>
                      <small className="block text-[11.5px] text-dim truncate">
                        {me.jobTitle} · {me.email}
                      </small>
                    </span>
                  </div>
                  <div className={popHeadingClasses}>Team roles</div>
                  <ul className="px-2.5 pb-2 text-[12.5px]">
                    {me.memberships.map((m) => (
                      <li
                        key={m.teamId}
                        className="flex justify-between gap-4 py-0.5"
                      >
                        <span>{m.teamName}</span>
                        <span className="text-dim">{m.roleLabel}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    className={popButtonClasses}
                    role="menuitem"
                    href={`/change-password?next=${encodeURIComponent(pathname)}`}
                    onClick={() => setPop(null)}
                  >
                    <KeyRound size={15} />
                    <span>Change password</span>
                  </Link>
                  <button
                    className={popButtonClasses}
                    role="menuitem"
                    onClick={signOut}
                  >
                    <LogOut size={15} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto pt-5.5 px-7 pb-10 focus:outline-none max-tablet:pt-4.5 max-tablet:px-4 max-tablet:pb-8"
          key={pathname}
        >
          <div className="max-w-310 mx-auto">
            {access.canOpen(current.slug) ? (
              children
            ) : (
              <NoAccess title={current.title} />
            )}
          </div>
        </main>
      </div>
      <CommandPalette
        canOpen={access.canOpen}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}

/** Shown instead of a section the user's roles don't include, e.g. from a direct link. */
function NoAccess({ title }: { title: string }) {
  return (
    <section
      className="grid justify-items-center gap-2.5 pt-17.5 px-5 pb-22.5 text-center"
      aria-label="No access"
    >
      <span className="grid place-items-center size-16 rounded-[18px] bg-raised border border-line-strong text-soft">
        <ShieldOff size={28} strokeWidth={1.5} />
      </span>
      <h1 className="mt-2 text-[22px] font-semibold">No access</h1>
      <p className="max-w-110 text-[13px] leading-[1.7] text-dim">
        Your role doesn’t include {title}. If you need it, ask your team manager
        or the Leadership Lead.
      </p>
      <Link
        className={`${buttonClasses()} mt-2 text-[12.5px] font-medium`}
        href="/overview"
      >
        Back to overview
      </Link>
    </section>
  );
}
