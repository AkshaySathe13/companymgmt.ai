import {
  Activity,
  FlaskConical,
  Files,
  Folder,
  GitPullRequest,
  House,
  Inbox,
  ListChecks,
  Megaphone,
  MessageSquare,
  Server,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  slug: string;
  href: string;
  icon: LucideIcon;
  /** "live" areas are built; "soon" areas show the Coming soon page. */
  status: "live" | "soon";
  description: string;
};

const item = (
  title: string,
  slug: string,
  icon: LucideIcon,
  description: string,
  status: NavItem["status"] = "soon",
): NavItem => ({ title, slug, href: `/${slug}`, icon, status, description });

// Mirrors the business areas of the Command Center requirements, grouped as in the sidebar.
export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      item(
        "Company overview",
        "overview",
        House,
        "Ask AI and see what's happening across teams.",
        "live",
      ),
      item(
        "Approvals",
        "approvals",
        Inbox,
        "One inbox for changes that need review.",
      ),
      item("Activity", "activity", Activity, "Who changed what, and when."),
    ],
  },
  {
    label: "People & work",
    items: [
      item(
        "Teams & members",
        "teams",
        UsersRound,
        "Every team, its members and their connected work.",
        "live",
      ),
      item(
        "Projects",
        "projects",
        Folder,
        "Projects, modules and features with scope and files.",
      ),
      item(
        "Tasks",
        "tasks",
        ListChecks,
        "One shared task system for every team.",
      ),
    ],
  },
  {
    label: "Delivery",
    items: [
      item(
        "Engineering",
        "engineering",
        GitPullRequest,
        "Code, reviews and releases linked to features.",
      ),
      item(
        "QA & UAT",
        "qa",
        FlaskConical,
        "Feature delivery from development to acceptance.",
      ),
    ],
  },
  {
    label: "Operations",
    items: [
      item(
        "Infrastructure",
        "infrastructure",
        Server,
        "Offices, people, hardware and cloud capacity.",
      ),
      item(
        "AI tools & skills",
        "ai-tools",
        Sparkles,
        "Approved tools and reviewed skills.",
      ),
      item(
        "Communication",
        "communication",
        MessageSquare,
        "Discussions and AI follow-ups attached to work.",
      ),
    ],
  },
  {
    label: "Business",
    items: [
      item(
        "Sales & marketing",
        "sales",
        Megaphone,
        "Leads, opportunities, campaigns and content.",
      ),
      item(
        "Finance & investment",
        "finance",
        Wallet,
        "Budgets, expenses and capital.",
      ),
      item(
        "Documents & data room",
        "documents",
        Files,
        "Controlled documents and investor releases.",
      ),
    ],
  },
  {
    label: "Admin",
    items: [
      item(
        "Administration",
        "administration",
        ShieldCheck,
        "Roles, access, integrations and audit.",
      ),
    ],
  },
];

export const navigation = navGroups.flatMap((group) => group.items);
export const home = navigation[0]!;
export const comingSoonAreas = navigation.filter(
  (nav) => nav.status === "soon",
);

export function findNav(pathname: string) {
  return navigation.find(
    (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`),
  );
}

/** Only allow redirects to known workspace pages. */
export function safeDestination(value: string | null) {
  return value && findNav(value.split("?")[0]!) ? value : home.href;
}
