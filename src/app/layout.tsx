import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import "./command-center.css";
export const metadata: Metadata = {
  title: "CarrierOS Command Center",
  description:
    "The CarrierOS company management portal: teams, people and an AI assistant.",
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
