import { notFound } from "next/navigation";
import { getDictionary, t } from "@/i18n/config";
import { groups, findGroup } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import ShareButtons from "@/components/ShareButtons";
import Icon from "@/components/Icon";

export function generateStaticParams() {
  return groups.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const g = findGroup(id);
  return g ? { title: t(g.name, lang), description: t(g.short, lang) } : {};
}

// Informative page for one organisation: brief info + who heads it + a number to call.
export default async function GroupPage({ params }) {
  const { lang, id } = await params;
  const gr = findGroup(id);
  if (!gr) notFound();
  const d = getDictionary(lang);
  const o = d.org;

  return (
    <>
      <PageHead
        crumbHref={`/${lang}/groups`}
        crumbLabel={o.viewAll}
        badges={<span className="pill" style={{ background: "var(--cream-2)" }}>{o.cats[gr.category]}</span>}
        title={t(gr.name, lang)}
        lead={t(gr.short, lang)}
      />
      <div className="wrap detail">
        <div>
          <div className="prose" data-reveal>
            <h2>{o.about}</h2>
            <p>{o.aboutPh}</p>
          </div>
          <ShareButtons title={t(gr.name, lang)} c={d.common} />
        </div>
        <aside>
          <div className="card org-contact" style={{ "--g": gr.color }}>
            <span className="camp-band" aria-hidden="true" />
            <p className="eyebrow" style={{ margin: 0 }}>{o.contactTitle}</p>
            <small className="org-cat">{o.head}</small>
            <b style={{ fontSize: 19 }}>{t(gr.head, lang)}</b>
            <a href={`tel:${gr.phone.replace(/\s/g, "")}`} className="btn btn-saffron"><Icon name="phone" /> {gr.phone}</a>
            <p className="form-note">{o.phoneNote}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
