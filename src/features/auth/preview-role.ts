"use client";
import { useSyncExternalStore } from "react";

// Demo-only: picks which seeded person the workspace previews as. Not authentication or authorization;
// the API does not check roles yet (see the API README).
export const previewRoles = {
  executive: {
    label: "Executive",
    personId: "aaaaaaaa-0000-4000-8000-000000000001",
    name: "Evan Ross",
    canManage: true,
  },
  manager: {
    label: "Team manager",
    personId: "aaaaaaaa-0000-4000-8000-000000000004",
    name: "Mira Sen",
    canManage: true,
  },
  developer: {
    label: "Developer",
    personId: "aaaaaaaa-0000-4000-8000-000000000005",
    name: "Nina Patel",
    canManage: false,
  },
} as const;

export type PreviewRoleKey = keyof typeof previewRoles;
const KEY = "companymgmt.preview-role";
const EVENT = "companymgmt-preview-role-change";

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function snapshot(): PreviewRoleKey {
  try {
    const value = sessionStorage.getItem(KEY);
    return value && value in previewRoles
      ? (value as PreviewRoleKey)
      : "executive";
  } catch {
    return "executive";
  }
}

export function usePreviewRole() {
  const key = useSyncExternalStore(subscribe, snapshot, () => "executive");
  return { key, ...previewRoles[key as PreviewRoleKey] };
}

export function setPreviewRole(key: PreviewRoleKey) {
  try {
    sessionStorage.setItem(KEY, key);
  } catch {
    // Storage blocked: the switch lasts until reload.
  }
  window.dispatchEvent(new Event(EVENT));
}
