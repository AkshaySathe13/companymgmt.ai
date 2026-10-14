"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { beginDemoSession, useDemoSession } from "./demo-session";
import { safeDestination } from "@/config/navigation";
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const session = useDemoSession();
  const destination = safeDestination(params.get("next"));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (session) router.replace(destination);
  }, [session, destination, router]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (
      String(data.get("email")).trim().toLowerCase() !==
        "demo@companymgmt.ai" ||
      data.get("password") !== "demo12345"
    ) {
      setError("Use the demo credentials below to enter the workspace.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      beginDemoSession();
      router.replace(destination);
    } catch {
      setBusy(false);
      setError(
        "Browser storage is unavailable. Allow storage for this site and try again.",
      );
    }
  }
  return (
    <main className="login-page">
      <section
        className="login-story"
        aria-label="Company management workspace"
      >
        <Brand />
        <div className="login-story-body">
          <div className="login-art" aria-hidden="true">
            <div className="art-row">
              <span />
              <span />
              <span />
            </div>
            <div className="art-divider" />
            <div className="art-columns">
              <div />
              <div />
              <div />
            </div>
            <div className="art-lines">
              <span />
              <span />
              <span />
            </div>
          </div>
          <h1>
            Your company.
            <br />
            <span>One workspace.</span>
          </h1>
          <p>
            A clear place for your people, projects, and operations. Built to
            keep everything connected.
          </p>
        </div>
        <div className="login-story-footer">
          <span>companymgmt.ai</span>
          <span>Workspace preview</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-mobile-brand">
          <Brand />
        </div>
        <div className="login-form-wrap">
          <div className="login-lock">
            <LockKeyhole size={24} />
          </div>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to your company workspace.</p>
          <form onSubmit={submit} className="login-form">
            <label htmlFor="email">Email address</label>
            <div className="field-wrap">
              <Mail size={18} aria-hidden="true" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                required
                defaultValue="demo@companymgmt.ai"
                disabled={busy}
              />
            </div>
            <label htmlFor="password">Password</label>
            <div className="field-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                defaultValue="demo12345"
                disabled={busy}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="login-submit" type="submit" disabled={busy}>
              {busy ? "Opening workspace…" : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="demo-note">
            <ShieldCheck size={18} aria-hidden="true" />
            <div>
              <strong>Demo workspace</strong>
              <p>
                Use <span>demo@companymgmt.ai</span> and <span>demo12345</span>.
                This previews the layout; real authentication is not connected.
              </p>
            </div>
          </div>
          <p className="login-bottom">
            Your workspace, ready for what comes next.
          </p>
        </div>
        <footer className="login-footer">
          © {new Date().getFullYear()} companymgmt.ai
        </footer>
      </section>
    </main>
  );
}
