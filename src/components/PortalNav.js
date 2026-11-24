"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "./session";
import Icon from "./Icon";

export default function PortalNav({ lang, n, signout }) {
  // n = { dashboard, resources, appointment, feedback, profile }
  const pathname = usePathname();
  const router = useRouter();
  const base = `/${lang}/portal`;
  const items = [
    ["", "home", n.dashboard],
    ["/resources", "print", n.resources],
    ["/appointment", "calendar", n.appointment],
    ["/feedback", "chat", n.feedback],
    ["/profile", "id", n.profile],
  ];
  return (
    <nav className="portal-nav" aria-label="Member portal">
      {items.map(([p, icon, label]) => {
        const href = base + p;
        const active = p === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            <i aria-hidden="true"><Icon name={icon} /></i>{label}
          </Link>
        );
      })}
      <button type="button" onClick={async () => { await clearSession(); router.push(`/${lang}`); }}>
        <i aria-hidden="true"><Icon name="logout" /></i>{signout}
      </button>
    </nav>
  );
}
