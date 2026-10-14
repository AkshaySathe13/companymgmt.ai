import { Layers3 } from "lucide-react";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <span className="brand-symbol">
        <Layers3 size={20} strokeWidth={1.8} />
      </span>
      {!compact && (
        <span className="brand-name">
          companymgmt<span>.ai</span>
        </span>
      )}
    </span>
  );
}
