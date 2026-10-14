import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";
export const metadata: Metadata = { title: "Sign in | companymgmt.ai" };
export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="session-loading">Loading sign in…</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
