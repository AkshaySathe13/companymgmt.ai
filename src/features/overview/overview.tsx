"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Bookmark, Send, Sparkles, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  Avatar,
  AvatarStack,
  ErrorState,
  Skeleton,
  TeamAvatar,
} from "@/components/ui";
import { FOCUS_ASK_EVENT } from "@/components/layout/app-shell";
import { usePreviewRole } from "@/features/auth/preview-role";
import { aiApi, onDataChanged, teamsApi } from "@/features/teams/api";
import type { AiAnswer, AiStatus, Team } from "@/features/teams/types";
import { AiViewCard } from "./ai-view";

const PRESETS = [
  "Who leads each team?",
  "Who works in more than one team?",
  "Who works remotely?",
  "Who is in US AI engineers?",
  "List our external investors",
];

type Turn = {
  id: number;
  question: string;
  answer?: AiAnswer;
  error?: string;
};
type SavedView = { name: string; question: string };

const VIEWS_EVENT = "companymgmt:saved-views";
const subscribeViews = (listener: () => void) => {
  window.addEventListener(VIEWS_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(VIEWS_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
};

/** Saved views are a per-browser convenience; each one re-asks its question so it always shows current data. */
function useSavedViews(owner: string) {
  const key = `companymgmt.saved-views.${owner}`;
  const raw = useSyncExternalStore(
    subscribeViews,
    () => {
      try {
        return localStorage.getItem(key) ?? "[]";
      } catch {
        return "[]";
      }
    },
    () => "[]",
  );
  const views = useMemo<SavedView[]>(() => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [raw]);
  const save = (view: SavedView) => {
    const next = [
      view,
      ...views.filter((v) => v.question !== view.question),
    ].slice(0, 8);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(VIEWS_EVENT));
    } catch {
      // Storage blocked: saving isn't available in this browser.
    }
  };
  return [views, save] as const;
}

export function Overview() {
  const role = usePreviewRole();
  const params = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const turnId = useRef(0);
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState<Turn[]>([]);
  const [pending, setPending] = useState<AbortController | null>(null);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [teamsError, setTeamsError] = useState("");
  const [savedViews, saveView] = useSavedViews(role.personId);
  const firstName = role.name.split(" ")[0];

  const loadTeams = useCallback(() => {
    teamsApi
      .list()
      .then((next) => {
        setTeams(next);
        setTeamsError("");
      })
      .catch((error) =>
        setTeamsError(
          error instanceof ApiError ? error.message : "Couldn't load teams.",
        ),
      );
  }, []);

  useEffect(() => {
    loadTeams();
    aiApi
      .status()
      .then(setStatus)
      .catch(() => setStatus(null));
    return onDataChanged(loadTeams);
  }, [loadTeams]);

  useEffect(() => {
    const focus = () => input.current?.focus();
    if (params.get("ask")) focus();
    window.addEventListener(FOCUS_ASK_EVENT, focus);
    return () => window.removeEventListener(FOCUS_ASK_EVENT, focus);
  }, [params]);

  async function ask(text: string) {
    const q = text.trim();
    if (q.length < 2 || pending) return;
    const id = ++turnId.current;
    // Send the last three answered turns so follow-up questions keep their context.
    const history = thread
      .filter((turn) => turn.answer)
      .slice(-3)
      .flatMap((turn) => [
        { role: "user" as const, content: turn.question },
        { role: "assistant" as const, content: turn.answer!.answer },
      ]);
    const controller = new AbortController();
    setPending(controller);
    setQuestion("");
    setThread((turns) => [...turns, { id, question: q }]);
    try {
      const answer = await aiApi.ask(q, history, controller.signal);
      setThread((turns) =>
        turns.map((t) => (t.id === id ? { ...t, answer } : t)),
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setThread((turns) => turns.filter((t) => t.id !== id));
      } else {
        const message =
          error instanceof ApiError
            ? error.message
            : "The AI couldn't answer that.";
        setThread((turns) =>
          turns.map((t) => (t.id === id ? { ...t, error: message } : t)),
        );
      }
    } finally {
      setPending(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  const myTeams = teams?.filter((team) =>
    team.members.some((member) => member.id === role.personId),
  );
  const hour = new Date().getHours();

  return (
    <>
      <div className="cc-hello">
        <h1>
          Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"},{" "}
          {firstName}
        </h1>
        <span>{role.label} view</span>
      </div>

      <form className="cc-ask" onSubmit={submit}>
        <Sparkles size={18} className="cc-spark" aria-hidden="true" />
        <label className="sr-only" htmlFor="ask-input">
          Ask about your teams and people
        </label>
        <input
          id="ask-input"
          ref={input}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask who leads a team, who works where, or who is in which team…"
          autoComplete="off"
          maxLength={2000}
        />
        <button
          className="cc-btn cc-btn-pri"
          type="submit"
          disabled={!!pending || question.trim().length < 2}
        >
          <Send size={14} />
          Ask
        </button>
      </form>
      {status && !status.configured && (
        <p className="cc-note cc-warn" role="status">
          AI answers are off. Add <code>ANTHROPIC_API_KEY</code> to{" "}
          <code>api.command.carrieros.ai/.env</code> and restart the API.
          Everything else works without it.
        </p>
      )}
      <div className="cc-chips">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            className="cc-chip"
            onClick={() => ask(preset)}
            disabled={!!pending}
          >
            {preset}
          </button>
        ))}
        {savedViews.map((view) => (
          <button
            key={view.question}
            className="cc-chip"
            onClick={() => ask(view.question)}
            disabled={!!pending}
          >
            <Bookmark size={13} />
            {view.name}
          </button>
        ))}
      </div>

      {thread.length > 0 && (
        <div className="cc-thread">
          <div className="cc-thread-head">
            <span>Conversation</span>
            <button
              className="cc-link"
              onClick={() => setThread([])}
              disabled={!!pending}
            >
              Clear
            </button>
          </div>
          {thread.map((turn) => (
            <section
              key={turn.id}
              className="cc-ans"
              aria-live="polite"
              aria-busy={!turn.answer && !turn.error}
            >
              <div className="cc-ans-head">
                <h2>{turn.question}</h2>
                {turn.answer && (
                  <span className="cc-meta">
                    Answered by Claude from your teams and people records
                  </span>
                )}
                <span className="cc-acts">
                  {!turn.answer && !turn.error && (
                    <button className="cc-btn" onClick={() => pending?.abort()}>
                      <X size={14} />
                      Cancel
                    </button>
                  )}
                  {turn.answer && (
                    <button
                      className="cc-btn"
                      onClick={() =>
                        saveView({
                          name: turn.question.slice(0, 40),
                          question: turn.question,
                        })
                      }
                      disabled={savedViews.some(
                        (v) => v.question === turn.question,
                      )}
                    >
                      <Bookmark size={14} />
                      {savedViews.some((v) => v.question === turn.question)
                        ? "Saved"
                        : "Save view"}
                    </button>
                  )}
                </span>
              </div>
              {turn.error ? (
                <p className="cc-note cc-bad" role="alert">
                  {turn.error}
                </p>
              ) : !turn.answer ? (
                <Skeleton rows={3} />
              ) : (
                <>
                  <p className="cc-ai-text">{turn.answer.answer}</p>
                  {turn.answer.views.length > 0 && (
                    <div className="cc-wgrid">
                      {turn.answer.views.map((view, index) => (
                        <AiViewCard key={index} view={view} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          ))}
        </div>
      )}

      <div className="cc-grid2">
        <section className="cc-card">
          <h3>
            Teams at a glance
            <Link className="cc-link cc-x" href="/teams">
              Open teams
            </Link>
          </h3>
          {teamsError ? (
            <ErrorState message={teamsError} onRetry={loadTeams} />
          ) : !teams ? (
            <Skeleton />
          ) : (
            teams.map((team) => (
              <Link
                key={team.id}
                className="cc-row"
                href={`/teams?team=${team.id}`}
              >
                <TeamAvatar icon={team.icon} />
                <span className="cc-grow">
                  <b>{team.name}</b>
                  <small>Led by {team.lead?.name ?? "nobody yet"}</small>
                </span>
                <AvatarStack names={team.members.map((m) => m.name)} />
                <span className="cc-dim">{team.memberCount}</span>
              </Link>
            ))
          )}
        </section>
        <section className="cc-card">
          <h3>My teams</h3>
          {!teams ? (
            teamsError ? null : (
              <Skeleton rows={2} />
            )
          ) : myTeams?.length ? (
            myTeams.map((team) => (
              <div key={team.id} className="cc-myteam">
                <Link className="cc-row" href={`/teams?team=${team.id}`}>
                  <TeamAvatar icon={team.icon} />
                  <span className="cc-grow">
                    <b>{team.name}</b>
                    <small>{team.purpose}</small>
                  </span>
                </Link>
                <div className="cc-mates">
                  {team.members
                    .filter((member) => member.id !== role.personId)
                    .slice(0, 6)
                    .map((member) => (
                      <Link
                        key={member.id}
                        href={`/teams?view=people&person=${member.id}`}
                        title={member.role}
                      >
                        <Avatar name={member.name} size="xs" />
                        {member.name.split(" ")[0]}
                      </Link>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <p className="cc-note">{role.name} isn’t in a team yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
