"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "./NavLinks";
import Icon from "./Icon";

// Phone menu: full screen. Items with children show as a heading + sub-links.
export default function MobileMenu({ items, joinHref, d }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
      {open && (
        <div className="mobile-nav" role="dialog" aria-modal="true" aria-label={d.header.menu}>
          <div className="mobile-nav-top">
            <span className="eyebrow" style={{ color: "var(--yellow)", margin: 0 }}>{d.header.menu}</span>
            <button onClick={() => setOpen(false)} aria-label={d.header.close}>✕</button>
          </div>
          {items.map((it) =>
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
                className="m-link"
                style={{ "--i": n++ }}
                aria-current={isActive(pathname, it.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {it.label}
              </Link>
            )
          )}
          <Link href={joinHref} className="btn btn-saffron" onClick={() => setOpen(false)}>{d.header.joinLong}</Link>
        </div>
      )}
    </>
  );
}
