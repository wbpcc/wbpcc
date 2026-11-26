import { getDictionary, t, intlLocale } from "@/i18n/config";
import { posts, districts } from "@/data/placeholder";
import PageHead from "@/components/PageHead";
import NewsArchive from "@/components/NewsArchive";
import { PLATFORM } from "@/components/PostCard";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDictionary(lang).nav.newsroom };
}

// The news archive: everything posted or picked up from our channels,
// newest first, grouped by month, with a year/month filter.
export default async function NewsroomPage({ params }) {
  const { lang } = await params;
  const d = getDictionary(lang);
  const n = d.news;
  const kind = (p) => (p.kind === "statement" ? n.official : p.kind === "report" ? n.report : p.kind === "explainer" ? n.explainer : n.story);
  const items = posts.map((p) => ({
    id: p.id,
    href: `/${lang}/newsroom/${p.id}`,
    date: p.date,
    title: t(p.title, lang),
    excerpt: t(p.excerpt, lang),
    meta: [kind(p), PLATFORM[p.platform] || n.blog, p.district && districts[p.district] ? t(districts[p.district], lang) : null].filter(Boolean).join(" · "),
    icon: p.format === "blog" ? "doc" : "play",
  }));

  return (
    <>
      <PageHead crumbHref={`/${lang}`} crumbLabel={d.nav.home} eyebrow={n.eyebrow} title={n.title} lead={n.sub} />
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <NewsArchive items={items} lang={lang} locale={intlLocale[lang]} />
        </div>
      </section>
    </>
  );
}
