import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
export function ComingSoon({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) {
  return (
    <div className="destination-page">
      <div className="page-heading">
        <div className="page-title-line">
          <span className="page-icon">
            <Icon size={21} strokeWidth={1.7} />
          </span>
          <h1>{title}</h1>
        </div>
        <span className="page-status">
          <span />
          Coming soon
        </span>
      </div>
      <section className="coming-soon" aria-label={`${title} coming soon`}>
        <div className="coming-soon-icon">
          <Icon size={32} strokeWidth={1.4} />
          <span>
            <ArrowUpRight size={14} />
          </span>
        </div>
        <h2>Coming soon</h2>
        <p>This space is ready for what comes next.</p>
        <div className="coming-soon-rule" />
        <span className="coming-soon-caption">{title}</span>
      </section>
    </div>
  );
}
