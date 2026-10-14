"use client";
import Link from "next/link";
import {
  X,
  Building2,
  ChevronDown,
  CircleHelp,
  ArrowUpRight,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { aiAgent, systems } from "@/config/navigation";
export function Sidebar({
  mobile = false,
  collapsed,
  systemsOpen,
  pathname,
  closeMobile,
  onToggleSystems,
  onHelp,
}: {
  mobile?: boolean;
  collapsed: boolean;
  systemsOpen: boolean;
  pathname: string;
  closeMobile: () => void;
  onToggleSystems: () => void;
  onHelp: () => void;
}) {
  const mini = collapsed && !mobile;
  return (
    <div className="sidebar-content">
      <div className="sidebar-brand">
        <Link
          href="/ai-agent"
          aria-label="Company management home"
          onClick={closeMobile}
        >
          <Brand compact={mini} />
        </Link>
        {mobile && (
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={closeMobile}
          >
            <X size={20} />
          </button>
        )}
      </div>
      <div className="workspace-chip">
        <span className="workspace-avatar">
          <Building2 size={18} />
        </span>
        {!mini && (
          <div>
            <strong>Company workspace</strong>
            <span>Demo environment</span>
          </div>
        )}
      </div>
      <nav
        aria-label={mobile ? "Mobile navigation" : "Main navigation"}
        className="sidebar-nav"
      >
        {!mini && <p className="nav-group-label">Workspace</p>}
        <Link
          href={aiAgent.href}
          aria-label="AI Agent"
          onClick={closeMobile}
          className={`nav-item ${pathname === aiAgent.href ? "active" : ""}`}
          aria-current={pathname === aiAgent.href ? "page" : undefined}
          title={mini ? aiAgent.title : undefined}
        >
          <aiAgent.icon size={19} />
          {!mini && <span>{aiAgent.title}</span>}
          {!mini && <span className="nav-ai-badge">AI</span>}
        </Link>
        {!mini && (
          <button
            className="systems-toggle"
            onClick={onToggleSystems}
            aria-expanded={systemsOpen}
          >
            <span>
              Systems <span className="nav-count">10</span>
            </span>
            <ChevronDown
              size={14}
              className={systemsOpen ? "" : "rotate-closed"}
            />
          </button>
        )}
        {(mini || systemsOpen) && (
          <div className="system-links">
            {systems.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                onClick={closeMobile}
                className={`nav-item ${pathname === item.href ? "active" : ""}`}
                aria-current={pathname === item.href ? "page" : undefined}
                title={mini ? item.title : undefined}
                aria-label={mini ? item.title : undefined}
              >
                <item.icon size={18} />
                {!mini && <span>{item.title}</span>}
              </Link>
            ))}
          </div>
        )}
      </nav>
      <div className="sidebar-bottom">
        <button
          className="sidebar-help"
          onClick={onHelp}
          title={mini ? "Workspace guide" : undefined}
        >
          <CircleHelp size={18} />
          {!mini && (
            <>
              <span>Workspace guide</span>
              <ArrowUpRight size={15} />
            </>
          )}
        </button>
        {!mini && (
          <div className="sidebar-preview">
            <span className="status-dot" />
            Layout preview<span>v0.1</span>
          </div>
        )}
      </div>
    </div>
  );
}
