import Link from "next/link";
import { t } from "@/i18n/config";
import { events, featured, stats } from "@/data/placeholder";
import { CountUp, LiveCount } from "./LiveNumbers";
import Icon from "./Icon";

export default function Hero({ lang, d }) {
  const live = events.find((e) => e.id === featured.eventId);
  const h = d.hero;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <p className="eyebrow">{h.eyebrow}</p>
            <h1>
              <span className="line"><span>{h.title}</span></span>
              <span className="line"><span><em>{h.titleEm}</em></span></span>
            </h1>
            <p className="hero-sub">{h.sub}</p>
            <div className="hero-ctas">
              <Link href={`/${lang}/join`} className="btn btn-saffron">{h.ctaJoin}</Link>
              <Link href={`/${lang}/events`} className="btn btn-outline">{h.ctaEvents}</Link>
              <Link href={`/${lang}/petitions`} className="btn btn-outline">{h.ctaSign}</Link>
            </div>
          </div>

          <div className="hero-visual">
            {/* PLACEHOLDER: swap for a real rally / Congress Bhavan photo inside the arc */}
            <div className="hero-photo" role="img" aria-label={h.photo}>
              <span className="hero-script">{h.script}</span>
              <span className="hero-photo-label">{h.photo}</span>
            </div>
            <div className="sticker" aria-hidden="true">{h.sticker}</div>
            {live && (
              <Link href={`/${lang}/events/${live.id}`} className="live-card">
                <span className="pill pill-live"><span className="dot" />{h.liveLabel}</span>
                <h3>{t(live.title, lang)}</h3>
                <p>{t(live.place, lang)} · {t(featured.when, lang)}</p>
                <p><Icon name="users" size={16} /> <LiveCount base={live.going} lang={lang} template={d.happening.going} /></p>
                <span className="go">{h.liveCta}</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="stats" aria-label="At a glance">
        <div className="wrap">
          <div className="stat"><b><CountUp value={stats.eventsThisWeek} lang={lang} /></b><span>{d.stats.events}</span></div>
          <div className="stat"><b><CountUp value={stats.groups} lang={lang} /></b><span>{d.stats.groups}</span></div>
          <div className="stat"><b><CountUp value={stats.districts} lang={lang} /></b><span>{d.stats.districts}</span></div>
          <div className="stat"><b><CountUp value={stats.signatures} lang={lang} live /></b><span>{d.stats.signatures}</span></div>
        </div>
      </section>
      <div className="tricolour" aria-hidden="true"><span /><span /><span /></div>
    </>
  );
}
