import type { Metadata } from "next";
import { Suspense } from "react";
import { Overview } from "@/features/overview/overview";

export const metadata: Metadata = {
  title: "Company overview | CarrierOS Command Center",
};

export default function OverviewPage() {
  return (
    <Suspense>
      <Overview />
    </Suspense>
  );
}
