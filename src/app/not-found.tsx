import Link from "next/link";
import { Compass } from "lucide-react";
import { ctaClasses } from "@/components/ui";
export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-dvh gap-[18px] p-[25px] text-center text-[#b9b9b9]">
      <Compass size={40} />
      <h1 className="text-[#e5e5e5] text-[28px] mt-[5px]">Page not found</h1>
      <p className="mb-2.5">This destination isn’t part of your workspace.</p>
      <Link href="/overview" className={`${ctaClasses} w-auto py-3.5 px-5.5`}>
        Return to workspace
      </Link>
    </main>
  );
}
