import Link from "next/link";
import { getDictionary, t } from "@/i18n/config";
import { brandColours, hq } from "@/data/pages";
import { leaders, posts } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import { postDate } from "@/components/PostCard";
import { CopyText } from "@/components/InfoForms";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).press.title };
}

export default async function PressKitPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const s = d.press;
  const statements = posts.filter((p) => p.kind === "statement");

  return (
    <>
      <PageHead crumbHref={`/${lang}/newsroom`} crumbLabel={d.nav.newsroom} eyebrow={s.eyebrow} title={s.title} lead={s.lead} />
      <section className="section deco deco-a" style={{ paddingTop: 36 }}>
        <div className="wrap press-grid">
          <div className="card" data-reveal>
            <h2>{s.contact}</h2>
            <div className="fact"><i><Icon name="mail" /></i><div><b>{s.contact}</b><a className="link-arrow" href={`mailto:${hq.media}`}>{hq.media}</a></div></div>
            <div className="fact" style={{ marginTop: 10 }}><i><Icon name="phone" /></i><div><b>{d.contact.phone}</b><span>{hq.phone}</span></div></div>
          </div>

          <div className="card" data-reveal style={{ "--i": 1 }}>
            <h2>{s.logo}</h2>
            <div className="logo-tiles">
              <div className="logo-tile"><img src="/brand/logo.svg" alt="WBPCC logo" width={84} height={84} /></div>
              <div className="logo-tile dark"><img src="/brand/logo.svg" alt="WBPCC logo on navy" width={84} height={84} /></div>
            </div>
            <a className="btn btn-navy btn-sm" href="/brand/logo.svg" download="wbpcc-logo.svg" style={{ marginTop: 12 }}><Icon name="download" /> {s.download} (SVG)</a>
          </div>

          <div className="card" data-reveal style={{ "--i": 2 }}>
            <h2>{s.colours}</h2>
            <div className="swatches">
              {brandColours.map((c) => (
                <div key={c.hex} className="swatch">
                  <span style={{ background: c.hex }} />
                  <b>{c.name}</b>
                  <code>{c.hex}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="card" data-reveal style={{ "--i": 3 }}>
            <h2>{s.fonts}</h2>
            <p className="font-sample head">Barlow Condensed</p>
            <p className="font-sample head" lang="bn">অনেক বাংলা শিরোনাম</p>
            <p className="font-sample head" lang="hi">अनेक देवनागरी शीर्षक</p>
            <p style={{ color: "var(--muted)", margin: 0 }}>{s.fontsText}</p>
          </div>

          <div className="card wide" data-reveal>
            <h2>{s.photos}</h2>
            <div className="photo-row">
              {leaders.slice(0, 4).map((l) => (
                <div key={l.id} className="photo-slot">
                  <span className="leader-photo" aria-hidden="true">{l.initials}</span>
                  <small>{t(l.role, lang)}</small>
                </div>
              ))}
            </div>
            <p className="form-note">{s.photosSoon}</p>
          </div>

          <div className="card wide" data-reveal>
            <h2>{s.boilerplate}</h2>
            <p className="big-text" style={{ margin: "0 0 12px" }}>{s.boilerplateText}</p>
            <CopyText text={s.boilerplateText} label={s.copy} done={s.copied} />
          </div>

          <div className="card wide" data-reveal>
            <h2>{s.statements}</h2>
            <ul className="office-list">
              {statements.map((p) => (
                <li key={p.id}>
                  <span><code>{p.statementId}</code> · {t(p.title, lang)} · {postDate(p, lang)}</span>
                  <Link className="link-arrow" href={`/${lang}/newsroom/${p.id}`}>{d.common.readMore} →</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
