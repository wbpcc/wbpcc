import { getDictionary, t, fill, formatNumber } from "@/i18n/config";
import { manifesto } from "@/data/pages";
import PageHead from "@/components/PageHead";
import ShareButtons from "@/components/ShareButtons";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).manifesto.eyebrow };
}

export default async function ManifestoPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const m = d.manifesto;
  let n = 0;

  return (
    <>
      <PageHead crumbHref={`/${lang}/about`} crumbLabel={d.about.title} eyebrow={m.eyebrow} title={m.title} lead={m.lead} />
      <nav className="wrap jump" aria-label={d.about.jump}>
        {manifesto.map((c) => <a key={c.id} href={`#${c.id}`}>{t(c.t, lang)}</a>)}
      </nav>
      <div className="wrap detail">
        <div className="accordion">
          {manifesto.map((c, ci) => (
            <details key={c.id} id={c.id} className="card" open={ci < 2} data-reveal style={{ "--i": ci }}>
              <summary>
                
                <span>{t(c.t, lang)}</span>
                <small>{fill(m.promises, { n: formatNumber(c.items.length, lang) })}</small>
              </summary>
              <ol className="promises">
                {c.items.map((it, i) => {
                  n += 1;
                  return (
                    <li key={i}>
                      <b>{formatNumber(n, lang)}</b>
                      <span>{t(it, lang)}</span>
                    </li>
                  );
                })}
              </ol>
            </details>
          ))}
        </div>
        <aside>
          <div className="card" style={{ display: "grid", gap: 12 }}>
            <span className="badge-kind" style={{ justifySelf: "start" }}>PDF</span>
            <button className="btn btn-navy" disabled><Icon name="download" /> {m.pdf}</button>
            <p className="form-note">{m.pdfSoon}</p>
            <ShareButtons title={m.title} c={d.common} />
          </div>
        </aside>
      </div>
    </>
  );
}
