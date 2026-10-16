"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Bookmark, Send, Sparkles, X } from "lucide-react";
import { errorMessage, isAbortError } from "@/lib/api";
import {
  Avatar,
  AvatarStack,
  Button,
  Card,
  ErrorState,
  listRowClasses,
  Note,
  noteClasses,
  Skeleton,
  TeamAvatar,
} from "@/components/ui";
import { FOCUS_ASK_EVENT } from "@/components/layout/app-shell";
import { useAccess } from "@/features/auth/session";
import { useAiStatus, useAskAi, useTeams } from "@/features/teams/queries";
import type { AiAnswer } from "@/features/teams/types";
import { AiViewCard } from "./ai-view";

const PRESETS = [
  "Who leads each team?",
  "Who works in more than one team?",
  "Who works remotely?",
  "Who is in US AI engineers?",
  "List our external investors",
];

const chipClasses =
  "inline-flex items-center gap-1.5 h-7 px-[11px] border border-line-strong rounded-full cursor-pointer enabled:hover:border-line-hover enabled:hover:bg-hover enabled:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed";

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
  const { me, primaryRole } = useAccess();
  const params = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const turnId = useRef(0);
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState<Turn[]>([]);
  const [pending, setPending] = useState<AbortController | null>(null);
  const { data: status } = useAiStatus();
  const teamsQuery = useTeams();
  const teams = teamsQuery.data;
  const teamsError =
    !teams && teamsQuery.error
      ? errorMessage(teamsQuery.error, "Couldn't load teams.")
      : "";
  const askAi = useAskAi();
  const [savedViews, saveView] = useSavedViews(me.id);
  const firstName = me.name.split(" ")[0];

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
      const answer = await askAi.mutateAsync({
        question: q,
        history,
        signal: controller.signal,
      });
      setThread((turns) =>
        turns.map((t) => (t.id === id ? { ...t, answer } : t)),
      );
    } catch (error) {
      if (isAbortError(error)) {
        setThread((turns) => turns.filter((t) => t.id !== id));
      } else {
        const message = errorMessage(error, "The AI couldn't answer that.");
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
    team.members.some((member) => member.id === me.id),
  );
  const hour = new Date().getHours();

  return (
    <>
      <div className="flex items-baseline gap-3 flex-wrap mb-3">
        <h1 className="text-[22px] font-[650] tracking-[-0.02em]">
          Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"},{" "}
          {firstName}
        </h1>
        <span className="text-[13px] text-dim">{primaryRole} view</span>
      </div>

      <form
        className="flex items-center gap-2.5 py-2 pr-2 pl-3.5 rounded-[14px] bg-panel border border-line-strong focus-within:border-[#4a4a4a]"
        onSubmit={submit}
      >
        <Sparkles
          size={18}
          className="text-accent shrink-0"
          aria-hidden="true"
        />
        <label className="sr-only" htmlFor="ask-input">
          Ask about your teams and people
        </label>
        <input
          className="flex-1 min-w-0 h-8.5 bg-transparent text-[14.5px] outline-none focus-visible:outline-none"
          id="ask-input"
          ref={input}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask who leads a team, who works where, or who is in which team…"
          autoComplete="off"
          maxLength={2000}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={!!pending || question.trim().length < 2}
        >
          <Send size={14} />
          Ask
        </Button>
      </form>
      {status && !status.configured && (
        <p className={`${noteClasses} text-warn`} role="status">
          AI answers are off. Add <code>ANTHROPIC_API_KEY</code> to{" "}
          <code>api.command.carrieros.ai/.env</code> and restart the API.
          Everything else works without it.
        </p>
      )}
      <div className="flex gap-1.5 flex-wrap mt-2.5 mb-4.5">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            className={chipClasses}
            onClick={() => ask(preset)}
            disabled={!!pending}
          >
            {preset}
          </button>
        ))}
        {savedViews.map((view) => (
          <button
            key={view.question}
            className={chipClasses}
            onClick={() => ask(view.question)}
            disabled={!!pending}
          >
            <Bookmark size={13} />
            {view.name}
          </button>
        ))}
      </div>

      {thread.length > 0 && (
        <div className="grid gap-3 mb-4.5">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.05em] uppercase text-faint">
            <span>Conversation</span>
            <button
              className="underline decoration-[#444] underline-offset-3 cursor-pointer hover:text-white"
              onClick={() => setThread([])}
              disabled={!!pending}
            >
              Clear
            </button>
          </div>
          {thread.map((turn) => (
            <section
              key={turn.id}
              className="p-4 rounded-[14px] border border-line-strong bg-[#070707]"
              aria-live="polite"
              aria-busy={!turn.answer && !turn.error}
            >
              <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                <h2 className="text-[15px] font-semibold">{turn.question}</h2>
                {turn.answer && (
                  <span className="text-[12px] text-dim">
                    Answered by Claude from your teams and people
                  </span>
                )}
                <span className="ml-auto flex gap-1.5">
                  {!turn.answer && !turn.error && (
                    <Button onClick={() => pending?.abort()}>
                      <X size={14} />
                      Cancel
                    </Button>
                  )}
                  {turn.answer && (
                    <Button
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
                    </Button>
                  )}
                </span>
              </div>
              {turn.error ? (
                <p className={`${noteClasses} text-bad`} role="alert">
                  {turn.error}
                </p>
              ) : !turn.answer ? (
                <Skeleton rows={3} />
              ) : (
                <>
                  <p className="mb-3 text-[13.5px] leading-[1.65] text-[#d8d8d8] whitespace-pre-line">
                    {turn.answer.answer}
                  </p>
                  {turn.answer.views.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 max-tablet:grid-cols-1">
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

      <div className="grid grid-cols-2 gap-3.5 max-tablet:grid-cols-1">
        <Card
          title="Teams at a glance"
          action={
            <Link
              className="ml-auto text-[12.5px] font-medium text-soft underline decoration-[#444] underline-offset-3 hover:text-white"
              href="/teams"
            >
              Open teams
            </Link>
          }
        >
          {teamsError ? (
            <ErrorState
              message={teamsError}
              onRetry={() => void teamsQuery.refetch()}
            />
          ) : !teams ? (
            <Skeleton />
          ) : (
            teams.map((team) => (
              <Link
                key={team.id}
                className={`${listRowClasses.row} group`}
                href={`/teams?team=${team.id}`}
              >
                <TeamAvatar icon={team.icon} />
                <span className={listRowClasses.text}>
                  <b className={listRowClasses.title}>{team.name}</b>
                  <small className={listRowClasses.detail}>
                    Led by {team.lead?.name ?? "nobody yet"}
                  </small>
                </span>
                <AvatarStack names={team.members.map((m) => m.name)} />
                <span className="text-dim">{team.memberCount}</span>
              </Link>
            ))
          )}
        </Card>
        <Card title="My teams">
          {!teams ? (
            teamsError ? null : (
              <Skeleton rows={2} />
            )
          ) : myTeams?.length ? (
            myTeams.map((team, index) => (
              <div
                key={team.id}
                className={index ? "mt-2 pt-2 border-t border-line" : undefined}
              >
                <Link
                  className={`${listRowClasses.row} group`}
                  href={`/teams?team=${team.id}`}
                >
                  <TeamAvatar icon={team.icon} />
                  <span className={listRowClasses.text}>
                    <b className={listRowClasses.title}>{team.name}</b>
                    <small className={listRowClasses.detail}>
                      {team.purpose}
                    </small>
                  </span>
                </Link>
                <div className="flex flex-wrap gap-1.5 pl-9">
                  {team.members
                    .filter((member) => member.id !== me.id)
                    .slice(0, 6)
                    .map((member) => (
                      <Link
                        key={member.id}
                        className="inline-flex items-center gap-1.5 h-7 pr-[9px] pl-[3px] border border-line-strong rounded-full text-[12px] text-soft hover:border-[#444] hover:text-white"
                        href={`/teams?view=people&person=${member.id}`}
                        title={member.jobTitle}
                      >
                        <Avatar name={member.name} size="xs" />
                        {member.name.split(" ")[0]}
                      </Link>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <Note>{me.name} isn’t in a team yet.</Note>
          )}
        </Card>
      </div>
    </>
  );
}
