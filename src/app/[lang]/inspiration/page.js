import { getDictionary } from "@/i18n/config";
import { inspiration } from "@/data/inspiration";
import PageHead from "@/components/PageHead";
import { PersonCard } from "@/components/Inspiration";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).inspiration.title };
}

export default async function InspirationPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const s = d.inspiration;
  return (
    <>
      <PageHead crumbHref={`/${lang}/about`} crumbLabel={d.about.title} eyebrow={s.eyebrow} title={s.title} lead={s.lead} />
      {[["bengal", s.bengal, "deco-a"], ["national", s.national, "deco-c"]].map(([g, title, deco]) => (
        <section key={g} className={`section deco ${deco}`}>
          <div className="wrap">
            <h2 className="org-block-title" data-reveal>{title}</h2>
            <div className="person-grid">
              {inspiration.filter((p) => p.group === g).map((p, i) => <PersonCard key={p.id} p={p} lang={lang} i={i} />)}
            </div>
          </div>
        </section>
      ))}
      <div className="wrap"><p className="form-note" style={{ margin: "0 0 40px" }}>{s.photoNote}</p></div>
    </>
  );
}
