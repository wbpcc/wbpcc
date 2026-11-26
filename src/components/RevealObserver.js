"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fades/slides in every element marked data-reveal as it scrolls into view.
// Add style={{"--i": n}} to stagger items in a row.
//
// Also watches for content that appears AFTER the page loads (e.g. the Members
// area, which shows once sign-in is checked) — otherwise those cards would
// never be noticed and would stay invisible.
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window)) return;
    root.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    const watch = (scope) => {
      if (scope.matches?.("[data-reveal]:not(.is-in)")) io.observe(scope);
      scope.querySelectorAll?.("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    };
    watch(document);
    const mo = new MutationObserver((list) => {
      for (const m of list) m.addedNodes.forEach((n) => { if (n.nodeType === 1) watch(n); });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);

  return null;
}
