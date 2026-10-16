import { Suspense } from "react";
import type { Metadata } from "next";
import { LoadingScreen } from "@/components/loading-screen";
import { ChangePasswordForm } from "@/features/auth/change-password-form";

export const metadata: Metadata = {
  title: "Change password | CarrierOS Command Center",
};

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen>Loading…</LoadingScreen>}>
      <ChangePasswordForm />
    </Suspense>
  );
}
