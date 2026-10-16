"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { LoadingScreen } from "@/components/loading-screen";
import { ctaClasses } from "@/components/ui";
import { safeDestination } from "@/config/navigation";
import { errorMessage } from "@/lib/api";
import { useChangePassword, useMe } from "./session";

const MIN_LENGTH = 10;
const labelClasses = "text-[#dedede] text-[12px] font-[550] mb-[9px]";
const inputClasses =
  "h-12 px-3.5 mb-[23px] border border-[#323232] rounded-lg bg-[#131313] text-[#e4e4e4] text-[13px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_#71f53b1a] max-tablet:text-[16px]";

/** First sign-in (temporary password) and voluntary password changes. */
export function ChangePasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const destination = safeDestination(params.get("next"));
  const { data: me, isPending } = useMe();
  const change = useChangePassword();
  const [mismatch, setMismatch] = useState("");

  useEffect(() => {
    if (me === null) router.replace("/login");
  }, [me, router]);

  if (isPending || !me) return <LoadingScreen status>Loading…</LoadingScreen>;

  const error =
    mismatch ||
    (change.error
      ? errorMessage(change.error, "Couldn't change the password.")
      : "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = String(data.get("newPassword"));
    if (next !== String(data.get("confirmPassword"))) {
      setMismatch("The new passwords don't match.");
      return;
    }
    setMismatch("");
    change.mutate(
      {
        currentPassword: String(data.get("currentPassword")),
        newPassword: next,
      },
      { onSuccess: () => router.replace(destination) },
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-90">
        <Brand />
        <div className="grid place-items-center size-[47px] rounded-xl text-[#c4c4c4] bg-[#1b1b1b] border border-[#323232] mt-10 mb-6">
          <KeyRound size={24} />
        </div>
        <h1 className="text-[28px] font-[650] tracking-[-0.03em] mb-2.5">
          {me.mustChangePassword ? "Set your password" : "Change password"}
        </h1>
        <p className="text-[#b3b3b3] text-[13px]">
          {me.mustChangePassword
            ? `Welcome, ${me.name.split(" ")[0]}. Replace your temporary password to continue.`
            : "Other devices will be signed out."}
        </p>
        <form onSubmit={submit} className="flex flex-col mt-[35px]">
          <label className={labelClasses} htmlFor="currentPassword">
            {me.mustChangePassword ? "Temporary password" : "Current password"}
          </label>
          <input
            className={inputClasses}
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
          <label className={labelClasses} htmlFor="newPassword">
            New password
          </label>
          <input
            className={inputClasses}
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            required
            aria-describedby="password-rule"
          />
          <label className={labelClasses} htmlFor="confirmPassword">
            Confirm new password
          </label>
          <input
            className={inputClasses}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            required
          />
          <p
            id="password-rule"
            className="-mt-3 mb-5 text-[11.5px] text-[#9a9a9a]"
          >
            At least {MIN_LENGTH} characters, different from the current one.
          </p>
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
            disabled={change.isPending || change.isSuccess}
          >
            {change.isPending || change.isSuccess ? "Saving…" : "Save password"}
          </button>
          {!me.mustChangePassword && (
            <button
              type="button"
              className="mt-4 text-[12px] text-[#b3b3b3] underline underline-offset-3"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
