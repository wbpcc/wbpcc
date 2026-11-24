import Link from "next/link";
import { social } from "@/data/placeholder";

export default function Footer({ lang, d }) {
  const f = d.footer;
  const L = (p) => `/${lang}/${p}`;
  return (
    <footer className="footer">
      <div className="tricolour" aria-hidden="true"><span /><span /><span /></div>
      <div className="wrap">
        <div className="footer-top">
          <div>
            <div className="brand" style={{ marginBottom: 14 }}>
              <img src="/brand/logo.svg" alt="" width={52} height={52} />
              <span className="brand-words">
                <span className="bn">পশ্চিমবঙ্গ প্রদেশ কংগ্রেস</span>
                <span className="hi">पश्चिम बंगाल प्रदेश कांग्रेस</span>
                <span className="en">WEST BENGAL PRADESH CONGRESS</span>
              </span>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 15 }}>{f.address}</p>
            <div className="socials" aria-label={f.follow}>
              {social.links.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}>{s.label}</a>
              ))}
            </div>
            <p style={{ marginTop: 10, fontSize: 14 }}>@{social.handle}</p>
          </div>
          <div>
            <h4>{f.aboutCol}</h4>
            <ul>
              <li><Link href={L("about")}>{f.ideology}</Link></li>
              <li><Link href={L("manifesto")}>{f.manifesto}</Link></li>
              <li><Link href={L("leadership")}>{d.nav.leadership}</Link></li>
              <li><Link href={L("history")}>{f.history}</Link></li>
              <li><Link href={L("inspiration")}>{d.inspiration.eyebrow}</Link></li>
              <li><Link href={L("appointment")}>{d.committee.appointment}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{f.takePart}</h4>
            <ul>
              <li><Link href={L("join")}>{d.header.join}</Link></li>
              <li><Link href={L("events")}>{d.happening.allEvents}</Link></li>
              <li><Link href={L("petitions")}>{d.action.viewAll}</Link></li>
              <li><Link href={L("groups")}>{d.org.title}</Link></li>
              <li><Link href={L("contact")}>{f.feedback}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{f.media}</h4>
            <ul>
              <li><Link href={L("newsroom")}>{f.statements}</Link></li>
              <li><Link href={`/${lang}/newsroom#verify`}>{f.verify}</Link></li>
              <li><Link href={L("press-kit")}>{f.pressKit}</Link></li>
              {lang !== "en" && (
                <li id="report-translation"><Link href={L("contact")}>{d.tnotice.report}</Link></li>
              )}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="tagline">{f.tagline}</span>
          <span>
            {f.rights} · <Link href={L("privacy")}>{f.privacy}</Link> · <Link href={L("terms")}>{f.terms}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
