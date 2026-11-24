"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { t, fill, formatNumber, intlLocale } from "@/i18n/config";
import { events, offices, districts, groups } from "@/data/placeholder";
import { useNow, withTimes } from "./useEventTimes";
import Rail from "./Rail";
import Icon from "./Icon";

// Leaflet touches `window`, so the map only loads in the browser — and only
// when someone asks for it (Map view button). Each event's own page has its map.
const EventsMap = dynamic(() => import("./EventsMap"), { ssr: false });

const DAY = 24 * 3600 * 1000;

function distanceKm(a, b) {
  const R = 6371, toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function EventCard({ e, lang, h, isGoing, onGoing, fmt }) {
  const group = e.group ? groups.find((g) => g.id === e.group) : null;
  const date = new Date(e.start);
  return (
    <article className={`ev-card ev-${e.status}`}>
      <div className="ev-media">
        <div className="ev-date">
          <b>{fmt.day.format(date)}</b>
          <span>{fmt.mon.format(date)}</span>
        </div>
        {e.status === "live" && <span className="pill pill-live"><span className="dot" />{h.live}</span>}
        {e.status === "soon" && <span className="pill pill-soon">{h.soon}</span>}
        {e.status === "past" && <span className="pill pill-month">{h.month}</span>}
        {group && <span className="ev-group">{t(group.name, lang)}</span>}
      </div>
      <div className="ev-body">
        <h3><Link href={`/${lang}/events/${e.id}`} className="stretch">{t(e.title, lang)}</Link></h3>
        <p><Icon name="pin" size={15} /> {t(e.place, lang)}</p>
        <p><Icon name="clock" size={15} /> {fmt.time.format(date)}</p>
        <p><Icon name="users" size={15} /> {fill(h.going, { n: formatNumber(e.going + (isGoing ? 1 : 0), lang) })}
          {e.km != null && <> · {fill(h.km, { n: formatNumber(Math.round(e.km), lang) })}</>}
        </p>
        <div className="ev-actions">
          {e.status !== "past" ? (
            <button className={`btn btn-sm ${isGoing ? "btn-navy" : "btn-saffron"}`} onClick={onGoing} aria-pressed={!!isGoing}>
              {isGoing ? "✓ " : ""}{h.rsvp}
            </button>
          ) : <span />}
          <span className="ev-more">{h.details} →</span>
        </div>
      </div>
    </article>
  );
}

export default function HappeningNow({ lang, h, showHead = true, layout = "rail", children }) {
  const now = useNow();
  const [district, setDistrict] = useState("all");
  const [userPos, setUserPos] = useState(null);
  const [going, setGoing] = useState({});
  const [mapOpen, setMapOpen] = useState(false);

  const { list, mode } = useMemo(() => {
    if (!now) return { list: [], mode: "upcoming" };
    const all = events.map((e) => withTimes(e, now));
    const inDistrict = (e) => district === "all" || e.district === district;

    // Rule: live + next 30 days first; if nothing, fall back to this month.
    let list = all.filter((e) => inDistrict(e) && (e.status === "live" || (e.status === "soon" && e.start - now <= 30 * DAY)));
    let mode = "upcoming";
    if (list.length === 0) {
      const n = new Date(now);
      list = all.filter((e) => {
        const s = new Date(e.start);
        return inDistrict(e) && s.getMonth() === n.getMonth() && s.getFullYear() === n.getFullYear();
      });
      mode = "month";
    }
    if (userPos) list = list.map((e) => ({ ...e, km: distanceKm(userPos, e) })).sort((a, b) => a.km - b.km);
    else list.sort((a, b) => (b.status === "live") - (a.status === "live") || a.start - b.start);
    return { list, mode };
  }, [now, district, userPos]);

  const usedDistricts = [...new Set(events.map((e) => e.district))];
  const loc = intlLocale[lang];
  const fmt = {
    day: new Intl.DateTimeFormat(loc, { day: "numeric" }),
    mon: new Intl.DateTimeFormat(loc, { month: "short" }),
    time: new Intl.DateTimeFormat(loc, { weekday: "short", hour: "numeric", minute: "2-digit" }),
  };

  function findNearMe() {
    if (!navigator.geolocation) return;
    // Location is used only in this browser — never sent or stored.
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setDistrict("all"); },
      () => {}
    );
  }

  const cards = list.map((e, i) => (
    <div key={`${district}-${userPos ? "near" : ""}-${e.id}`} className="ev-slot" style={{ "--i": i }}>
      <EventCard e={e} lang={lang} h={h} fmt={fmt} isGoing={going[e.id]} onGoing={() => setGoing((g) => ({ ...g, [e.id]: !g[e.id] }))} />
    </div>
  ));
  const note = now ? (mode === "month" ? h.noteMonth : h.noteUpcoming) : "";

  return (
    <section className="section happening-sec deco deco-a" id="happening">
      <div className="wrap">
        {showHead && (
          <div className="section-head" data-reveal>
            <div>
              <p className="eyebrow">{h.eyebrow}</p>
              <h2 className="h-section">{h.title}</h2>
              <p>{h.sub}</p>
            </div>
            <Link className="link-arrow" href={`/${lang}/events`}>{h.allEvents} →</Link>
          </div>
        )}

        {children}

        <div className="ev-toolbar">
          <div className="filters" role="toolbar">
            <button aria-pressed={!!userPos} onClick={findNearMe}>{h.nearMe}</button>
            <button aria-pressed={district === "all" && !userPos} onClick={() => { setDistrict("all"); setUserPos(null); }}>{h.all}</button>
            {usedDistricts.map((id) => (
              <button key={id} aria-pressed={district === id} onClick={() => { setDistrict(id); setUserPos(null); }}>
                {t(districts[id], lang)}
              </button>
            ))}
          </div>
          <button className={`btn btn-sm ${mapOpen ? "btn-navy" : "btn-ghost"} map-toggle`} onClick={() => setMapOpen((o) => !o)} aria-expanded={mapOpen}>
            {mapOpen ? h.hideMap : h.showMap}
          </button>
        </div>

        {mapOpen && (
          <div className="map-panel">
            <EventsMap events={list} offices={offices} lang={lang} labels={{ office: h.legendOffice, directions: h.directions }} userPos={userPos} />
            <div className="map-legend">
              <span><i style={{ background: "var(--red)" }} />{h.legendLive}</span>
              <span><i style={{ background: "var(--sky)" }} />{h.legendSoon}</span>
              <span><i style={{ background: "var(--navy)" }} />{h.legendOffice}</span>
            </div>
          </div>
        )}

        {now && list.length === 0 && <div className="card event-empty">{h.empty}</div>}

        {layout === "rail" ? (
          <Rail title={note} variant="light" className="ev-rail">{cards}</Rail>
        ) : (
          <>
            <p className="list-note" style={{ marginTop: 8 }}>{note}</p>
            <div className="ev-grid">{cards}</div>
          </>
        )}
      </div>
    </section>
  );
}
