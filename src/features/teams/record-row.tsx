import type { ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton, listRowClasses } from "@/components/ui";

/** A member or team row in a drawer: opens the record, with an optional remove action. */
export function RecordRow({
  avatar,
  title,
  detail,
  onOpen,
  remove,
}: {
  avatar: ReactNode;
  title: ReactNode;
  detail: ReactNode;
  onOpen: () => void;
  remove?: { label: string; onRemove: () => void };
}) {
  return (
    <div className={listRowClasses.row}>
      {avatar}
      <button
        className={`${listRowClasses.action} ${listRowClasses.text}`}
        onClick={onOpen}
      >
        <b className={listRowClasses.title}>{title}</b>
        <small className={listRowClasses.detail}>{detail}</small>
      </button>
      {remove && (
        <IconButton
          label={remove.label}
          tip="Remove from team"
          onClick={remove.onRemove}
        >
          <X size={15} />
        </IconButton>
      )}
    </div>
  );
}
