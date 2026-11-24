import { getDictionary, t } from "@/i18n/config";
import { history } from "@/data/pages";
import PageHead from "@/components/PageHead";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).history.title };
}

// Bengal in the Congress story — a simple timeline.
export default async function HistoryPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const h = d.history;
  return (
    <>
      <PageHead crumbHref={`/${lang}/about`} crumbLabel={d.about.title} eyebrow={h.eyebrow} title={h.title} lead={h.lead} />
      <section className="section deco deco-a">
        <div className="wrap">
          <ol className="timeline">
            {history.map((e, i) => (
              <li key={e.year} data-reveal style={{ "--i": i % 3 }}>
                <span className="tl-year">{e.year === "Today" ? t({ en: "Today", bn: "আজ", hi: "आज" }, lang) : e.year}</span>
                <div className="card tl-card">
                  <h3>{t(e.t, lang)}</h3>
                  <p>{t(e.d, lang)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="form-note" style={{ marginTop: 24 }}>{h.note}</p>
        </div>
      </section>
    </>
  );
}
