"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Side panel built on <dialog>, so focus stays inside and Escape closes it. */
export function Drawer({
  label,
  context,
  onClose,
  children,
}: {
  label: string;
  context: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="cc-drawer"
      aria-label={label}
      onClose={() => {
        // The close event arrives late; if the dialog was reopened since (React's dev
        // remount closes and reopens it), it is stale and must not close the drawer.
        if (!dialog.current?.open) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="cc-drawer-in">
        <div className="cc-dr-top">
          <span>{context}</span>
          <button
            className="cc-ib"
            aria-label="Close"
            onClick={onClose}
            autoFocus
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
