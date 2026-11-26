"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

/**
 * A real carousel: swipe (or ‹ › buttons) moves one card at a time, cards snap
 * into place, dots show where you are, and the next card peeks in so people
 * know there's more. Keyboard: ← → when focused.
 *
 * variant      "light" (cream sections) | "dark" (navy newsroom)
 * trackClass   sizing hooks, e.g. "ev-rail", "person-rail", "news-rail"
 * gridOnDesktop  from 700px up, show everything as a normal grid (no carousel)
 */
export default function Carousel({ children, label, variant = "light", trackClass = "", gridOnDesktop = false, head = null }) {
  const ref = useRef(null);
  const items = Children.toArray(children).filter(Boolean);
  const n = items.length;
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || !el.children.length) return;
    let best = 0, dist = Infinity;
    [...el.children].forEach((k, i) => {
      const d = Math.abs(k.offsetLeft - el.scrollLeft);
      if (d < dist) { dist = d; best = i; }
    });
    setActive(best);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => { el.removeEventListener("scroll", measure); window.removeEventListener("resize", measure); };
  }, [measure, n]);

  const go = (i) => {
    const el = ref.current;
    const k = el?.children[Math.max(0, Math.min(n - 1, i))];
    if (k) el.scrollTo({ left: k.offsetLeft, behavior: "smooth" });
  };
  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  };

  if (!n) return null;
  return (
    <div className={`cz cz-${variant}${gridOnDesktop ? " cz-grid" : ""}`} role="region" aria-roledescription="carousel" aria-label={label}>
      {head}
      <div className={`cz-track ${trackClass}`} ref={ref} tabIndex={0} onKeyDown={onKey}>
        {items.map((c, i) => (
          <div className="cz-slide" key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${n}`}>{c}</div>
        ))}
      </div>
      {n > 1 && (
        <div className="cz-controls">
          <button type="button" className="cz-btn" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous">
            <span aria-hidden="true">‹</span>
          </button>
          {n <= 10 ? (
            <div className="cz-dots">
              {items.map((_, i) => (
                <button key={i} type="button" className="cz-dot" aria-label={`${i + 1} / ${n}`} aria-current={i === active ? "true" : undefined} onClick={() => go(i)} />
              ))}
            </div>
          ) : (
            <span className="cz-count" aria-live="polite">{active + 1} / {n}</span>
          )}
          <button type="button" className="cz-btn" onClick={() => go(active + 1)} disabled={atEnd || active >= n - 1} aria-label="Next">
            <span aria-hidden="true">›</span>
          </button>
        </div>
      )}
    </div>
  );
}
