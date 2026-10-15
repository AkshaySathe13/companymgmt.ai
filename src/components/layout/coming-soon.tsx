import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <>
      <header className="cc-ph">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="cc-tag">Coming soon</span>
      </header>
      <section className="cc-soon" aria-label={`${title} coming soon`}>
        <span className="cc-soon-icon">
          <Icon size={28} strokeWidth={1.5} />
        </span>
        <h2>Coming soon</h2>
        <p>
          This area is part of the Command Center plan and isn’t built yet.
          Teams & members and the AI assistant on Company overview are ready to
          use.
        </p>
        <div className="cc-soon-actions">
          <Link className="cc-btn cc-btn-pri" href="/teams">
            Open Teams & members
            <ArrowRight size={14} />
          </Link>
          <Link className="cc-btn" href="/overview">
            Ask AI
          </Link>
        </div>
      </section>
    </>
  );
}
