import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
export const metadata: Metadata = {
  title: "Company workspace | companymgmt.ai",
  description: "Your company management workspace",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
