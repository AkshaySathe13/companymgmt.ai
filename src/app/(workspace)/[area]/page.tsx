import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { comingSoonAreas } from "@/config/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";

export function generateStaticParams() {
  return comingSoonAreas.map((area) => ({ area: area.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area } = await params;
  const nav = comingSoonAreas.find((item) => item.slug === area);
  return {
    title: `${nav?.title ?? "Page not found"} | CarrierOS Command Center`,
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area } = await params;
  const nav = comingSoonAreas.find((item) => item.slug === area);
  if (!nav) notFound();
  return (
    <ComingSoon
      title={nav.title}
      description={nav.description}
      icon={nav.icon}
    />
  );
}
