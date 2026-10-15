import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamsPage } from "@/features/teams/teams-page";

export const metadata: Metadata = {
  title: "Teams & members | CarrierOS Command Center",
};

export default function TeamsRoute() {
  return (
    <Suspense>
      <TeamsPage />
    </Suspense>
  );
}
