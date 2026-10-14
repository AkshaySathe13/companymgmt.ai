"use client";
import { useSyncExternalStore } from "react";
const SESSION_KEY = "companymgmt.demo-session";
const EVENT = "companymgmt-session-change";
function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
function snapshot() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "active";
  } catch {
    return false;
  }
}
export function useDemoSession() {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}
export function beginDemoSession() {
  sessionStorage.setItem(SESSION_KEY, "active");
  window.dispatchEvent(new Event(EVENT));
}
export function endDemoSession() {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(EVENT));
}
// This is a local UI preview state, never an authentication or authorization boundary.
