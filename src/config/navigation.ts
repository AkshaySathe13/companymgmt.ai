import {
  Bot,
  BriefcaseBusiness,
  UsersRound,
  ListTodo,
  GitPullRequest,
  Server,
  Workflow,
  Megaphone,
  Wallet,
  Files,
  ShieldCheck,
} from "lucide-react";
export const aiAgent = {
  title: "AI Agent",
  href: "/ai-agent",
  icon: Bot,
  slug: "ai-agent",
};
export const systems = [
  {
    title: "Executive management",
    slug: "executive-management",
    icon: BriefcaseBusiness,
  },
  {
    title: "People and team management",
    slug: "people-and-team-management",
    icon: UsersRound,
  },
  {
    title: "Project requirements and tasks",
    slug: "project-requirements-and-tasks",
    icon: ListTodo,
  },
  {
    title: "Engineering, quality, and releases",
    slug: "engineering-quality-and-releases",
    icon: GitPullRequest,
  },
  {
    title: "Infrastructure and resources",
    slug: "infrastructure-and-resources",
    icon: Server,
  },
  {
    title: "Communication, integration, and AI operations",
    slug: "communication-integration-and-ai-operations",
    icon: Workflow,
  },
  {
    title: "Sales, marketing, and CMS",
    slug: "sales-marketing-and-cms",
    icon: Megaphone,
  },
  {
    title: "Finance, expenses, and investment",
    slug: "finance-expenses-and-investment",
    icon: Wallet,
  },
  {
    title: "Documents, reporting, and data room",
    slug: "documents-reporting-and-data-room",
    icon: Files,
  },
  {
    title: "Administration, security, and reliability",
    slug: "administration-security-and-reliability",
    icon: ShieldCheck,
  },
].map((item) => ({ ...item, href: `/systems/${item.slug}` }));
export const navigation = [aiAgent, ...systems];
export function safeDestination(value: string | null) {
  return navigation.some((item) => item.href === value) ? value! : aiAgent.href;
}
