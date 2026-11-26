"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

// News archive: every post, newest first, grouped by month. One calendar
// button opens a small year + month picker. Items come pre-translated from
// the server page, so this stays light.
const TXT = {
  en: { filter: "Filter by date", all: "All", year: "Year", month: "Month", clear: "Show everything", none: "No news for this month.", items: (n) => `${n} ${n === 1 ? "item" : "items"}` },
  bn: { filter: "তারিখ দিয়ে খুঁজুন", all: "সব", year: "বছর", month: "মাস", clear: "সব দেখান", none: "এই মাসে কোনো খবর নেই।", items: (n) => `${n}টি খবর` },
  hi: { filter: "तारीख़ से छाँटें", all: "सभी", year: "वर्ष", month: "महीना", clear: "सब दिखाएँ", none: "इस महीने कोई ख़बर नहीं।", items: (n) => `${n} ख़बरें` },
};

export default function NewsArchive({ items, lang, locale }) {
  const tx = TXT[lang] || TXT.en;
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null); // 0–11
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  const fmtMonth = useMemo(() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }), [locale]);
  const fmtShort = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short" }), [locale]);
  const fmtDay = useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric" }), [locale]);

  const sorted = useMemo(() => [...items].filter((x) => x.date).sort((a, b) => (a.date < b.date ? 1 : -1)), [items]);
  const years = useMemo(() => [...new Set(sorted.map((x) => +x.date.slice(0, 4)))], [sorted]);
  const monthsIn = (y) => [...new Set(sorted.filter((x) => +x.date.slice(0, 4) === y).map((x) => +x.date.slice(5, 7) - 1))].sort((a, b) => a - b);

  const shown = sorted.filter((x) => (year == null || +x.date.slice(0, 4) === year) && (month == null || +x.date.slice(5, 7) - 1 === month));
  const groups = [];
  for (const x of shown) {
    const key = x.date.slice(0, 7);
    if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, list: [] });
    groups[groups.length - 1].list.push(x);
  }

  // Close the picker on outside tap / Escape.
  useEffect(() => {
    if (!open) return;
    const off = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", off);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", off); window.removeEventListener("keydown", esc); };
  }, [open]);

  const label = year == null ? tx.all : month == null ? String(year) : fmtMonth.format(new Date(year, month, 1));

  return (
    <div className="na">
      <div className="na-bar">
        <span className="na-count">{tx.items(shown.length)}</span>
        <div className="na-pick" ref={box}>
          <button type="button" className={`na-btn${year != null ? " on" : ""}`} aria-expanded={open} aria-label={tx.filter} title={tx.filter} onClick={() => setOpen((o) => !o)}>
            <Icon name="calendar" size={18} /> <span>{label}</span>
          </button>
          {open && (
            <div className="na-pop" role="dialog" aria-label={tx.filter}>
              <p>{tx.year}</p>
              <div className="na-chips">
                <button type="button" aria-pressed={year == null} onClick={() => { setYear(null); setMonth(null); }}>{tx.all}</button>
                {years.map((y) => (
                  <button key={y} type="button" aria-pressed={year === y && month == null} onClick={() => { setYear(y); setMonth(null); }}>{y}</button>
                ))}
              </div>
              {year != null && (
                <>
                  <p>{tx.month}</p>
                  <div className="na-months">
                    {Array.from({ length: 12 }, (_, m) => {
                      const has = monthsIn(year).includes(m);
                      return (
                        <button key={m} type="button" disabled={!has} aria-pressed={month === m} onClick={() => { setMonth(m); setOpen(false); }}>
                          {fmtShort.format(new Date(year, m, 1))}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {year != null && <button type="button" className="na-clear" onClick={() => { setYear(null); setMonth(null); setOpen(false); }}>{tx.clear}</button>}
            </div>
          )}
        </div>
      </div>

      {groups.length === 0 && <p className="na-empty">{tx.none}</p>}
      {groups.map((g) => (
        <section key={g.key} className="na-month">
          <h2>{fmtMonth.format(new Date(+g.key.slice(0, 4), +g.key.slice(5, 7) - 1, 1))}</h2>
          <ul>
            {g.list.map((x) => (
              <li key={x.id}>
                <Link href={x.href} className="na-row">
                  <time dateTime={x.date}><b>{fmtDay.format(new Date(x.date))}</b><small>{fmtShort.format(new Date(x.date))}</small></time>
                  <span className="na-text">
                    <b>{x.title}</b>
                    {x.excerpt && <span>{x.excerpt}</span>}
                    <small>{x.meta}</small>
                  </span>
                  <i aria-hidden="true"><Icon name={x.icon} size={18} /></i>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
