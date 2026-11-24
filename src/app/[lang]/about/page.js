import Link from "next/link";
import { getDictionary, t, fill, formatNumber } from "@/i18n/config";
import { ideology, values, vision, manifesto } from "@/data/pages";
import { leaders } from "@/data/placeholder";
import PageHead from "@/components/PageHead";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).about.title };
}

export default async function AboutPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const a = d.about;
  const president = leaders.find((l) => l.level === "president");

  return (
    <>
      <PageHead crumbHref={`/${lang}`} crumbLabel={d.nav.home} eyebrow={a.eyebrow} title={a.title} lead={a.lead} />

      <nav className="wrap jump" aria-label={a.jump}>
        <a href="#ideology">{a.ideology}</a>
        <a href="#values">{a.values}</a>
        <a href="#vision">{a.vision}</a>
        <a href="#manifesto">{a.manifesto}</a>
      </nav>

      {/* Ideology */}
      <section className="section deco deco-a" id="ideology">
        <div className="wrap split">
          <div data-reveal>
            <p className="eyebrow">01</p>
            <h2 className="h-section">{a.ideology}</h2>
            <p className="big-text">{t(ideology.intro, lang)}</p>
            <p className="form-note">{a.source} <a className="link-arrow" href="https://inc.in" target="_blank" rel="noopener noreferrer">inc.in ↗</a></p>
          </div>
          <div className="pillars">
            {ideology.pillars.map((p, i) => (
              <article key={i} className="card pillar" data-reveal style={{ "--i": i }}>
                
                <h3>{t(p.t, lang)}</h3>
                <p>{t(p.d, lang)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section deco deco-c" id="values">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div>
              <p className="eyebrow">02</p>
              <h2 className="h-section">{a.values}</h2>
            </div>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <article key={i} className="card value" data-reveal style={{ "--i": i }}>
                
                <div>
                  <h3>{t(v.t, lang)}</h3>
                  <p>{t(v.d, lang)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="section newsroom-sec" id="vision">
        <div className="wrap vision">
          <div data-reveal>
            <p className="eyebrow" style={{ color: "var(--yellow)" }}>03 · {a.vision}</p>
            <blockquote>“{t(vision.quote, lang)}”</blockquote>
            <Link href={`/${lang}/leadership/${president.id}`} className="vision-by">
              <span className="leader-photo" aria-hidden="true">{president.initials}</span>
              <span><b>{t(president.name, lang)}</b><br />{a.visionBy}</span>
            </Link>
          </div>
          <ul className="vision-points" data-reveal style={{ "--i": 1 }}>
            {vision.points.map((p, i) => <li key={i}>{t(p, lang)}</li>)}
          </ul>
        </div>
      </section>

      {/* Manifesto teaser */}
      <section className="section deco deco-b" id="manifesto">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div>
              <p className="eyebrow">04</p>
              <h2 className="h-section">{a.manifesto}</h2>
              <p>{a.manifestoLead}</p>
            </div>
            <Link className="link-arrow" href={`/${lang}/manifesto`}>{a.readManifesto} →</Link>
          </div>
          <div className="promise-cards">
            {manifesto.map((m, i) => (
              <Link key={m.id} href={`/${lang}/manifesto#${m.id}`} className="card card-link promise-card" data-reveal style={{ "--i": i }}>
                
                <h3>{t(m.t, lang)}</h3>
                <p>{t(m.items[0], lang)}</p>
                <span className="go">{fill(d.manifesto.promises, { n: formatNumber(m.items.length, lang) })}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section deco deco-a">
        <div className="wrap more-grid">
          <Link href={`/${lang}/history`} className="card card-link more" data-reveal>
            
            <div><h3>{a.history} →</h3><p>{a.historySoon}</p></div>
          </Link>
          <Link href={`/${lang}/inspiration`} className="card card-link more" data-reveal style={{ "--i": 1 }}>
            
            <div><h3>{d.inspiration.eyebrow} →</h3><p>{d.inspiration.lead}</p></div>
          </Link>
          <Link href={`/${lang}/leadership`} className="card card-link more" data-reveal style={{ "--i": 2 }}>
            
            <div><h3>{a.leaders} →</h3><p>{d.leaders.sub}</p></div>
          </Link>
        </div>
      </section>
    </>
  );
}
