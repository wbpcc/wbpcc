"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, clearSession } from "./session";
import { isActive } from "./NavLinks";
import Icon from "./Icon";

// Phone menu: full screen. Items with children show as a heading + sub-links.
export default function MobileMenu({ items, joinHref, lang, d }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const s = useSession();
  // One account item that follows the login: sign in → Members area → Team console.
  const account = s?.role === "team" ? { href: "/console", label: d.auth.consoleTitle }
    : s?.role === "member" ? { href: `/${lang}/portal`, label: d.auth.memberPortal }
    : { href: `/${lang}/signin`, label: d.menu.membersArea };
  const all = [...items, { ...account, accent: true }];

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  let n = 0;
  return (
    <>
      <button className="menu-btn" aria-expanded={open} aria-label={d.header.menu} onClick={() => setOpen(true)}>
        <Icon name="menu" size={22} />
      </button>
      {/* Rendered on <body>, not inside the header: the header's frosted-glass
          effect would otherwise trap this full-screen menu inside its own box. */}
      {open && createPortal(
        <div className="mobile-nav" role="dialog" aria-modal="true" aria-label={d.header.menu}>
          <div className="mobile-nav-top">
            <span className="eyebrow" style={{ color: "var(--yellow)", margin: 0 }}>{d.header.menu}</span>
            <button onClick={() => setOpen(false)} aria-label={d.header.close}>✕</button>
          </div>
          {all.map((it) =>
            it.children ? (
              <div key={it.label} className="m-group" style={{ "--i": n++ }}>
                <span className="m-group-title">{it.label}</span>
                <div className="m-sub">
                  {it.children.map((c) => (
                    <Link key={c.href} href={c.href} onClick={() => setOpen(false)}>{c.label}</Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={it.href}
                href={it.href}
                className={`m-link${it.accent ? " m-accent" : ""}`}
                style={{ "--i": n++ }}
                aria-current={isActive(pathname, it.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {it.label}
              </Link>
            )
          )}
          <Link href={joinHref} className="btn btn-saffron" onClick={() => setOpen(false)}>{d.header.joinLong}</Link>
          {s && (
            <button type="button" className="m-signout" onClick={async () => { setOpen(false); await clearSession(); router.push(`/${lang}`); }}>
              <Icon name="logout" size={18} /> {d.auth.signout}
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
