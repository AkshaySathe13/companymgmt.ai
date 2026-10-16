import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { buttonClasses, PageHeader, Tag } from "@/components/ui";

export function ComingSoon({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) {
  return (
    <>
      <PageHeader title={title}>
        <Tag>Coming soon</Tag>
      </PageHeader>
      <section
        className="grid justify-items-center gap-2.5 pt-17.5 px-5 pb-22.5 text-center"
        aria-label={`${title} coming soon`}
      >
        <span className="grid place-items-center size-16 rounded-[18px] bg-raised border border-line-strong text-soft">
          <Icon size={28} strokeWidth={1.5} />
        </span>
        <h2 className="mt-2 text-[22px] font-semibold">Coming soon</h2>
        <p className="max-w-110 text-[13px] leading-[1.7] text-dim">
          This area is part of the Command Center plan and isn’t built yet.
          Teams & members and the AI assistant on Company overview are ready to
          use.
        </p>
        <div className="flex gap-2 mt-2">
          <Link
            className={`${buttonClasses({ variant: "primary" })} text-[12.5px] font-semibold`}
            href="/teams"
          >
            Open Teams & members
            <ArrowRight size={14} />
          </Link>
          <Link
            className={`${buttonClasses()} text-[12.5px] font-medium`}
            href="/overview"
          >
            Ask AI
          </Link>
        </div>
      </section>
    </>
  );
}
