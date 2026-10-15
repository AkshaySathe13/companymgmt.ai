"use client";
import Link from "next/link";
import { Layers3, X } from "lucide-react";
import { navGroups, findNav } from "@/config/navigation";

export function Sidebar({
  pathname,
  mobile = false,
  onClose,
}: {
  pathname: string;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const active = findNav(pathname);
  return (
    <div className="cc-side-in">
      <div className="cc-brand">
        <Link href="/overview" className="cc-brand-link" onClick={onClose}>
          <span className="cc-brand-mark">
            <Layers3 size={18} strokeWidth={1.9} />
          </span>
          <span>
            <b>CarrierOS</b>
            <small>Command Center</small>
          </span>
        </Link>
        {mobile && (
          <button
            className="cc-ib"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        )}
      </div>
      <nav
        className="cc-nav"
        aria-label={mobile ? "Mobile navigation" : "Main navigation"}
      >
        {navGroups.map((group) => (
          <div key={group.label} className="cc-nav-group">
            <p className="cc-nav-g">{group.label}</p>
            {group.items.map((nav) => {
              const current = active?.href === nav.href;
              return (
                <Link
                  key={nav.href}
                  href={nav.href}
                  className={`cc-nav-a ${current ? "on" : ""}`}
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
      <div className="cc-side-foot">
        <span className="cc-dot" />
        Demo session · fictional data
      </div>
    </div>
  );
}
