"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { fill, formatNumber, intlLocale } from "@/i18n/config";
import { useNow, withTimes } from "./useEventTimes";

const EventsMap = dynamic(() => import("./EventsMap"), { ssr: false });

// The parts of an event page that depend on "now": status, date, RSVP, map.
export function EventStatus({ event, h }) {
  const now = useNow();
  if (!now) return null;
  const e = withTimes(event, now);
  if (e.status === "live") return <span className="pill pill-live"><span className="dot" />{h.live}</span>;
  if (e.status === "soon") return <span className="pill pill-soon">{h.soon}</span>;
  return <span className="pill pill-month">{h.month}</span>;
}

export function EventWhen({ event, lang }) {
  const now = useNow();
  if (!now) return <span>…</span>;
  const e = withTimes(event, now);
  const fmt = new Intl.DateTimeFormat(intlLocale[lang], { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
  const end = new Intl.DateTimeFormat(intlLocale[lang], { hour: "numeric", minute: "2-digit" });
  return <span>{fmt.format(new Date(e.start))} – {end.format(new Date(e.end))}</span>;
}

export function EventRsvp({ event, lang, h, ev }) {
  const [going, setGoing] = useState(false);
  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div className="big-count">{formatNumber(event.going + (going ? 1 : 0), lang)}</div>
      <div style={{ color: "var(--muted)", marginTop: -6 }}>{fill(h.going, { n: "" }).trim()}</div>
      <button className={`btn ${going ? "btn-navy" : "btn-saffron"}`} onClick={() => setGoing((g) => !g)} aria-pressed={going}>
        {going ? "✓ " : ""}{h.rsvp}
      </button>
      {going && <p className="form-note" style={{ animation: "fadeUp .4s both" }}>{ev.goingNow}</p>}
      <a className="btn btn-outline" href={`https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`} target="_blank" rel="noopener noreferrer">
        {h.directions} ↗
      </a>
    </div>
  );
}

export function EventMap({ event, lang, h }) {
  const now = useNow();
  const e = now ? withTimes(event, now) : event;
  return (
    <div className="detail-map">
      <EventsMap events={[e]} lang={lang} labels={{ office: h.legendOffice, directions: h.directions }} single />
    </div>
  );
}
