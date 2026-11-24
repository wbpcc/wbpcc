import Link from "next/link";
import { getDictionary, formatNumber } from "@/i18n/config";
import PageHead from "@/components/PageHead";
import { JoinForm } from "@/components/PublicForms";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).header.joinLong };
}

// The membership steps live here (not on the homepage), next to the form.
export default async function JoinPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const j = d.join;
  const contribHrefs = [`/${lang}/contact?type=volunteer`, `/${lang}/petitions`, `/${lang}/contact?type=grievance`, `/${lang}/groups`];

  return (
    <>
      <PageHead crumbHref={`/${lang}`} crumbLabel={d.nav.home} eyebrow={j.eyebrow} title={j.title} lead={j.sub} />
      <div className="wrap detail">
        <div>
          <JoinForm lang={lang} j={d.joinForm} c={d.common} />
        </div>
        <aside>
          <ol className="steps" style={{ gridTemplateColumns: "1fr" }}>
            {j.steps.map((s, i) => (
              <li key={i} className="step" data-reveal style={{ "--i": i }}>
                <span className="step-num">{formatNumber(i + 1, lang)}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="privacy-note" data-reveal><span aria-hidden="true"><Icon name="lock" /></span><span>{j.privacy}</span></p>
          <h2 style={{ marginTop: 36 }}>{j.contribTitle}</h2>
          <div className="contrib-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {j.contrib.map((c, i) => (
              <Link key={c.t} href={contribHrefs[i]} className="card card-link contrib" data-reveal style={{ "--i": i }}>
                
                <b>{c.t}</b>
                <span>{c.d}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
