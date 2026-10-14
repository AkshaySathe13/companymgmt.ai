import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { systems } from "@/config/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
export function generateStaticParams() {
  return systems.map((item) => ({ system: item.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ system: string }>;
}): Promise<Metadata> {
  const { system } = await params;
  const item = systems.find((item) => item.slug === system);
  return { title: `${item?.title ?? "Page not found"} | companymgmt.ai` };
}
export default async function SystemPage({
  params,
}: {
  params: Promise<{ system: string }>;
}) {
  const { system } = await params;
  const item = systems.find((item) => item.slug === system);
  if (!item) notFound();
  return <ComingSoon title={item.title} icon={item.icon} />;
}
