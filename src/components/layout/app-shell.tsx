"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Command,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
  Check,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { aiAgent, navigation } from "@/config/navigation";
import { endDemoSession, useDemoSession } from "@/features/auth/demo-session";
import { Sidebar } from "./sidebar";
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useDemoSession();
  const signingOut = useRef(false);
  const [collapsed, setCollapsed] = useState(false);
  const [systemsOpen, setSystemsOpen] = useState(true);
  const [query, setQuery] = useState("");
  const mobileDialog = useRef<HTMLDialogElement>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const helpDialog = useRef<HTMLDialogElement>(null);
  const current = navigation.find((item) => item.href === pathname) ?? aiAgent;
  const searchResults = navigation.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => {
    if (session === false && !signingOut.current)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [session, pathname, router]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (searchDialog.current?.open) searchDialog.current.close();
        else searchDialog.current?.showModal();
      }
    }
    function dismiss(event: MouseEvent | KeyboardEvent) {
      document
        .querySelectorAll<HTMLDetailsElement>(".topbar-popover[open]")
        .forEach((element) => {
          if (event instanceof KeyboardEvent && event.key === "Escape") {
            element.open = false;
            element.querySelector<HTMLElement>("summary")?.focus();
          } else if (
            event instanceof MouseEvent &&
            event.target instanceof Node &&
            !element.contains(event.target)
          )
            element.open = false;
        });
    }
    document.addEventListener("keydown", shortcut);
    document.addEventListener("keydown", dismiss);
    document.addEventListener("click", dismiss);
    return () => {
      document.removeEventListener("keydown", shortcut);
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("click", dismiss);
    };
  }, []);
  function signOut() {
    signingOut.current = true;
    endDemoSession();
    router.replace("/login");
  }
  function closeMobile() {
    mobileDialog.current?.close();
  }
  if (session !== true)
    return (
      <div className="session-loading" role="status">
        <Brand />
        <span>Opening workspace…</span>
      </div>
    );
  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="desktop-sidebar">
        <Sidebar
          collapsed={collapsed}
          systemsOpen={systemsOpen}
          pathname={pathname}
          closeMobile={closeMobile}
          onToggleSystems={() => setSystemsOpen(!systemsOpen)}
          onHelp={() => helpDialog.current?.showModal()}
        />
      </aside>
      <dialog
        ref={mobileDialog}
        className="mobile-drawer"
        aria-label="Navigation"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMobile();
        }}
      >
        <Sidebar
          mobile
          collapsed={collapsed}
          systemsOpen={systemsOpen}
          pathname={pathname}
          closeMobile={closeMobile}
          onToggleSystems={() => setSystemsOpen(!systemsOpen)}
          onHelp={() => {
            closeMobile();
            helpDialog.current?.showModal();
          }}
        />
      </dialog>
      <div className="workspace-main">
        <header className="topbar">
          <div className="topbar-location">
            <button
              className="icon-button desktop-toggle"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )}
            </button>
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => mobileDialog.current?.showModal()}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <span className="breadcrumb-current">{current.title}</span>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="search-trigger"
              onClick={() => searchDialog.current?.showModal()}
              aria-label="Search navigation"
            >
              <Search size={17} />
              <span>Search workspace</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="topbar-divider" />
            <details className="topbar-popover">
              <summary className="icon-button" aria-label="Notifications">
                <Bell size={19} />
              </summary>
              <div className="popover-panel notifications-panel">
                <strong>Notifications</strong>
                <div className="notification-empty">
                  <Bell size={23} />
                  <p>All caught up</p>
                  <span>No notifications in this preview.</span>
                </div>
              </div>
            </details>
            <details className="topbar-popover account-popover">
              <summary className="account-trigger" aria-label="Account menu">
                <span className="avatar">DW</span>
                <ChevronDown size={14} />
              </summary>
              <div className="popover-panel account-panel">
                <div className="account-details">
                  <strong>Demo workspace</strong>
                  <span>demo@companymgmt.ai</span>
                  <span className="account-demo">Preview session</span>
                </div>
                <button onClick={signOut}>
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </details>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="page-content"
          key={pathname}
        >
          {children}
        </main>
        <footer className="workspace-footer">
          <span>
            companymgmt.ai <span className="footer-separator">/</span> Company
            workspace
          </span>
          <span>
            <span className="status-dot" />
            Demo session
          </span>
        </footer>
      </div>
      <dialog
        ref={searchDialog}
        className="command-dialog"
        aria-labelledby="search-heading"
        onClick={(event) => {
          if (event.target === event.currentTarget)
            searchDialog.current?.close();
        }}
      >
        <div className="command-input">
          <Search size={20} />
          <label
            id="search-heading"
            className="sr-only"
            htmlFor="navigation-search"
          >
            Search navigation
          </label>
          <input
            id="navigation-search"
            placeholder="Find a page or system…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          <button
            className="icon-button"
            onClick={() => searchDialog.current?.close()}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>
        <div className="command-results">
          {searchResults.length ? (
            searchResults.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  searchDialog.current?.close();
                  setQuery("");
                }}
              >
                <item.icon size={18} />
                <span>{item.title}</span>
                {item.href === pathname && <Check size={16} />}
              </Link>
            ))
          ) : (
            <p className="command-empty">
              No matching pages. Try another name.
            </p>
          )}
        </div>
        <div className="command-footer">
          <Command size={13} />
          <span>Navigate your workspace</span>
          <span>Esc to close</span>
        </div>
      </dialog>
      <dialog
        ref={helpDialog}
        className="help-dialog"
        aria-labelledby="guide-heading"
      >
        <div className="help-title">
          <CircleHelp size={21} />
          <h2 id="guide-heading">Workspace guide</h2>
          <button
            className="icon-button"
            onClick={() => helpDialog.current?.close()}
            aria-label="Close guide"
          >
            <X size={18} />
          </button>
        </div>
        <p>
          Choose AI Agent or one of the ten systems in the sidebar. Each page is
          ready for future work and currently shows “Coming soon.”
        </p>
        <p>
          Use workspace search or <kbd>Ctrl / ⌘ K</kbd> to jump to a
          destination. Collapse the sidebar for more room, or open the
          navigation drawer on mobile.
        </p>
        <div className="guide-note">
          This is a layout preview. Demo sign-in does not provide real
          authentication or protect API data.
        </div>
      </dialog>
    </div>
  );
}
