import { Layers3 } from "lucide-react";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
      <span className="grid place-items-center size-8.5 rounded-[10px] text-[#e0e0e0] bg-[#2a2a2a]">
        <Layers3 size={20} strokeWidth={1.8} />
      </span>
      {!compact && (
        <span className="text-[18px] font-[750] tracking-[-0.035em]">
          CarrierOS<span className="text-[#e5e5e5]"> Command Center</span>
        </span>
      )}
    </span>
  );
}
