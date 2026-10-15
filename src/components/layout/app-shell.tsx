"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Avatar } from "@/components/ui";
import { findNav, home } from "@/config/navigation";
import { endDemoSession, useDemoSession } from "@/features/auth/demo-session";
import {
  previewRoles,
  setPreviewRole,
  usePreviewRole,
  type PreviewRoleKey,
} from "@/features/auth/preview-role";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";

export const FOCUS_ASK_EVENT = "companymgmt:focus-ask";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useDemoSession();
  const role = usePreviewRole();
  const signingOut = useRef(false);
  const navDialog = useRef<HTMLDialogElement>(null);
  const popovers = useRef<HTMLDivElement>(null);
  const [pop, setPop] = useState<"notes" | "me" | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const current = findNav(pathname) ?? home;

  useEffect(() => {
    if (session === false && !signingOut.current)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [session, pathname, router]);

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

  function switchRole(key: PreviewRoleKey) {
    setPreviewRole(key);
    setPop(null);
  }

  function signOut() {
    signingOut.current = true;
    endDemoSession();
    router.replace("/login");
  }

  if (session !== true)
    return (
      <div className="session-loading" role="status">
        <Brand />
        <span>Opening Command Center…</span>
      </div>
    );

  return (
    <div className="cc-app">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="cc-side" aria-label="Sidebar">
        <Sidebar pathname={pathname} />
      </aside>
      <dialog
        ref={navDialog}
        className="cc-nav-dialog"
        aria-label="Navigation"
        onClick={(event) => {
          if (event.target === event.currentTarget) navDialog.current?.close();
        }}
      >
        <Sidebar
          mobile
          pathname={pathname}
          onClose={() => navDialog.current?.close()}
        />
      </dialog>
      <div className="cc-main">
        <header className="cc-top">
          <button
            className="cc-ib cc-menu-btn"
            aria-label="Open navigation"
            onClick={() => navDialog.current?.showModal()}
          >
            <Menu size={19} />
          </button>
          <div className="cc-crumb">
            <span>Command Center</span>
            <ChevronRight size={14} />
            <b>{current.title}</b>
          </div>
          <span className="cc-grow" />
          <button
            className="cc-searchbtn"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
          >
            <Search size={15} />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
          <button className="cc-askbtn" onClick={askAi}>
            <Sparkles size={15} />
            <span>Ask AI</span>
          </button>
          <div className="cc-pops" ref={popovers}>
            <div className="cc-rel">
              <button
                className="cc-ib"
                aria-label="Notifications"
                aria-expanded={pop === "notes"}
                onClick={() => setPop(pop === "notes" ? null : "notes")}
              >
                <Bell size={18} />
              </button>
              {pop === "notes" && (
                <div
                  className="cc-pop"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="cc-pop-h">Notifications</div>
                  <p className="cc-note cc-pad">
                    You’re all caught up. Approvals and task reminders appear
                    here once those areas are connected.
                  </p>
                </div>
              )}
            </div>
            <div className="cc-rel">
              <button
                className="cc-me"
                aria-label="Account and preview role"
                aria-expanded={pop === "me"}
                onClick={() => setPop(pop === "me" ? null : "me")}
              >
                <Avatar name={role.name} />
                <span>
                  <b>{role.name}</b>
                  <small>{role.label}</small>
                </span>
                <ChevronDown size={14} />
              </button>
              {pop === "me" && (
                <div className="cc-pop" role="menu" aria-label="Account">
                  <div className="cc-pop-h">Preview as</div>
                  {(Object.keys(previewRoles) as PreviewRoleKey[]).map(
                    (key) => (
                      <button
                        key={key}
                        role="menuitemradio"
                        aria-checked={key === role.key}
                        onClick={() => switchRole(key)}
                      >
                        <Avatar name={previewRoles[key].name} />
                        <span>
                          {previewRoles[key].name}
                          <small>{previewRoles[key].label}</small>
                        </span>
                        {key === role.key && (
                          <Check size={14} className="cc-ck" />
                        )}
                      </button>
                    ),
                  )}
                  <p className="cc-note cc-pad">
                    Demo preview. Real sign-in and roles come from the shared
                    CarrierOS login later.
                  </p>
                  <button role="menuitem" onClick={signOut}>
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
          className="cc-content"
          key={pathname}
        >
          <div className="cc-wrap">{children}</div>
        </main>
      </div>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}
