import { Suspense } from "react";
import type { Metadata } from "next";
import { LoadingScreen } from "@/components/loading-screen";
import { LoginForm } from "@/features/auth/login-form";
export const metadata: Metadata = { title: "Sign in | companymgmt.ai" };
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen>Loading sign in…</LoadingScreen>}>
      <LoginForm />
    </Suspense>
  );
}
