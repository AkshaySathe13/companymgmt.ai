import type { Metadata } from "next";
import { aiAgent } from "@/config/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
export const metadata: Metadata = { title: "AI Agent | companymgmt.ai" };
export default function AiAgentPage() {
  return <ComingSoon title={aiAgent.title} icon={aiAgent.icon} />;
}
