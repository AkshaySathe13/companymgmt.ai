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
import { ctaClasses } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useLogin, useMe } from "./session";
import { safeDestination } from "@/config/navigation";
const labelClasses = "text-[#dedede] text-[12px] font-[550] mb-[9px]";
const fieldClasses =
  "flex items-center px-3.5 h-12 gap-2.5 border border-[#323232] rounded-lg bg-[#131313] text-[#acacac] mb-[23px] focus-within:border-accent focus-within:shadow-[0_0_0_3px_#71f53b1a]";
const inputClasses =
  "flex-1 min-w-0 w-full bg-transparent py-3 outline-none focus-visible:outline-none text-[#e4e4e4] text-[13px] max-tablet:text-[16px]";

// Fictional demo users from the API seed, one per row of the role table. Demo only.
const DEMO_PASSWORD = "Pass@123";
const demoUsers = [
  ["ceo@gmail.com", "CEO · C-suite · Leadership Lead"],
  ["cfo@gmail.com", "CFO · C-suite · Executive Member"],
  ["cto@gmail.com", "CTO · C-suite · Executive Member"],
  ["indiamanager@gmail.com", "India developers · Team Manager"],
  ["indiadeveloper@gmail.com", "India developers · Team Member"],
  ["usaimanager@gmail.com", "US AI engineers · Team Manager"],
  ["usaiengineer@gmail.com", "US AI engineers · Team Member"],
  ["salesmanager@gmail.com", "Sales · Sales Manager"],
  ["salesexecutive@gmail.com", "Sales · Sales Member"],
  ["irmanager@gmail.com", "Investors · Investor Relations Manager"],
  ["investor@gmail.com", "Investors · Investor"],
].map(([email, label]) => ({ email: email!, label: `${email} — ${label}` }));

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: me } = useMe();
  const login = useLogin();
  const destination = safeDestination(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const busy = login.isPending || login.isSuccess;
  const error = login.error
    ? errorMessage(login.error, "Can't reach the server. Try again.")
    : "";

  // Already signed in (or just signed in): continue, via the password screen if one is due.
  useEffect(() => {
    if (me)
      router.replace(
        me.mustChangePassword
          ? `/change-password?next=${encodeURIComponent(destination)}`
          : destination,
      );
  }, [me, destination, router]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ email: email.trim(), password });
  }
  return (
    <main className="min-h-dvh grid grid-cols-2 max-tablet:flex max-tablet:flex-col">
      <section
        className="flex flex-col pt-11 px-14 pb-7.5 border-r border-[#252525] bg-[#101010] max-desktop:p-[35px] max-tablet:hidden"
        aria-label="Company management workspace"
      >
        <Brand />
        <div className="flex-1 flex flex-col justify-center items-start max-w-115 mx-auto py-17.5">
          <div
            className="w-72.5 p-[19px] border border-[#3d3d3d] bg-[#191919] rounded-xl -rotate-3"
            aria-hidden="true"
          >
            <div className="flex gap-[5px]">
              <span className="size-[5px] bg-[#acacac] rounded-full" />
              <span className="size-[5px] bg-[#acacac] rounded-full" />
              <span className="size-[5px] bg-[#acacac] rounded-full" />
            </div>
            <div className="h-px bg-[#3d3d3d] my-4 -mx-[19px]" />
            <div className="flex gap-2.5">
              <div className="h-[45px] flex-1 rounded-[5px] bg-[#323232]" />
              <div className="h-[45px] flex-1 rounded-[5px] bg-[#757575]" />
              <div className="h-[45px] flex-1 rounded-[5px] bg-[#323232]" />
            </div>
            <div className="mt-[17px] flex flex-col gap-2">
              <span className="h-[5px] w-3/4 bg-[#404040] rounded" />
              <span className="h-[5px] w-[92%] bg-[#404040] rounded" />
              <span className="h-[5px] w-[55%] bg-[#404040] rounded" />
            </div>
          </div>
          <h1 className="text-[clamp(35px,3.3vw,54px)] font-semibold tracking-[-0.035em] leading-[1.18] mt-8.5 mb-5">
            Your company.
            <br />
            <span className="text-[#bababa]">One workspace.</span>
          </h1>
          <p className="text-[#b7b7b7] text-[14px] leading-[1.9] max-w-[350px]">
            A clear place for your people, projects, and operations. Built to
            keep everything connected.
          </p>
        </div>
        <div className="flex justify-between gap-[15px] text-[#afafaf] text-[10px]">
          <span>companymgmt.ai</span>
          <span>Workspace preview</span>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center pt-11 px-8 pb-[25px] max-tablet:flex-1 max-tablet:min-h-dvh max-tablet:py-[26px] max-tablet:px-[25px]">
        <div className="hidden max-tablet:block max-tablet:self-start">
          <Brand />
        </div>
        <div className="w-full max-w-90 my-auto py-12.5 max-tablet:max-w-95 max-narrow:py-[45px]">
          <div className="grid place-items-center size-[47px] rounded-xl text-[#c4c4c4] bg-[#1b1b1b] border border-[#323232] mb-6">
            <LockKeyhole size={24} />
          </div>
          <h2 className="text-[28px] font-[650] tracking-[-0.03em] mb-2.5">
            Welcome back
          </h2>
          <p className="text-[#b3b3b3] text-[13px]">
            Sign in to your company workspace.
          </p>
          <form onSubmit={submit} className="flex flex-col mt-[35px]">
            <label className={labelClasses} htmlFor="email">
              Email address
            </label>
            <div className={fieldClasses}>
              <Mail size={18} aria-hidden="true" />
              <input
                className={inputClasses}
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy}
              />
            </div>
            <label className={labelClasses} htmlFor="password">
              Password
            </label>
            <div className={fieldClasses}>
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                className={inputClasses}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="grid place-items-center p-[5px] bg-transparent text-[#b3b3b3]"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p
                className="-mt-2 mb-[18px] text-[#ff8b51] text-[12px] leading-[1.7]"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              className={`${ctaClasses} w-full p-[15px]`}
              type="submit"
              disabled={busy}
            >
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="flex items-start gap-[11px] mt-[26px] p-4 border border-[#2c2c2c] rounded-[9px] bg-raised text-[#b7b7b7]">
            <ShieldCheck size={18} aria-hidden="true" className="mt-0.5" />
            <div>
              <strong className="text-[11px] text-[#d4d4d4]">
                Demo workspace
              </strong>
              <p className="mt-1.5 leading-[1.8] text-[11px] [overflow-wrap:anywhere]">
                Every demo user signs in with{" "}
                <span className="text-[#cecece]">{DEMO_PASSWORD}</span>. Pick
                one to see what their role can access.
              </p>
              <label className="sr-only" htmlFor="demo-user">
                Try a demo user
              </label>
              <select
                id="demo-user"
                className="mt-2 w-full h-8 px-2 rounded-md bg-[#1b1b1b] border border-[#2c2c2c] text-[11.5px] text-[#d4d4d4]"
                value=""
                onChange={(event) => {
                  setEmail(event.target.value);
                  setPassword(DEMO_PASSWORD);
                  login.reset();
                }}
                disabled={busy}
              >
                <option value="">Try a demo user…</option>
                {demoUsers.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-center text-[10px] text-[#b1b1b1] mt-[27px]">
            Your workspace, ready for what comes next.
          </p>
        </div>
        <footer className="text-[10px] text-[#b0b0b0]">
          © {new Date().getFullYear()} companymgmt.ai
        </footer>
      </section>
    </main>
  );
}
