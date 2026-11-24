"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, LIVE } from "./session";

// Members area guard. LIVE: only signed-in members (and the team) get in;
// everyone else goes to the sign-in page. DEMO: open, as before.
export default function MemberGate({ lang, children, checking }) {
  const s = useSession();
  const router = useRouter();
  const ok = !!s; // any signed-in level (member, contributor, admin)
  useEffect(() => {
    if (LIVE && s === null) router.replace(`/${lang}/signin`);
  }, [s, lang, router]);
  if (!LIVE || ok) return children;
  return <p className="wrap" style={{ padding: "80px 0", textAlign: "center", color: "var(--muted)", fontWeight: 600 }}>{checking}</p>;
}
