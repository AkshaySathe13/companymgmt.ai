"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui";

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
      className="fixed inset-y-0 right-0 left-auto w-[min(520px,100%)] h-dvh max-h-dvh m-0 p-0 border-0 border-l border-line-strong rounded-[14px] bg-[#0b0b0b] text-fg shadow-[0_22px_80px_#0008] backdrop:bg-[#000a]"
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
      <div className="px-5.5 pt-5 pb-7.5">
        <div className="flex items-center justify-between mb-3.5 text-[12px] text-dim">
          <span>{context}</span>
          <IconButton label="Close" onClick={onClose} autoFocus>
            <X size={16} />
          </IconButton>
        </div>
        {children}
      </div>
    </dialog>
  );
}
