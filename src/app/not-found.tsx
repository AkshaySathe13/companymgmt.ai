import Link from "next/link";
import { Compass } from "lucide-react";
export default function NotFound() {
  return (
    <main className="not-found-page">
      <Compass size={40} />
      <h1>Page not found</h1>
      <p>This destination isn’t part of your workspace.</p>
      <Link href="/overview" className="login-submit">
        Return to workspace
      </Link>
    </main>
  );
}
